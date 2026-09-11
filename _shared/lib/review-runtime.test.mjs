import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";
import { executeReviewCommand, inspectReviewWorkspace } from "./review-runtime.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "review-runtime-")), at = "2026-09-11T03:00:00Z";
const learned = () => { const root = temp(); executeLearningTransition(root, { type: "start", question: "Why?", createdAt: at }); executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["why"], gaps: [], createdAt: at, target: { title: "Why", kind: "concept" } }); return root; };

test("creates and reloads manual recall/explain/transfer items", () => {
  const root = learned();
  for (const mode of ["recall", "explain", "transfer"]) executeReviewCommand(root, { type: "create", targetId: "k001", mode, prompt: `${mode}?`, createdAt: at });
  const review = inspectReviewWorkspace(root);
  assert.equal(review.status, "current"); assert.deepEqual(review.items.items.map((item) => item.mode), ["recall", "explain", "transfer"]);
  assert.throws(() => executeReviewCommand(root, { type: "create", targetId: "k999", mode: "recall", prompt: "x", createdAt: at }), /target not found/);
});

test("attempts append durable Review history and shared Evidence", () => {
  const root = learned(); executeReviewCommand(root, { type: "create", targetId: "k001", mode: "explain", prompt: "Explain", createdAt: at });
  for (const result of ["pass", "uncertain", "fail"]) executeReviewCommand(root, { type: "record_attempt", reviewItemId: "r001", result, independence: "unaided", answerSummary: result, createdAt: at });
  const review = inspectReviewWorkspace(root), learning = inspectLearningWorkspace(root);
  assert.equal(review.history.attempts.length, 3); assert.equal(learning.evidence.evidence.verifications.filter((item) => item.kind === "review").length, 3);
  assert.ok(learning.evidence.evidence.verifications.every((item) => item.kind !== "review" || item.targetId === "k001"));
  assert.equal(learning.journey.journey.episodes[0].status, "closed");
});

test("review during active learning never changes recursive state", () => {
  const root = learned(); executeLearningTransition(root, { type: "start", question: "Another?", createdAt: at });
  executeReviewCommand(root, { type: "create", targetId: "k001", mode: "transfer", prompt: "Apply", createdAt: at });
  const before = structuredClone(inspectLearningWorkspace(root).state.state);
  executeReviewCommand(root, { type: "record_attempt", reviewItemId: "r001", result: "fail", independence: "strong_hint", answerSummary: "gap", createdAt: at });
  assert.deepEqual(inspectLearningWorkspace(root).state.state, before);
  assert.equal(inspectReviewWorkspace(root, { targetId: "k001" }).history.attempts.length, 1);
});

test("flashcards are explicit, editable, archivable ReviewItems with stable history", () => {
  const root = learned();
  executeReviewCommand(root, { type: "create_card", targetId: "k001", front: "Why?", back: "Because.", createdAt: at });
  executeReviewCommand(root, { type: "create_card", targetId: "k001", front: "Why?", back: "Because.", createdAt: at });
  assert.equal(inspectReviewWorkspace(root).items.items.length, 1);
  executeReviewCommand(root, { type: "record_attempt", reviewItemId: "r001", result: "pass", independence: "unaided", answerSummary: "Because.", createdAt: at });
  executeReviewCommand(root, { type: "update_card", reviewItemId: "r001", front: "Why exactly?", back: "For this reason." });
  executeReviewCommand(root, { type: "archive_card", reviewItemId: "r001" });
  const active = inspectReviewWorkspace(root), all = inspectReviewWorkspace(root, { includeArchived: true });
  assert.equal(active.items.items.length, 0); assert.equal(all.items.items[0].id, "r001"); assert.equal(all.items.items[0].front, "Why exactly?"); assert.equal(all.history.attempts.length, 1);
});
