import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { commitLearningDocument, inspectLearningDocument, recoverLearningDocument } from "./learning-document-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-document-"));
const cli = fileURLToPath(new URL("../scripts/learning-document.mjs", import.meta.url));
function current(root) { executeLearningTransition(root, { type: "start", question: "雷达数据怎样变成坐标？", createdAt: "2026-09-11T00:00:00Z" }); }
function draft(overrides = {}) { return { questionId: "q001", documentRef: "notes/小沫机器人雷达模块.md", section: "数组映射", expectedRevision: "absent", markdown: "七个位置从 -90° 到 +90°，每格 30°，所以 +30° 的下标是 4。代码输入使用弧度。", operationId: "turn-001", mode: "create", title: "小沫机器人雷达模块", ...overrides }; }
function relevantBytes(root) {
  const names = ["journey.yaml", "state.yaml", "evidence.yaml", "targets.yaml", "goals.yaml", "document.yaml"];
  return Object.fromEntries(names.map((name) => { const target = path.join(root, ".learning", name); return [name, existsSync(target) ? readFileSync(target, "utf8") : null]; }));
}

test("inspect is read-only for empty and current workspaces and returns bounded selected content", () => {
  const empty = temp(), beforeEmpty = existsSync(path.join(empty, ".learning"));
  assert.equal(inspectLearningDocument(empty).status, "empty"); assert.equal(existsSync(path.join(empty, ".learning")), beforeEmpty);
  const root = temp(); current(root); const before = relevantBytes(root);
  const first = inspectLearningDocument(root); assert.equal(first.currentQuestion.id, "q001"); assert.equal(first.document, null); assert.deepEqual(relevantBytes(root), before);
  commitLearningDocument(root, draft()); const selected = inspectLearningDocument(root, { documentRef: draft().documentRef, section: "数组映射", maxBytes: 20 });
  assert.equal(selected.document.section.headingLevel, 2); assert.equal(selected.document.section.truncated, true); assert.match(selected.document.revision, /^[a-f0-9]{64}$/); assert.match(selected.document.section.sectionHash, /^[a-f0-9]{64}$/);
});

test("creates a Chinese document and atomically links it without changing learning evidence or state", () => {
  const root = temp(); current(root); const before = relevantBytes(root), receipt = commitLearningDocument(root, draft());
  assert.equal(receipt.documentRef, "notes/小沫机器人雷达模块.md"); assert.equal(receipt.headingLevel, 2); assert.match(receipt.savedMarkdown, /下标是 4/);
  assert.deepEqual(inspectLearningWorkspace(root).journey.journey.questions[0].noteRefs, [draft().documentRef]);
  const after = relevantBytes(root); assert.equal(after["state.yaml"], before["state.yaml"]); assert.equal(after["evidence.yaml"], before["evidence.yaml"]);
});

test("inspect prefers the relevant primary document when the current question has multiple refs", () => {
  const root = temp(); current(root); const primary = commitLearningDocument(root, draft());
  writeFileSync(path.join(root, "notes", "补充.md"), "---\ntitle: 补充\n---\n\n# 补充\n"); executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/补充.md", draft().documentRef] });
  assert.equal(inspectLearningDocument(root).document.path, primary.path);
});

