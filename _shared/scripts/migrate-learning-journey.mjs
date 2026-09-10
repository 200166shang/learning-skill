#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectLearningWorkspace, upgradeLearningWorkspace } from "../lib/learning-workspace.mjs";

export function migrateLearningJourney(workspace) {
  const root = path.resolve(workspace);
  const inspection = inspectLearningWorkspace(root);
  if (inspection.status !== "legacy") {
    if (inspection.status === "canonical-unversioned" || inspection.status === "current") throw new Error(`journey already exists: ${inspection.journey.path}`);
    throw new Error(`workspace is not legacy: ${inspection.status}`);
  }
  const result = upgradeLearningWorkspace(root, inspection);
  const current = inspectLearningWorkspace(root);
  return { target: current.journey.path, questions: current.journey.journey.questions.length, warnings: result.warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const workspace = process.argv[2];
  if (!workspace) {
    process.stderr.write("usage: node migrate-learning-journey.mjs <workspace>\n");
    process.exitCode = 2;
  } else {
    try {
      const result = migrateLearningJourney(workspace);
      for (const warning of result.warnings) process.stdout.write(`warning: ${warning}\n`);
      process.stdout.write(`migrated: ${result.target} (${result.questions} questions)\n`);
    } catch (error) {
      process.stderr.write(`error: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
