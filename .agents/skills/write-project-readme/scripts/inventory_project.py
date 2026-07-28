#!/usr/bin/env python3
"""Create a read-only index of likely project context for README work."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from pathlib import Path

SKIP_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".output",
    ".ruff_cache",
    ".turbo",
    ".venv",
    ".yarn",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "outputs",
    "playwright-report",
    "target",
    "test-results",
    "vendor",
}

MANIFEST_NAMES = {
    "cargo.toml",
    "composer.json",
    "deno.json",
    "deno.jsonc",
    "gemfile",
    "go.mod",
    "mix.exs",
    "package.json",
    "pnpm-workspace.yaml",
    "pom.xml",
    "pubspec.yaml",
    "pyproject.toml",
    "requirements.txt",
}

INSTRUCTION_NAMES = {
    "agents.md",
    "claude.md",
    "code_of_conduct.md",
    "contributing.md",
    "copilot-instructions.md",
}

PRIMARY_CONTEXT_NAMES = {
    "architecture.md",
    "brand-voice.md",
    "business.md",
    "design.md",
    "identity.md",
    "index.md",
    "native-register.md",
    "prd.md",
    "product.md",
    "project-dna.md",
    "project.md",
    "spec.md",
    "vision.md",
}

STATUS_NAMES = {
    "changelog.md",
    "handoff.md",
    "progress.md",
    "release.md",
    "roadmap.md",
    "status.md",
}

DEPLOYMENT_NAMES = {
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "netlify.toml",
    "render.yaml",
    "vercel.json",
}

IMAGE_EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
ASSET_TERMS = {"banner", "cover", "hero", "logo", "og"}
SOURCE_DIRS = {"app", "apps", "cmd", "lib", "packages", "pages", "services", "src"}
TEST_DIRS = {"__tests__", "e2e", "test", "tests"}


@dataclass(frozen=True)
class Candidate:
    priority: int
    category: str
    path: str
    reason: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Index likely sources of truth before writing a project README."
    )
    parser.add_argument("root", nargs="?", default=".", help="Repository root.")
    parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
        help="Output format.",
    )
    parser.add_argument(
        "--max-candidates",
        type=int,
        default=80,
        help="Maximum ranked context files to print.",
    )
    return parser.parse_args()


def iter_files(root: Path) -> Iterable[Path]:
    for directory, dirnames, filenames in os.walk(root, topdown=True):
        current_parts = tuple(
            part.lower() for part in Path(directory).relative_to(root).parts
        )
        excluded_paths = {
            (".agents", "skills"),
            (".claude", "skills"),
            (".codex", "skills"),
        }
        included_directories = []
        for name in dirnames:
            if name.lower() in SKIP_DIRS:
                continue
            candidate = (*current_parts, name.lower())
            if candidate not in excluded_paths:
                included_directories.append(name)

        dirnames[:] = sorted(included_directories, key=str.lower)
        for filename in sorted(filenames, key=str.lower):
            yield Path(directory, filename)


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def classify(path: Path, root: Path) -> Candidate | None:
    rel = relative(path, root)
    name = path.name.lower()
    parts = {part.lower() for part in path.relative_to(root).parts[:-1]}

    if name in INSTRUCTION_NAMES:
        return Candidate(100, "instructions", rel, "Repository or contribution rules")

    if name == "readme.md":
        if path.parent == root:
            return Candidate(72, "existing README", rel, "Current root README")
        if parts.intersection({"spec", "specs", "docs", "documentation"}):
            depth = len(path.relative_to(root).parts)
            priority = 94 if depth <= 3 else 82
            return Candidate(
                priority,
                "context index",
                rel,
                "Specification or documentation index",
            )
        if parts.intersection({"app", "apps", "packages", "services"}):
            return Candidate(
                68, "component README", rel, "App, package, or service context"
            )
        return Candidate(64, "nested README", rel, "Local project context")

    if name in PRIMARY_CONTEXT_NAMES:
        if name == "index.md":
            depth = len(path.relative_to(root).parts)
            priority = 92 if depth <= 2 else 84
        elif name == "architecture.md":
            priority = 88
        else:
            priority = (
                96
                if parts.intersection({"identity", "product", "spec", "specs"})
                else 90
            )
        return Candidate(
            priority, "project context", rel, "Product, identity, or system source"
        )

    if name in STATUS_NAMES or name.startswith("session-"):
        return Candidate(
            86, "status", rel, "Status, release, roadmap, or session record"
        )

    if name in MANIFEST_NAMES or name.endswith((".csproj", ".sln")):
        return Candidate(78, "manifest", rel, "Technology and workspace evidence")

    if name in DEPLOYMENT_NAMES or ".github/workflows" in rel.lower():
        return Candidate(
            66, "delivery", rel, "Deployment or continuous integration context"
        )

    stem_terms = set(path.stem.lower().replace("_", "-").split("-"))
    if path.suffix.lower() in IMAGE_EXTENSIONS and stem_terms.intersection(ASSET_TERMS):
        return Candidate(
            58, "visual asset", rel, "Possible README cover, logo, or banner"
        )

    return None


def directory_summary(root: Path) -> dict[str, list[str]]:
    top_level_dirs = [
        path.name
        for path in root.iterdir()
        if path.is_dir() and path.name.lower() not in SKIP_DIRS
    ]
    lowered = {name.lower(): name for name in top_level_dirs}
    return {
        "source_roots": sorted(
            lowered[name] for name in SOURCE_DIRS if name in lowered
        ),
        "test_roots": sorted(lowered[name] for name in TEST_DIRS if name in lowered),
        "top_level_directories": sorted(top_level_dirs, key=str.lower),
    }


def run_git(root: Path, args: list[str]) -> str | None:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), *args],
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def git_summary(root: Path) -> dict[str, str | None]:
    root_commits = run_git(root, ["rev-list", "--max-parents=0", "HEAD"])
    first_commit = root_commits.splitlines()[0] if root_commits else None
    first_commit_date = (
        run_git(root, ["show", "-s", "--format=%ad", "--date=short", first_commit])
        if first_commit
        else None
    )
    return {
        "branch": run_git(root, ["branch", "--show-current"]),
        "first_commit_date": first_commit_date,
        "latest_commit_date": run_git(
            root, ["log", "-1", "--format=%ad", "--date=short"]
        ),
        "latest_commit": run_git(root, ["log", "-1", "--format=%h %s"]),
    }


def build_inventory(root: Path, max_candidates: int) -> dict[str, object]:
    candidates = [
        candidate
        for path in iter_files(root)
        if (candidate := classify(path, root)) is not None
    ]
    candidates.sort(key=lambda item: (-item.priority, item.path.lower()))
    return {
        "root": str(root),
        "candidates": [asdict(item) for item in candidates[:max_candidates]],
        "directories": directory_summary(root),
        "git": git_summary(root),
    }


def markdown(inventory: dict[str, object]) -> str:
    lines = [
        "# Project context inventory",
        "",
        f"Root: `{inventory['root']}`",
        "",
        "## Read first",
        "",
        "| Priority | Category | Path | Why |",
        "| ---: | --- | --- | --- |",
    ]
    for item in inventory["candidates"]:
        lines.append(
            f"| {item['priority']} | {item['category']} | `{item['path']}` | {item['reason']} |"
        )

    directories = inventory["directories"]
    lines.extend(
        [
            "",
            "## Repository shape",
            "",
            f"- Source roots: {', '.join(directories['source_roots']) or 'None detected'}",
            f"- Test roots: {', '.join(directories['test_roots']) or 'None detected'}",
            f"- Top-level directories: {', '.join(directories['top_level_directories']) or 'None'}",
            "",
            "## Git",
            "",
        ]
    )
    git = inventory["git"]
    for key, value in git.items():
        label = key.replace("_", " ").capitalize()
        lines.append(f"- {label}: {value or 'Unavailable'}")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    if not root.is_dir():
        raise SystemExit(f"Not a directory: {root}")
    if args.max_candidates < 1:
        raise SystemExit("--max-candidates must be at least 1")

    inventory = build_inventory(root, args.max_candidates)
    if args.format == "json":
        print(json.dumps(inventory, indent=2))
    else:
        print(markdown(inventory))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
