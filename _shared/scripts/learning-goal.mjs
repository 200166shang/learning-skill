#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executeLearningGoalCommand } from "../lib/learning-goal-runtime.mjs";
const workspace = process.argv[2];
if (!workspace) { console.error("usage: learning-goal.mjs <workspace> < intent.json"); process.exit(2); }
try { console.log(JSON.stringify(executeLearningGoalCommand(workspace, JSON.parse(readFileSync(0, "utf8"))), null, 2)); }
catch (error) { console.error(error.message); process.exit(1); }
