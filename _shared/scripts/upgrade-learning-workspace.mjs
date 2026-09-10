#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectLearningWorkspace, upgradeLearningWorkspace } from "../lib/learning-workspace.mjs";

const line = (label, value) => value ? `${label}: ${value}\n` : "";
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const workspace = process.argv[2];
  if (!workspace) {
    process.stderr.write("usage: node upgrade-learning-workspace.mjs <workspace>\n");
    process.exitCode = 2;
  } else {
    try {
      const result = upgradeLearningWorkspace(workspace);
      process.stdout.write(line("source", result.source));
      process.stdout.write(line("target schema", result.targetSchemaVersion));
      process.stdout.write(line("root question", result.rootQuestion));
      process.stdout.write(line("current question", result.currentQuestion));
      process.stdout.write(line("resume checkpoint", result.resumeCheckpoint));
      process.stdout.write(line("resume parent", result.resumeParentQuestion));
      for (const warning of result.warnings) process.stdout.write(`warning: ${warning}\n`);
      process.stdout.write(result.changed ? "upgrade complete; stop before continuing learning\n" : "no upgrade needed\n");
    } catch (error) {
      process.stderr.write(`error: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
