import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { buildLearningView } from "./learning-view-model.mjs";
import { detectRuntimeTransition } from "./runtime-transition.mjs";

const workspace = () => mkdtempSync(path.join(tmpdir(), "learning-model-test-"));

test("parses nested resume state and derives the current frame", () => {
  const root = workspace();
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, ".learning", "journey.yaml"), `version: 1\nroot_id: q1\nquestions:\n  - id: q1\n    question: Root\n    parent_id: null\n    note_refs: []\n  - id: q2\n    question: Child\n    parent_id: q1\n    note_refs: []\n`);
  writeFileSync(path.join(root, ".learning", "state.yaml"), `version: 1\nroot_question:\n  id: q1\n  question: Root\nfocus_stack:\n  - id: q1\n    question: Root\n  - id: q2\n    question: Child\n    why_needed: The missing link\n    resume:\n      question: Root\n      checkpoint: Continue at output\n`);
  const view = buildLearningView(root);
  assert.equal(view.current.question, "Child");
  assert.equal(view.current.whyNeeded, "The missing link");
  assert.equal(view.current.resumeCheckpoint, "Continue at output");
  assert.equal(view.current.depth, 2);
});

test("malformed state becomes a warning rather than an exception", () => {
  const root = workspace();
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, ".learning", "state.yaml"), "focus_stack: [not closed");
  const view = buildLearningView(root);
  assert.equal(view.current, null);
  assert.ok(view.warnings.some((warning) => warning.startsWith("malformed state.yaml")));
});

test("uses Journey question IDs for stable node identity", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes", "nested"), { recursive: true });
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "nested", "topic.md"), "---\ntitle: First title\nrecord_type: note\n---\nBody\n");
  writeFileSync(path.join(root, ".learning", "journey.yaml"), "version: 1\nroot_id: q1\nquestions:\n  - id: q1\n    question: Stable question\n    parent_id: null\n    note_refs: [notes/nested/topic.md]\n");
  const first = buildLearningView(root).graph.nodes[0].id;
  writeFileSync(path.join(root, "notes", "nested", "topic.md"), "---\ntitle: Renamed title\nrecord_type: note\n---\nBody\n");
  assert.equal(buildLearningView(root).graph.nodes[0].id, first);
  assert.equal(first, "q1");
});

test("derives push, pop, and route-updated transitions", () => {
  const a = { id: "a", question: "A" };
  const b = { id: "b", question: "B" };
  const c = { id: "c", question: "C" };
  assert.equal(detectRuntimeTransition([a], [a, b]).type, "DIVE");
  assert.equal(detectRuntimeTransition([a, b], [a]).type, "BACKTRACK");
  assert.equal(detectRuntimeTransition([a, b], [a, c]).type, "ROUTE UPDATED");
  assert.equal(detectRuntimeTransition([a], [a]), null);
});
