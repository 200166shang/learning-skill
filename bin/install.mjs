#!/usr/bin/env node

import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skills = [
  "learning",
  "learning-learn",
  "learning-review",
  "learning-practice",
  "learning-resources",
  "learning-organize",
];

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Install the Learning V6 skills for Codex.

Usage:
  npx learning-skill [skills-directory]

Defaults to $CODEX_HOME/skills, or ~/.codex/skills when CODEX_HOME is unset.`);
  process.exit(0);
}

if (args.length > 1 || args[0]?.startsWith("-")) {
  console.error("Usage: npx learning-skill [skills-directory]");
  process.exit(1);
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const codexRoot = process.env.CODEX_HOME || join(homedir(), ".codex");
const skillsDir = resolve(args[0] || join(codexRoot, "skills"));

await mkdir(skillsDir, { recursive: true });
await rm(join(skillsDir, "learning-research"), { recursive: true, force: true });

for (const skill of skills) {
  const target = join(skillsDir, skill);
  await rm(target, { recursive: true, force: true });
  await cp(join(packageRoot, skill), target, { recursive: true });
}

console.log(`Installed six Learning V6 skills to ${skillsDir}`);
