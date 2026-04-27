#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const newName = process.argv[2];
if (!newName) {
  console.error("Usage: npm run rename <project-name>");
  console.error("  e.g. npm run rename my-new-chart");
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(newName)) {
  console.error(
    `Invalid name "${newName}". Use lowercase letters, digits, and hyphens (must start with a letter or digit).`,
  );
  process.exit(1);
}

const pkgPath = resolve(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const oldName = pkg.name;
pkg.name = newName;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const vitePath = resolve(root, "vite.config.js");
const vite = readFileSync(vitePath, "utf8");
const updated = vite.replace(
  /base:\s*["'`]\/[^"'`]*\/["'`]/,
  `base: "/${newName}/"`,
);
if (updated === vite) {
  console.error(`Could not find a base: "/.../" line in ${vitePath}`);
  process.exit(1);
}
writeFileSync(vitePath, updated);

console.log(`Renamed: ${oldName} → ${newName}`);
console.log(`  package.json   name  → "${newName}"`);
console.log(`  vite.config.js base  → "/${newName}/"`);
console.log(`\nNext: git add -A && git commit -m "Rename to ${newName}"`);
