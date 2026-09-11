#!/usr/bin/env node
import { inspectLearningWorkspace } from "../lib/learning-workspace.mjs";
import { projectLearningView, renderLearningView } from "../lib/learning-view.mjs";
const args = process.argv.slice(2), value = (flag, fallback) => { const index = args.indexOf(flag); return index < 0 ? fallback : args[index + 1]; };
const workspace = value("--workspace", "."), format = value("--format", "text"), inspection = inspectLearningWorkspace(workspace);
if (inspection.status !== "current") { console.error(`learning workspace is ${inspection.status}: ${inspection.warnings?.join("; ") || inspection.reason || "not canonical"}`); process.exit(1); }
try { process.stdout.write(renderLearningView(projectLearningView(inspection.journey.journey, inspection.evidence.evidence, inspection.state.state, inspection.targets.targets), format)); }
catch (error) { console.error(error.message); process.exit(2); }
