#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executePracticeCommand, inspectPracticeWorkspace } from "../lib/practice-runtime.mjs";
const [workspace, command] = process.argv.slice(2); if (!workspace) { console.error("usage: practice.mjs <workspace> [list] < intent.json"); process.exit(2); }
try { const result = command === "list" ? inspectPracticeWorkspace(workspace, { targetId: process.argv[4] }) : executePracticeCommand(workspace, JSON.parse(readFileSync(0, "utf8"))); if (result.status !== "current") throw new Error(result.warnings?.join("; ") || result.reason); console.log(JSON.stringify({ tasks: result.tasks.tasks, attempts: result.history.attempts }, null, 2)); } catch (error) { console.error(error.message); process.exit(1); }
