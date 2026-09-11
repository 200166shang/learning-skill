import assert from "node:assert/strict";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";
import { executeReviewCommand, inspectReviewWorkspace } from "./review-runtime.mjs";
import { executePracticeCommand, inspectPracticeWorkspace } from "./practice-runtime.mjs";

const at = "2026-09-11T05:00:00Z", temp = () => mkdtempSync(path.join(tmpdir(), "practice-runtime-"));
const learned = () => { const root = temp(); executeLearningTransition(root, { type: "start", question: "How?", createdAt: at }); executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["how"], gaps: [], createdAt: at, target: { title: "Procedure", kind: "procedure" } }); return root; };

test("creates coding debugging and design tasks only for existing targets", () => {
  const root = learned();
  for (const mode of ["coding", "debugging", "design"]) executePracticeCommand(root, { type: "create", targetId: "k001", mode, title: mode, prompt: `${mode} task`, verification: { type: mode === "coding" ? "command" : "rubric", command: mode === "coding" ? "exit 99" : undefined }, createdAt: at });
  assert.deepEqual(inspectPracticeWorkspace(root).tasks.tasks.map((task) => task.mode), ["coding", "debugging", "design"]);
  assert.throws(() => executePracticeCommand(root, { type: "create", targetId: "k999", mode: "coding", title: "x", prompt: "x", verification: { type: "command", command: "true" }, createdAt: at }), /target not found/);
});

test("records observable practice attempts and shared Evidence", () => {
  const root = learned(); executePracticeCommand(root, { type: "create", targetId: "k001", mode: "coding", title: "Build", prompt: "Build it", verification: { type: "command", command: "exit 99" }, createdAt: at });
  for (const result of ["pass", "partial", "fail"]) executePracticeCommand(root, { type: "record_attempt", practiceTaskId: "p001", result, verification: { type: "command", exitCode: result === "pass" ? 0 : 1, summary: result }, artifactRefs: ["src/example.js"], createdAt: at });
  const practice = inspectPracticeWorkspace(root), evidence = inspectLearningWorkspace(root).evidence.evidence.verifications.filter((item) => item.kind === "practice");
  assert.equal(practice.history.attempts.length, 3); assert.deepEqual(evidence.map((item) => item.result), ["pass", "partial", "fail"]); assert.ok(evidence.every((item) => item.targetId === "k001"));
});

test("practice reads and writes never execute command metadata or mutate Learning/Review", () => {
  const root = learned(); executeReviewCommand(root, { type: "create", targetId: "k001", mode: "recall", prompt: "Recall", createdAt: at });
  executeLearningTransition(root, { type: "start", question: "Active?", createdAt: at });
  const marker = path.join(root, "must-not-run"); executePracticeCommand(root, { type: "create", targetId: "k001", mode: "coding", title: "Do not run", prompt: "x", verification: { type: "command", command: `touch ${marker}` }, createdAt: at });
  const learningBefore = structuredClone(inspectLearningWorkspace(root).state.state), scheduleBefore = structuredClone(inspectReviewWorkspace(root).schedule);
  inspectPracticeWorkspace(root); executePracticeCommand(root, { type: "archive", practiceTaskId: "p001" });
  assert.deepEqual(inspectLearningWorkspace(root).state.state, learningBefore); assert.deepEqual(inspectReviewWorkspace(root).schedule, scheduleBefore);
  assert.equal(existsSync(marker), false);
  assert.equal(inspectPracticeWorkspace(root).tasks.tasks.length, 0); assert.equal(inspectPracticeWorkspace(root, { includeArchived: true }).tasks.tasks[0].id, "p001");
});
