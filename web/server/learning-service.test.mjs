import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { LearningService } from "./learning-service.mjs";

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "learning-web-test-"));
  mkdirSync(path.join(root, "notes"));
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "root.md"), "---\ntitle: Root question\nrecord_type: note\n---\n# Answer\n");
  writeFileSync(path.join(root, ".learning", "journey.yaml"), "version: 1\nroot_id: q1\nquestions:\n  - id: q1\n    question: Root question\n    parent_id: null\n    note_refs: [notes/root.md]\n");
  writeFileSync(path.join(root, ".learning", "state.yaml"), "version: 1\nroot_question:\n  id: q1\n  question: Root question\nfocus_stack:\n  - id: q1\n    question: Root question\n    note: notes/root.md\n");
  return root;
}

test("builds the observer view directly from the shared model", () => {
  const service = new LearningService(fixture());
  const view = service.buildView();
  assert.equal(view.current.question, "Root question");
  assert.equal(view.graph.nodes.length, 1);
});

test("reads a Markdown note inside notes", async () => {
  const service = new LearningService(fixture());
  const note = await service.readNote("notes/root.md");
  assert.match(note.markdown, /# Answer/);
  assert.doesNotMatch(note.markdown, /record_type/);
});

test("blocks traversal and files outside notes", async () => {
  const service = new LearningService(fixture());
  await assert.rejects(() => service.readNote("../secret.md"), (error) => error.statusCode === 403);
  await assert.rejects(() => service.readNote(".learning/state.yaml"), (error) => error.statusCode === 403);
});
