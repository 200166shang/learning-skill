import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-note-refs-"));
const at = "2026-09-11T08:00:00Z";
const canonical = ["journey.yaml", "targets.yaml", "state.yaml", "evidence.yaml"];
const cli = fileURLToPath(new URL("../scripts/learning-transition.mjs", import.meta.url));

function note(root, ref) {
  const target = path.join(root, ref);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `---\ntitle: ${path.basename(ref, ".md")}\n---\n\n# Note\n`);
}

function bytes(root) {
  return Object.fromEntries(canonical.map((name) => [name, readFileSync(path.join(root, ".learning", name), "utf8")]));
}

test("attaches and de-duplicates one or many existing note refs on a Question", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "How does MCU control work?", createdAt: at });
  note(root, "notes/mcu.md");
  note(root, "notes/pwm.md");
  const before = bytes(root);

  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/mcu.md", "notes/pwm.md", "notes/mcu.md"] });
  const current = inspectLearningWorkspace(root);
  assert.deepEqual(current.journey.journey.questions[0].noteRefs, ["notes/mcu.md", "notes/pwm.md"]);
  assert.equal(bytes(root)["state.yaml"], before["state.yaml"]);
  assert.equal(bytes(root)["evidence.yaml"], before["evidence.yaml"]);
});

test("the Question to Note relation remains many-to-many", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at });
  executeLearningTransition(root, { type: "push", question: "Child?", whyNeeded: "gap", resumeCheckpoint: "root", accepted: true, relationship: "blocking", createdAt: at });
  note(root, "notes/shared.md");
  note(root, "notes/child.md");
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/shared.md"] });
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q002", noteRefs: ["notes/shared.md", "notes/child.md"] });
  assert.deepEqual(inspectLearningWorkspace(root).journey.journey.questions.map((question) => question.noteRefs), [
    ["notes/shared.md"],
    ["notes/shared.md", "notes/child.md"],
  ]);
});

test("transition usage exposes note-ref intents as the authoritative command lookup", () => {
  const result = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /set_note_refs/);
  assert.match(result.stdout, /replace_note_refs/);
  assert.match(result.stdout, /questionId/);
  assert.match(result.stdout, /replacements/);
});

test("rejects nonexistent Questions and invalid or missing note paths without mutation", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "Question?", createdAt: at });
  const before = bytes(root);
  assert.throws(() => executeLearningTransition(root, { type: "set_note_refs", questionId: "q999", noteRefs: [] }), /question not found/);
  assert.throws(() => executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["../outside.md"] }), /notes\/.*\.md|note ref/i);
  assert.throws(() => executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/missing.md"] }), /does not exist/i);
  assert.deepEqual(bytes(root), before);
});

test("explicit replacements update every Journey and Target ref without touching State or Evidence", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "How does serial communication work?", createdAt: at });
  note(root, "notes/uart.md");
  note(root, "notes/serial.md");
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/uart.md", "notes/serial.md"] });
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["chain"], gaps: [], target: { title: "Serial", kind: "concept", noteRefs: ["notes/uart.md", "notes/serial.md"] }, createdAt: at });
  note(root, "notes/usart.md");
  const before = bytes(root);

  executeLearningTransition(root, { type: "replace_note_refs", replacements: [{ from: "notes/uart.md", to: "notes/usart.md" }, { from: "notes/serial.md", to: "notes/usart.md" }] });
  const current = inspectLearningWorkspace(root);
  assert.deepEqual(current.journey.journey.questions[0].noteRefs, ["notes/usart.md"]);
  assert.deepEqual(current.targets.targets.targets[0].noteRefs, ["notes/usart.md"]);
  assert.equal(bytes(root)["state.yaml"], before["state.yaml"]);
  assert.equal(bytes(root)["evidence.yaml"], before["evidence.yaml"]);
  assert.equal(current.status, "current");
});

test("a failed replacement is atomic and root closure rejects missing document refs", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at });
  note(root, "notes/source.md");
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q001", noteRefs: ["notes/source.md"] });
  const before = bytes(root);
  assert.throws(() => executeLearningTransition(root, { type: "replace_note_refs", replacements: [{ from: "notes/source.md", to: "notes/missing.md" }] }), /does not exist/i);
  assert.deepEqual(bytes(root), before);
  assert.throws(() => executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["root"], gaps: [], target: { title: "Root", kind: "concept", noteRefs: ["notes/missing.md"] }, createdAt: at }), /does not exist/i);
  assert.deepEqual(bytes(root), before);
});
