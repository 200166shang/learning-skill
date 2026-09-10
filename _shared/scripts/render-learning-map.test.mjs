import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "render-learning-map.mjs");

function workspace() {
  return mkdtempSync(path.join(tmpdir(), "learning-map-test-"));
}

function render(root) {
  return execFileSync(process.execPath, [script, root], { encoding: "utf8" });
}

test("renders canonical Journey and the active stack from one workspace", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "root.md"), `---\nversion: 2\ntitle: PID 为什么输出 PWM？\nrecord_type: note\ncreated_at: 2026-09-10\n---\n\n# Root\n`);
  writeFileSync(path.join(root, "notes", "child.md"), `---\nversion: 2\ntitle: PWM 为什么控制电机速度？\nrecord_type: note\ncreated_at: 2026-09-10\n---\n\n# Child\n`);
  writeFileSync(path.join(root, ".learning", "journey.yaml"), `version: 1\nroot_id: q001\nquestions:\n  - id: q001\n    question: PID 为什么输出 PWM？\n    parent_id: null\n    note_refs: [notes/root.md]\n  - id: q002\n    question: PWM 为什么控制电机速度？\n    parent_id: q001\n    note_refs: [notes/child.md]\n`);
  writeFileSync(path.join(root, ".learning", "state.yaml"), `version: 1\nroot_question:\n  id: q001\n  question: PID 为什么输出 PWM？\nfocus_stack:\n  - id: q001\n    question: PID 为什么输出 PWM？\n  - id: q002\n    question: PWM 为什么控制电机速度？\n`);

  render(root);
  const markdown = readFileSync(path.join(root, "learning-map.md"), "utf8");
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.match(mermaid, /flowchart LR/);
  assert.match(mermaid, /PID 为什么输出 PWM/);
  assert.match(mermaid, /▶ PWM 为什么控制电机速度/);
  assert.match(markdown, /PID 为什么输出 PWM？.*\[知识笔记\]\(notes\/root\.md\)/);
  assert.match(markdown, /\*\*PWM 为什么控制电机速度？\*\* ← 当前/);
});

test("renders a minimal valid map when the workspace has no notes or state", () => {
  const root = workspace();
  render(root);
  assert.match(readFileSync(path.join(root, "learning-map.mmd"), "utf8"), /^flowchart LR/m);
  assert.match(readFileSync(path.join(root, "learning-map.md"), "utf8"), /当前没有挂起的递归学习路径/);
});

test("requires migration for a non-empty legacy workspace", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  writeFileSync(path.join(root, "notes", "child.md"), `---\ntitle: Child question\nrelations:\n  - type: derived-from\n    ref: notes/missing.md\n---\nBody\n`);
  const output = render(root);
  assert.match(output, /migration required/);
  assert.match(output, /migrate-learning-journey\.mjs/);
  assert.doesNotMatch(readFileSync(path.join(root, "learning-map.mmd"), "utf8"), /Child question/);
});

test("does not infer a graph from active state when Journey is absent", () => {
  const root = workspace();
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, ".learning", "state.yaml"), `version: 1\nfocus_stack:\n  - id: q001\n    question: Root question\n  - id: q002\n    question: Active child\n`);
  render(root);
  const output = render(root);
  assert.match(output, /migration required/);
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.doesNotMatch(mermaid, /Root question|Active child/);
});

test("uses Journey questions as nodes and allows shared note references", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "shared.md"), "---\ntitle: Shared mechanism\n---\nBody\n");
  writeFileSync(path.join(root, ".learning", "journey.yaml"), `version: 1
root_id: q001
questions:
  - id: q001
    question: First context?
    parent_id: null
    note_refs: [notes/shared.md]
  - id: q002
    question: Same knowledge elsewhere?
    parent_id: q001
    note_refs: [notes/shared.md]
`);
  writeFileSync(path.join(root, ".learning", "state.yaml"), "version: 1\nfocus_stack:\n  - id: q001\n    question: First context?\n  - id: q002\n    question: Same knowledge elsewhere?\n");
  render(root);
  const markdown = readFileSync(path.join(root, "learning-map.md"), "utf8");
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.match(mermaid, /q001.*First context/);
  assert.match(mermaid, /q001 --> q002/);
  assert.equal((markdown.match(/\[知识笔记\]\(notes\/shared\.md\)/g) || []).length, 2);
  assert.doesNotMatch(mermaid, /Shared mechanism/);
});

test("does not merge legacy lineage when Journey exists", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "a.md"), "---\ntitle: Note A\nrelations:\n  - type: derived-from\n    ref: notes/b.md\n---\nA\n");
  writeFileSync(path.join(root, "notes", "b.md"), "---\ntitle: Note B\n---\nB\n");
  writeFileSync(path.join(root, ".learning", "journey.yaml"), "version: 1\nroot_id: q001\nquestions:\n  - id: q001\n    question: Only journey node\n    parent_id: null\n    note_refs: []\n");
  render(root);
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.match(mermaid, /Only journey node/);
  assert.doesNotMatch(mermaid, /Note A|Note B/);
});
