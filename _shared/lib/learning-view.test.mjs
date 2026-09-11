import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";
import { commitLearningDocument } from "./learning-document-runtime.mjs";
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

test("CLI exposes saved document facts read-only and detects subsequent manual changes", () => {
  const root = temp(); executeLearningTransition(root, { type: "start", question: "雷达数组如何映射？", createdAt: at });
  const receipt = commitLearningDocument(root, { questionId: "q001", documentRef: "notes/雷达.md", section: "数组映射", markdown: "从最小角度起算，角度偏移除以角度增量得到数组下标。", expectedRevision: "absent", operationId: "view-test", mode: "create", title: "雷达" });
  const cli = fileURLToPath(new URL("../scripts/learning-view.mjs", import.meta.url));
  const files = [receipt.path, ...["journey", "state", "evidence", "targets", "goals", "document"].map((name) => path.join(root, ".learning", `${name}.yaml`))];
  const bytes = () => files.map((file) => readFileSync(file, "utf8"));
  const before = bytes();
  const json = spawnSync(process.execPath, [cli, "--workspace", root, "--format", "json"], { encoding: "utf8" });
  assert.equal(json.status, 0, json.stderr);
  const projection = JSON.parse(json.stdout);
  assert.equal(projection.documents.primaryStatus.path, receipt.path);
  assert.equal(projection.documents.primaryStatus.matchesLastCommit, true);
  assert.equal(projection.documents.lastCommit.section, "数组映射");
  const text = spawnSync(process.execPath, [cli, "--workspace", root], { encoding: "utf8" });
  assert.match(text.stdout, /Last saved section: notes\/雷达.md → 数组映射/);
  assert.deepEqual(bytes(), before);
  writeFileSync(receipt.path, `${readFileSync(receipt.path, "utf8")}\n手动补充\n`);
  const changed = JSON.parse(spawnSync(process.execPath, [cli, "--workspace", root, "--format", "json"], { encoding: "utf8" }).stdout);
  assert.equal(changed.documents.primaryStatus.matchesLastCommit, false);
});
