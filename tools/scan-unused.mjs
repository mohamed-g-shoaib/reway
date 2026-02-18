import fs from "node:fs";
import path from "node:path";

const root = path.resolve("d:/Developer/reway");
const excludePrefixes = [".next", "node_modules", ".git"].map((p) =>
  path.join(root, p),
);

function shouldExclude(p) {
  return excludePrefixes.some((e) => p.startsWith(e));
}

function walk(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (shouldExclude(p)) continue;
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(p)) out.push(p);
  }
  return out;
}

function isEntryFile(p) {
  return (
    /\/(page|layout)\.(ts|tsx)$/.test(p) ||
    /\/route\.(ts|js)$/.test(p) ||
    /\/middleware\.(ts|js)$/.test(p)
  );
}

const files = walk(root, []);
let contents = "";
for (const f of files) {
  try {
    contents += fs.readFileSync(f, "utf8") + "\n";
  } catch {
    // ignore
  }
}

const candidates = [];
for (const f of files) {
  if (isEntryFile(f)) continue;
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (!/^(app|components|lib|hooks|types)\//.test(rel)) continue;

  const noExt = rel.replace(/\.(ts|tsx|js|jsx)$/, "");
  const forms = [
    noExt,
    `@/${noExt}`,
    noExt.replace(/^components\//, "@/components/"),
    noExt.replace(/^lib\//, "@/lib/"),
    noExt.replace(/^hooks\//, "@/hooks/"),
    noExt.replace(/^types\//, "@/types/"),
    noExt.replace(/^app\//, "@/app/"),
  ];

  const hit = forms.some((s) => contents.includes(`\"${s}\"`));
  if (!hit) candidates.push(rel);
}

const highSignal = candidates
  .filter((r) => r.startsWith("components/dashboard/"))
  .sort();

const result = {
  total: files.length,
  candidateCount: candidates.length,
  highSignalCount: highSignal.length,
  highSignal,
  candidates,
};

process.stdout.write(JSON.stringify(result, null, 2));
