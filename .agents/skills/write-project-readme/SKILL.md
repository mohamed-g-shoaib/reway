---
name: write-project-readme
description: Research a repository and create or rewrite its root README as an evidence-based project introduction, product overview, agency case study, open-source guide, service reference, research record, or internal project guide. Use when the user asks to write, refresh, restructure, audit, or improve a README; turn a repository into portfolio or case-study copy; document an unfamiliar project from specs and code; remove stale README claims; or choose the right README structure for any business or technology.
---

# Write Project README

Create a README that explains the real project to its intended reader. Discover the project before choosing the structure. Do not force every repository into a developer setup guide or an agency case study.

## Workflow

### 1. Follow repository instructions

1. Find and read `AGENTS.md` and any instructions that apply to the target README.
2. Follow required startup, identity, writing, validation, and wrap-up steps.
3. Read an explicitly named tone, register, brand, or project-context file in its required order.
4. Treat the user's requested audience and use case as binding.

Do not edit before completing required repository startup steps.

### 2. Build a project context index

Run the bundled inventory from the repository root:

```bash
python .agents/skills/write-project-readme/scripts/inventory_project.py .
```

Use `--format json` when structured output will be easier to inspect. If Python is unavailable, reproduce the inventory with `rg --files`, repository metadata, and targeted directory listings.

The inventory ranks likely sources; it does not prove their claims. Read the highest-value candidates first, then follow links from canonical indexes. Search for:

- repository instructions and session rules
- product, identity, business, architecture, status, and release specs
- existing README files
- manifests and workspace files
- public routes, entry points, packages, services, and data models
- tests, CI, deployment, and release records
- Git history and named cover or banner assets

Stop broad discovery once purpose, audience, scope, status, main capabilities, technology, and suitable proof are clear. Continue only where sources conflict or a key claim lacks support.

### 3. Establish source authority

Use this default order, adjusting when repository instructions name a stronger source:

1. Current user request
2. Applicable repository instructions
3. Canonical product, identity, or system specification
4. Current implementation and configuration
5. Passing tests, release records, and generated artifacts
6. Recent Git history
7. Existing README and older planning notes
8. Comments, drafts, and inferred intent

Prefer current code over a stale plan for shipped behavior. Prefer a binding product spec over incidental implementation details for product intent. Never silently merge conflicting claims.

Create a small working ledger before drafting:

| Claim                 | Evidence               | State                       |
| --------------------- | ---------------------- | --------------------------- |
| What the project does | Source path or command | Verified                    |
| Current status        | Source path or command | Verified, dated, or unclear |
| Outcome or metric     | Source path or dataset | Verified or omit            |

Do not place the ledger in the README unless the user asks for it.

### 4. Choose the reader and README profile

Infer the primary reader from the user's request, repository visibility, existing copy, and project type. Ask only when the answer cannot be discovered and different choices would produce materially different README files.

Read [references/structure-patterns.md](references/structure-patterns.md), then choose one primary profile:

- agency case study
- application or product
- open-source library or framework
- API or service
- command-line tool
- research, data, or machine-learning project
- internal tool or service
- monorepo
- nontechnical business or initiative

Mix sections only when they serve the same primary reader. Do not retain installation details merely because the old README had them.

### 5. Draft from evidence

Lead with the project, not the stack:

1. Keep an intentional banner or cover at the top.
2. State the project name and concrete value in the first screen.
3. Explain the audience, problem, and scope before implementation detail.
4. Use specific capabilities and verified constraints instead of broad praise.
5. Separate shipped work, release candidates, planned work, and post-launch checks.
6. Include technology only to the depth the reader needs.
7. Include installation, usage, operations, contributing, or license sections only when they help the primary reader.
8. Link to deeper specs rather than copying large internal documents.

Write in the repository's native register. If none exists, use plain, direct language, short paragraphs, active voice, and the spelling convention already dominant in the project.

Never invent:

- customers, users, partners, or team size
- traffic, revenue, conversion, performance, or ranking results
- delivery dates unsupported by records
- production status
- security, compliance, accessibility, or scale claims
- features inferred only from names or unfinished plans

When the implementation proves a capability but not its business impact, describe the capability and omit the impact claim.

### 6. Edit with restraint

- Preserve useful existing facts, links, notices, badges, and assets.
- Remove stale, duplicated, generic, or reader-irrelevant sections.
- Keep headings easy to scan.
- Use tables for compact comparisons or project facts, not long prose.
- Avoid exhaustive file trees and dependency lists.
- Do not expose secrets, private URLs, internal credentials, or confidential records.
- Do not alter application code unless the user separately asks for it.

### 7. Validate

At minimum:

1. Run the repository's Markdown formatter or checker when one exists.
2. Run `git diff --check -- README.md`.
3. Confirm every local link and image target exists.
4. Search for stale names, placeholders, unsupported claims, and spelling conflicts.
5. Review the rendered heading order and first-screen summary.
6. Inspect the final diff for accidental loss of legal, license, support, or safety information.

Do not run the full application test suite for a README-only change unless repository instructions require it. State exactly what was and was not verified.

## Output

After editing, report:

- the README path
- the chosen profile and intended reader
- the main structural changes
- the evidence or status limits that shaped the copy
- validation performed

Do not call the README complete if required sources were missing, claims remain unresolved, or validation failed.