test("multiple turns append unique sections and replace only the selected section", () => {
  const root = temp(); current(root); const one = commitLearningDocument(root, draft());
  const two = commitLearningDocument(root, draft({ section: "时间戳和坐标系", markdown: "sec/nsec 表示测量时间；frame_id 标识坐标系，变换由 TF 提供。", expectedRevision: one.revision, operationId: "turn-002", mode: "append", title: undefined }));
  const replaced = commitLearningDocument(root, draft({ section: "数组映射", markdown: "修正后的完整数组例子，仍保留单位边界。", expectedRevision: two.revision, operationId: "turn-003", mode: "replace", title: undefined }));
  assert.match(replaced.savedMarkdown, /修正后的完整数组例子/); const file = readFileSync(replaced.path, "utf8");
  assert.match(file, /sec\/nsec/); assert.doesNotMatch(file, /七个位置/); assert.equal((file.match(/## 数组映射/g) || []).length, 1);
  assert.deepEqual(inspectLearningWorkspace(root).journey.journey.questions[0].noteRefs, [draft().documentRef]);
});

test("rejects duplicate append sections and ambiguous replacement without mutation", () => {
  const root = temp(); current(root); const first = commitLearningDocument(root, draft()), before = relevantBytes(root);
  assert.throws(() => commitLearningDocument(root, draft({ expectedRevision: first.revision, operationId: "dup", mode: "append", title: undefined })), /already exists/); assert.deepEqual(relevantBytes(root), before);
  writeFileSync(first.path, `${readFileSync(first.path, "utf8")}\n## 数组映射\n\n重复\n`); const revision = inspectLearningDocument(root, { documentRef: draft().documentRef }).document.revision, beforeAmbiguous = relevantBytes(root);
  assert.throws(() => commitLearningDocument(root, draft({ expectedRevision: revision, operationId: "ambiguous", mode: "replace", title: undefined })), /ambiguous/); assert.deepEqual(relevantBytes(root), beforeAmbiguous);
});

test("same operation retry is idempotent and conflicting reuse is rejected", () => {
  const root = temp(); current(root); const first = commitLearningDocument(root, draft()), retry = commitLearningDocument(root, draft());
  assert.equal(retry.idempotent, true); assert.equal(retry.changed, false); assert.equal(retry.revision, first.revision); assert.equal((readFileSync(first.path, "utf8").match(/## 数组映射/g) || []).length, 1);
  assert.throws(() => commitLearningDocument(root, draft({ markdown: "different" })), /different draft/);
  writeFileSync(first.path, `${readFileSync(first.path, "utf8")}\nmanual edit\n`);
  assert.throws(() => commitLearningDocument(root, draft()), /superseded/);
});

test("revision conflicts preserve user edits and unrelated refs", () => {
  const root = temp(); current(root); mkdirSync(path.join(root, "notes"), { recursive: true }); writeFileSync(path.join(root, "notes", "已有.md"), "---\ntitle: 已有\n---\n\n# 已有\n");
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/已有.md"] }); const first = commitLearningDocument(root, draft());
  writeFileSync(first.path, `${readFileSync(first.path, "utf8")}\n用户手改\n`); const edited = readFileSync(first.path, "utf8"), before = relevantBytes(root);
  assert.throws(() => commitLearningDocument(root, draft({ expectedRevision: first.revision, operationId: "stale", mode: "replace", title: undefined })), /revision conflict/);
  assert.equal(readFileSync(first.path, "utf8"), edited); assert.deepEqual(relevantBytes(root), before); assert.deepEqual(inspectLearningWorkspace(root).journey.journey.questions[0].noteRefs, ["notes/已有.md", draft().documentRef]);
});

test("an interrupted transaction is explicit and recover rolls it forward", () => {
  const root = temp(); current(root);
  assert.throws(() => commitLearningDocument(root, draft(), { interruptAfter: 1 }), /simulated interruption/);
  const pending = inspectLearningDocument(root); assert.equal(pending.pendingRecovery.length, 1); assert.throws(() => commitLearningDocument(root, draft({ operationId: "other" })), /recover/);
  assert.throws(() => executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: [] }), /unfinished document transaction/);
  assert.throws(() => executeLearningGoalCommand(root, { type: "create", title: "Blocked", objective: "Must not race", sources: [], createdAt: "2026-09-11T00:00:00Z" }), /unfinished document transaction/);
  const result = recoverLearningDocument(root); assert.equal(result.recovered.length, 1); assert.equal(inspectLearningDocument(root).pendingRecovery.length, 0); assert.deepEqual(inspectLearningWorkspace(root).journey.journey.questions[0].noteRefs, [draft().documentRef]);
  assert.equal(commitLearningDocument(root, draft()).idempotent, true);
});

test("recovery rejects journal targets outside the fixed transaction allowlist", () => {
  const root = temp(); current(root); assert.throws(() => commitLearningDocument(root, draft(), { interruptAfter: 1 }), /simulated interruption/);
  const id = inspectLearningDocument(root).pendingRecovery[0], journal = path.join(root, ".learning", ".document-transactions", id, "journal.yaml");
  writeFileSync(journal, readFileSync(journal, "utf8").replace("target: .learning/journey.yaml", "target: .learning/state.yaml"));
  const stateBefore = readFileSync(path.join(root, ".learning", "state.yaml"), "utf8");
  assert.throws(() => recoverLearningDocument(root), /target is not allowed/); assert.equal(readFileSync(path.join(root, ".learning", "state.yaml"), "utf8"), stateBefore);
});

test("recovery reclaims a crash lock that has no owner receipt", () => {
  const root = temp(); current(root); mkdirSync(path.join(root, ".learning", ".document.lock"));
  assert.deepEqual(recoverLearningDocument(root).recovered, []); assert.equal(existsSync(path.join(root, ".learning", ".document.lock")), false);
});

test("the exclusive reaper guard prevents competing stale-lock deletion", () => {
  const root = temp(); current(root); const learning = path.join(root, ".learning"), lock = path.join(learning, ".document.lock"), gate = path.join(learning, ".document.lock-reaper");
  mkdirSync(lock); writeFileSync(path.join(lock, "owner.yaml"), "pid: 2147483647\n"); mkdirSync(gate);
  assert.throws(() => executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: [] }), /recovery guard is held/);
  assert.equal(existsSync(lock), true); rmSync(gate, { recursive: true });
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: [] }); assert.equal(existsSync(lock), false);
});

