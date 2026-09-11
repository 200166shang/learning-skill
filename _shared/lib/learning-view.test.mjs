import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";
import { projectLearningView, renderLearningView } from "./learning-view.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-view-")), at = "2026-09-11T02:00:00Z";
const view = (root) => { const current = inspectLearningWorkspace(root); return projectLearningView(current.journey.journey, current.evidence.evidence, current.state.state, current.targets.targets); };
const snapshot = (root) => Object.fromEntries(readdirSync(path.join(root, ".learning")).map((name) => [name, readFileSync(path.join(root, ".learning", name), "utf8")]));

test("projects idle and exact nested breadcrumb fields", () => {
  const root = temp(); executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at });
  executeLearningTransition(root, { type: "push", question: "Child?", whyNeeded: "first gap", resumeCheckpoint: "resume root", accepted: true, relationship: "blocking", createdAt: at });
  executeLearningTransition(root, { type: "push", question: "Grandchild?", whyNeeded: "second gap", resumeCheckpoint: "resume child", accepted: true, relationship: "blocking", createdAt: at });
  const projection = view(root);
  assert.deepEqual(projection.path.map((item) => item.questionId), ["q001", "q002", "q003"]);
  assert.equal(projection.path[2].whyNeeded, "second gap"); assert.equal(projection.path[2].resumeCheckpoint, "resume child");
  assert.equal(projection.currentQuestionId, "q003"); assert.equal(projection.depth, 3); assert.equal(projection.popDestinationQuestionId, "q002");
  const idle = projectLearningView({ version: 2, episodes: [], questions: [] }, { version: 1, verifications: [], misconceptions: [] }, { version: 2, mode: "idle", activeEpisodeId: null, focusStack: [] }, { version: 1, targets: [] });
  assert.deepEqual(idle, { mode: "idle", episode: null, path: [], currentQuestionId: null, depth: 0, popDestinationQuestionId: null });
});

test("renderers expose bounded local state without mutation", () => {
  const root = temp(); executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at }); const projection = view(root), before = snapshot(root);
  assert.match(renderLearningView(projection, "text"), /Depth: 1/); assert.match(renderLearningView(projection, "mermaid"), /flowchart TD/); assert.deepEqual(JSON.parse(renderLearningView(projection, "json")), projection);
  assert.deepEqual(snapshot(root), before);
});

test("fresh-process CLI is stable and rejects invalid workspaces", () => {
  const root = temp(); executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at });
  const cli = fileURLToPath(new URL("../scripts/learning-view.mjs", import.meta.url));
  const first = spawnSync(process.execPath, [cli, "--workspace", root, "--format", "json"], { encoding: "utf8" });
  const second = spawnSync(process.execPath, [cli, "--workspace", root, "--format", "json"], { encoding: "utf8" });
  assert.equal(first.status, 0, first.stderr); assert.equal(second.stdout, first.stdout);
  const statePath = path.join(root, ".learning", "state.yaml"); writeFileSync(statePath, "version: 2\nmode: active\nactive_episode_id: e001\nfocus_stack: [q999]\n");
  const invalid = spawnSync(process.execPath, [cli, "--workspace", root], { encoding: "utf8" }); assert.equal(invalid.status, 1); assert.match(invalid.stderr, /invalid/);
});
