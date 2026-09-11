#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executeLearningTransition } from "../lib/learning-runtime.mjs";
const workspace = process.argv[2];
if (!workspace) { console.error("usage: learning-transition.mjs <workspace> < intent.json"); process.exit(2); }
try { const result = executeLearningTransition(workspace, JSON.parse(readFileSync(0, "utf8"))); console.log(JSON.stringify({ status: result.status, activeEpisodeId: result.state.state.activeEpisodeId, focusStack: result.state.state.focusStack })); }
catch (error) { console.error(error.message); process.exit(1); }