test("a legacy transition cannot read or write while another process owns the shared mutation lock", async () => {
  const root = temp(), runtimeUrl = new URL("./learning-document-runtime.mjs", import.meta.url).href;
  const code = `import { withLearningWorkspaceMutationLock } from ${JSON.stringify(runtimeUrl)}; withLearningWorkspaceMutationLock(${JSON.stringify(root)}, () => { console.log("READY"); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); });`;
  const child = spawn(process.execPath, ["--input-type=module", "--eval", code], { stdio: ["ignore", "pipe", "pipe"] });
  await new Promise((resolve, reject) => { child.stdout.once("data", (chunk) => String(chunk).includes("READY") ? resolve() : reject(new Error(`unexpected child output: ${chunk}`))); child.once("error", reject); });
  assert.throws(() => executeLearningTransition(root, { type: "start", question: "Must wait", createdAt: "2026-09-11T00:00:00Z" }), /locked by pid/);
  assert.equal(inspectLearningDocument(root).status, "empty"); child.kill("SIGKILL"); await new Promise((resolve) => child.once("exit", resolve));
  assert.equal(executeLearningTransition(root, { type: "start", question: "After crash", createdAt: "2026-09-11T00:00:00Z" }).status, "current");
});

test("invalid paths, symlink escapes, missing links, and invalid questions do not mutate learning files", () => {
  const root = temp(); current(root); const outside = temp(); writeFileSync(path.join(outside, "secret.md"), "secret"); mkdirSync(path.join(root, "notes")); symlinkSync(outside, path.join(root, "notes", "escape"));
  const before = relevantBytes(root);
  for (const bad of [draft({ documentRef: "../bad.md" }), draft({ documentRef: "notes/escape/stolen.md" }), draft({ questionId: "q999" }), draft({ markdown: "[missing](missing.md)" })]) assert.throws(() => commitLearningDocument(root, bad));
  assert.deepEqual(relevantBytes(root), before); assert.equal(existsSync(path.join(outside, "stolen.md")), false);
  const linkedRoot = temp(); current(linkedRoot); symlinkSync(outside, path.join(linkedRoot, "notes"));
  assert.throws(() => inspectLearningDocument(linkedRoot, { documentRef: "notes/x.md" }), /notes directory escapes/);
});

test("verified source citations and self-links are allowed without copying source content", () => {
  const root = temp(); current(root); const sourceRoot = temp(), source = path.join(sourceRoot, "driver.cpp"); writeFileSync(source, "API_SECRET_SHOULD_NOT_BE_COPIED\nint scan();\n");
  const receipt = commitLearningDocument(root, draft({ markdown: `[实现位置](${source}:2)；[本节](小沫机器人雷达模块.md#数组映射)。` }));
  assert.match(receipt.savedMarkdown, /driver\.cpp:2/); assert.doesNotMatch(receipt.savedMarkdown, /API_SECRET/);
});

test("invalid modes and headings that escape the selected section fail before mutation", () => {
  const root = temp(); current(root); const before = relevantBytes(root);
  assert.throws(() => commitLearningDocument(root, draft({ mode: "merge" })), /invalid mode/);
  assert.throws(() => commitLearningDocument(root, draft({ markdown: "正文\n\n## 越界章节\n\n不应接受" })), /headings must be deeper/);
  assert.deepEqual(relevantBytes(root), before);
});

test("CLI help and schema are successful and do not mutate the workspace", () => {
  const root = temp(); for (const args of [["--help"], ["schema"], ["inspect", root]]) { const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" }); assert.equal(result.status, 0, result.stderr); }
  assert.equal(existsSync(path.join(root, ".learning")), false);
  const schema = JSON.parse(spawnSync(process.execPath, [cli, "schema"], { encoding: "utf8" }).stdout); assert.ok(schema.required.includes("operationId")); assert.ok(schema.properties.mode.enum.includes("append"));
});
