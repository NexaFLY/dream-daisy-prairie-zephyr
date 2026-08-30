#!/usr/bin/env node
/**
 * PGLite's wasm/data files are loaded via `new URL("./pglite.wasm", import.meta.url)`.
 * Nitro traces the JS but not always those sidecar files. Copy them next to any
 * bundled pglite chunk so serverless (Vercel + Netlify) can boot the embedded DB.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "node_modules/@electric-sql/pglite/dist");
const FILES = ["pglite.data", "pglite.wasm", "initdb.wasm"];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function copyInto(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const file of FILES) {
    const from = join(SRC, file);
    if (!existsSync(from)) continue;
    copyFileSync(from, join(dir, file));
  }
}

const dests = new Set();
for (const root of [
  join(ROOT, ".vercel/output/functions"),
  join(ROOT, ".netlify/functions-internal"),
  join(ROOT, ".netlify/edge-functions"),
]) {
  for (const file of walk(root)) {
    const base = file.replace(/\\/g, "/");
    if (base.includes("electric-sql") && base.endsWith(".mjs")) {
      dests.add(dirname(file));
    }
    if (base.endsWith("/_libs") || base.includes("/_libs/")) {
      dests.add(base.includes("/_libs/") ? join(dirname(file)) : file);
    }
  }
  if (existsSync(join(root, "__server.func/_libs"))) {
    dests.add(join(root, "__server.func/_libs"));
  }
  if (existsSync(join(root, "server"))) dests.add(join(root, "server"));
  if (existsSync(root)) dests.add(root);
}

// Always try the known Vercel libs path.
dests.add(join(ROOT, ".vercel/output/functions/__server.func/_libs"));

let copied = 0;
for (const dir of dests) {
  if (!existsSync(dirname(dir)) && !existsSync(dir)) continue;
  if (!existsSync(SRC)) break;
  try {
    copyInto(dir);
    copied += 1;
  } catch {
    /* skip unwritable */
  }
}
console.log(`[pglite] copied wasm/data into ${copied} output dir(s)`);
