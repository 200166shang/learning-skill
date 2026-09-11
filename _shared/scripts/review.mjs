#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executeReviewCommand, inspectReviewWorkspace } from "../lib/review-runtime.mjs";
const [workspace, command] = process.argv.slice(2); if (!workspace) { console.error("usage: review.mjs <workspace> [list] < intent.json"); process.exit(2); }
try { const result = command === "list" ? inspectReviewWorkspace(workspace, { targetId: process.argv[4] }) : executeReviewCommand(workspace, JSON.parse(readFileSync(0, "utf8"))); if (result.status !== "current") throw new Error(result.warnings?.join("; ") || result.reason); console.log(JSON.stringify({ items: result.items.items, attempts: result.history.attempts }, null, 2)); } catch (error) { console.error(error.message); process.exit(1); }
