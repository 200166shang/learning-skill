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

test("renders canonical lineage and the active stack from one workspace", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, "notes", "root.md"), `---\nversion: 2\ntitle: PID 为什么输出 PWM？\nrecord_type: note\ncreated_at: 2026-09-10\n---\n\n# Root\n`);
  writeFileSync(path.join(root, "notes", "child.md"), `---\nversion: 2\ntitle: PWM 为什么控制电机速度？\nrecord_type: note\ncreated_at: 2026-09-10\nrelations:\n  - type: derived-from\n    ref: notes/root.md\n    question: PWM 为什么控制电机速度？\n---\n\n# Child\n`);
  writeFileSync(path.join(root, ".learning", "state.yaml"), `version: 1\nroot_question:\n  id: q001\n  question: PID 为什么输出 PWM？\nfocus_stack:\n  - id: q001\n    question: PID 为什么输出 PWM？\n  - id: q002\n    question: PWM 为什么控制电机速度？\n`);

  render(root);
  const markdown = readFileSync(path.join(root, "learning-map.md"), "utf8");
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.match(mermaid, /flowchart TD/);
  assert.match(mermaid, /PID 为什么输出 PWM/);
  assert.match(mermaid, /▶ PWM 为什么控制电机速度/);
  assert.match(markdown, /\[PID 为什么输出 PWM？\]\(notes\/root\.md\)/);
  assert.match(markdown, /\*\*PWM 为什么控制电机速度？\*\* ← 当前/);
});

test("renders a minimal valid map when the workspace has no notes or state", () => {
  const root = workspace();
  render(root);
  assert.match(readFileSync(path.join(root, "learning-map.mmd"), "utf8"), /^flowchart TD/m);
  assert.match(readFileSync(path.join(root, "learning-map.md"), "utf8"), /当前没有挂起的递归学习路径/);
});

test("warns for a missing parent and preserves the child node", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  writeFileSync(path.join(root, "notes", "child.md"), `---\ntitle: Child question\nrelations:\n  - type: derived-from\n    ref: notes/missing.md\n---\nBody\n`);
  const output = render(root);
  assert.match(output, /warning: derived-from target not found: notes\/missing\.md/);
  assert.match(readFileSync(path.join(root, "learning-map.mmd"), "utf8"), /Child question/);
});

test("renders an active stack when notes are absent", () => {
  const root = workspace();
  mkdirSync(path.join(root, ".learning"));
  writeFileSync(path.join(root, ".learning", "state.yaml"), `version: 1\nfocus_stack:\n  - id: q001\n    question: Root question\n  - id: q002\n    question: Active child\n`);
  render(root);
  const mermaid = readFileSync(path.join(root, "learning-map.mmd"), "utf8");
  assert.match(mermaid, /Root question/);
  assert.match(mermaid, /▶ Active child/);
  assert.match(mermaid, /-->/);
});

test("warns for invalid relations and cycles without recursing forever", () => {
  const root = workspace();
  mkdirSync(path.join(root, "notes"));
  writeFileSync(path.join(root, "notes", "a.md"), `---\ntitle: A\nrelations:\n  - type: derived-from\n    ref: notes/b.md\n  - type: derived-from\n---\nA\n`);
  writeFileSync(path.join(root, "notes", "b.md"), `---\ntitle: B\nrelations:\n  - type: derived-from\n    ref: notes/a.md\n---\nB\n`);
  const output = render(root);
  assert.match(output, /invalid derived-from relation skipped/);
  assert.match(output, /derived-from relation cycle detected/);
  const markdown = readFileSync(path.join(root, "learning-map.md"), "utf8");
  assert.match(markdown, /\[A\]\(notes\/a\.md\)/);
  assert.match(markdown, /\[B\]\(notes\/b\.md\)/);
});
