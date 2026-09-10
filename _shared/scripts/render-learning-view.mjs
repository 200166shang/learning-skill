#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildLearningView } from "../lib/learning-view-model.mjs";

const workspace = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!workspace) {
  process.stderr.write("usage: node render-learning-view.mjs <workspace>\n");
  process.exitCode = 2;
} else {
  const output = path.join(workspace, ".learning", "learning-view.json");
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(buildLearningView(workspace), null, 2)}\n`);
  process.stdout.write(`rendered: ${output}\n`);
}
