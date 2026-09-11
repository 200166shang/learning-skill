import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-goal-view-"));
const goalCli = fileURLToPath(new URL("../scripts/learning-goal.mjs", import.meta.url));
const transitionCli = fileURLToPath(new URL("../scripts/learning-transition.mjs", import.meta.url));
const viewCli = fileURLToPath(new URL("../scripts/learning-view.mjs", import.meta.url));
const runIntent = (cli, workspace, intent) => { const result = spawnSync(process.execPath, [cli, workspace], { input: JSON.stringify(intent), encoding: "utf8" }); assert.equal(result.status, 0, result.stderr); return result.stdout; };
const view = (workspace, ...args) => { const result = spawnSync(process.execPath, [viewCli, "--workspace", workspace, ...args], { encoding: "utf8" }); assert.equal(result.status, 0, result.stderr); return result.stdout; };

test("fresh processes recover the complete topic-first lifecycle", () => {
  const workspace = temp();
  runIntent(goalCli, workspace, { type: "create", title: "XiaoMo robot LLM", objective: "Explain concepts, source code, and the full chain", sources: [{ ref: "/notes", role: "notes" }, { ref: "/robot", role: "code" }, { ref: "/course", role: "transcript" }], createdAt: "2026-09-11T02:00:00Z" });
  runIntent(goalCli, workspace, { type: "add_roots", goalId: "g001", questions: ["What role does the module play?", "How does language become robot action?", "Where is the chain implemented?"], acceptedAt: "2026-09-11T02:01:00Z" });
  let projection = JSON.parse(view(workspace, "--goal", "g001", "--format", "json"));
  assert.deepEqual(projection.roots.map((root) => root.derivedStatus), ["pending", "pending", "pending"]);

  runIntent(transitionCli, workspace, { type: "start", goalId: "g001", rootIntentId: "rq002", createdAt: "2026-09-11T02:02:00Z" });
  runIntent(transitionCli, workspace, { type: "push", question: "How is a tool dispatched?", whyNeeded: "Dispatch connects reasoning to executable code", resumeCheckpoint: "Return to the full action chain", accepted: true, relationship: "blocking", createdAt: "2026-09-11T02:03:00Z" });
  runIntent(transitionCli, workspace, { type: "push", question: "How is the ROS capability selected?", whyNeeded: "The adapter must resolve a concrete capability", resumeCheckpoint: "Continue from dispatch into ROS", accepted: true, relationship: "blocking", createdAt: "2026-09-11T02:04:00Z" });
  projection = JSON.parse(view(workspace, "--goal", "g001", "--format", "json"));
  assert.deepEqual(projection.roots[1].activePath.map((item) => item.questionId), ["q001", "q002", "q003"]);

  for (const minute of [5, 6]) runIntent(transitionCli, workspace, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["connection"], gaps: [], createdAt: `2026-09-11T02:0${minute}:00Z` });
  runIntent(transitionCli, workspace, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["full chain"], gaps: [], target: { title: "Language to robot action", kind: "concept" }, createdAt: "2026-09-11T02:07:00Z" });
  runIntent(goalCli, workspace, { type: "add_roots", goalId: "g001", questions: ["How does feedback affect later LLM decisions?"], acceptedAt: "2026-09-11T02:08:00Z" });
  projection = JSON.parse(view(workspace, "--goal", "g001", "--format", "json"));
  assert.deepEqual(projection.roots.map((root) => root.derivedStatus), ["pending", "completed", "pending", "pending"]);
  assert.deepEqual(projection.roots[1].targetIds, ["k001"]);

  runIntent(transitionCli, workspace, { type: "start", goalId: "g001", rootIntentId: "rq001", createdAt: "2026-09-11T02:09:00Z" });
  projection = JSON.parse(view(workspace, "--goal", "g001", "--format", "json"));
  assert.deepEqual(projection.roots.map((root) => root.derivedStatus), ["active", "completed", "pending", "pending"]);
  assert.equal(projection.roots[0].episodeId, "e002");
  assert.equal(view(workspace, "--goal", "g001", "--format", "text"), view(workspace, "--goal", "g001", "--format", "text"));
});

test("multiple Goal list view reports derived counts without selecting a next root", () => {
  const workspace = temp();
  runIntent(goalCli, workspace, { type: "create", title: "First", objective: "First objective", createdAt: "2026-09-11T03:00:00Z" });
  runIntent(goalCli, workspace, { type: "add_roots", goalId: "g001", questions: ["First root?"], acceptedAt: "2026-09-11T03:01:00Z" });
  runIntent(goalCli, workspace, { type: "create", title: "Second", objective: "Second objective", createdAt: "2026-09-11T03:02:00Z" });
  const output = view(workspace, "--goals", "--format", "text");
  assert.match(output, /g001  First  0 completed \/ 0 active \/ 1 pending/); assert.match(output, /g002  Second/); assert.doesNotMatch(output, /next/i);
});
