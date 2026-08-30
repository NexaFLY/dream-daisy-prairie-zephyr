#!/usr/bin/env node
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "artifacts");
const ZIP = join(OUT_DIR, "nexa-fly-netlify.zip");
const STAGE = join(OUT_DIR, "nexa-fly-netlify");

const SKIP_DIRS = new Set([
  "node_modules",
  ".vercel",
  ".netlify",
  "dist",
  ".output",
  ".tanstack",
  "screenshots",
  "artifacts",
  ".git",
  ".grok",
]);
const SKIP_FILES = new Set(["AGENTS.md", ".DS_Store"]);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || name.startsWith(".vite")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (!SKIP_FILES.has(name)) acc.push(full);
  }
  return acc;
}

function rimraf(dir) {
  spawnSync("rm", ["-rf", dir], { stdio: "ignore" });
}

mkdirSync(OUT_DIR, { recursive: true });
rimraf(STAGE);
mkdirSync(STAGE, { recursive: true });

const files = walk(ROOT);
for (const file of files) {
  const rel = relative(ROOT, file);
  const dest = join(STAGE, rel);
  mkdirSync(dirname(dest), { recursive: true });
  spawnSync("cp", ["-p", file, dest]);
}

if (existsSync(ZIP)) spawnSync("rm", ["-f", ZIP]);
const zipped = spawnSync("zip", ["-r", "-q", ZIP, "nexa-fly-netlify"], {
  cwd: OUT_DIR,
  stdio: "inherit",
});
if (zipped.status !== 0) {
  // Fallback: python zipfile
  spawnSync(
    "python3",
    [
      "-c",
      `import shutil; shutil.make_archive(${JSON.stringify(ZIP.replace(/\\.zip$/, ""))}, "zip", ${JSON.stringify(OUT_DIR)}, "nexa-fly-netlify")`,
    ],
    { stdio: "inherit" },
  );
}

const size = existsSync(ZIP) ? statSync(ZIP).size : 0;
console.log(`[pack] ${ZIP} (${(size / 1e6).toFixed(2)} MB, ${files.length} files)`);
