#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executeLearningGoalCommand } from "../lib/learning-goal-runtime.mjs";
import { GOAL_INTENT_SCHEMA } from "../lib/learning-cli-contracts.mjs";
if (process.argv.includes("--help")) { console.log(`usage: learning-goal.mjs <workspace> < intent.json\n       learning-goal.mjs --schema\n\nCommands: create, add_roots, update, update_root, add_source, remove_source, close, list, show`); process.exit(0); }
if (process.argv.includes("--schema")) { console.log(JSON.stringify(GOAL_INTENT_SCHEMA, null, 2)); process.exit(0); }
const workspace = process.argv[2];
if (!workspace) { console.error("usage: learning-goal.mjs <workspace> < intent.json"); process.exit(2); }
try { console.log(JSON.stringify(executeLearningGoalCommand(workspace, JSON.parse(readFileSync(0, "utf8"))), null, 2)); }
catch (error) { console.error(error.message); process.exit(1); }
