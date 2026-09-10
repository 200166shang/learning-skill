import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import { buildLearningGraph } from "./learning-graph.mjs";
import { CURRENT_SCHEMA_VERSION, inspectLearningWorkspace, upgradeLearningWorkspace } from "./learning-workspace.mjs";

const temporaryWorkspace = () => mkdtempSync(path.join(tmpdir(), "learning-workspace-"));
const write = (root, relative, content) => {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
  return target;
};
const journey = "version: 1\nroot_id: q001\nquestions:\n  - id: q001\n    question: Root question\n    parent_id: null\n    why_needed: null\n    resume_checkpoint: null\n    note_refs: []\n";

test("fresh workspace is empty and upgrade writes nothing", () => {
  const root = temporaryWorkspace();
  assert.equal(inspectLearningWorkspace(root).status, "empty");
  assert.deepEqual(upgradeLearningWorkspace(root), { changed: false, source: "empty", targetSchemaVersion: null, warnings: [] });
  assert.equal(inspectLearningWorkspace(root).status, "empty");
});

test("current v1 workspace is a no-op without rewriting files", () => {
  const root = temporaryWorkspace();
  const journeyPath = write(root, ".learning/journey.yaml", journey);
  const manifestPath = write(root, ".learning/workspace.yaml", "schema_version: 1\n");
  const before = [statSync(journeyPath).mtimeMs, statSync(manifestPath).mtimeMs];
  assert.equal(inspectLearningWorkspace(root).status, "current");
  assert.equal(upgradeLearningWorkspace(root).changed, false);
  assert.deepEqual([statSync(journeyPath).mtimeMs, statSync(manifestPath).mtimeMs], before);
});

test("legacy workspace preserves notes and active learning position", () => {
  const root = temporaryWorkspace();
  const parent = "---\ntitle: Root\n---\nRoot body\n";
  const child = "---\ntitle: Child\nrelations:\n  - type: derived-from\n    ref: notes/root.md\n    question: Why child?\n---\nChild body\n";
  write(root, "notes/root.md", parent);
  write(root, "notes/child.md", child);
  write(root, ".learning/state.yaml", "version: 1\nroot_question:\n  id: q001\n  question: Root\nfocus_stack:\n  - id: q001\n    question: Root\n    note: notes/root.md\n    resume: {}\n  - id: q002\n    question: Child\n    note: notes/child.md\n    why_needed: unblock root\n    resume:\n      question: Root\n      checkpoint: reconnect answer\n");
  const result = upgradeLearningWorkspace(root);
  assert.equal(result.source, "legacy");
  assert.equal(result.rootQuestion, "Root");
  assert.equal(result.currentQuestion, "Child");
  assert.equal(result.resumeCheckpoint, "reconnect answer");
  assert.equal(readFileSync(path.join(root, "notes/root.md"), "utf8"), parent);
  assert.equal(readFileSync(path.join(root, "notes/child.md"), "utf8"), child);
  assert.deepEqual(YAML.parse(readFileSync(path.join(root, ".learning/workspace.yaml"), "utf8")), { schema_version: CURRENT_SCHEMA_VERSION });
  assert.equal(inspectLearningWorkspace(root).status, "current");
  assert.equal(buildLearningGraph(root).source, "journey");
});

test("ambiguous legacy relation warns and does not invent an edge", () => {
  const root = temporaryWorkspace();
  write(root, "notes/a.md", "---\ntitle: A\n---\nA\n");
  write(root, "notes/b.md", "---\ntitle: B\n---\nB\n");
  write(root, "notes/child.md", "---\ntitle: Child\nrelations:\n  - type: derived-from\n    ref: notes/a.md\n  - type: derived-from\n    ref: notes/b.md\n---\nChild\n");
  const result = upgradeLearningWorkspace(root);
  assert.match(result.warnings.join("\n"), /ambiguous derived-from/);
  const migrated = YAML.parse(readFileSync(path.join(root, ".learning/journey.yaml"), "utf8"));
  assert.equal(migrated.questions.find((item) => item.question === "Child").parent_id, null);
});

test("canonical unversioned workspace is stamped without rebuilding Journey", () => {
  const root = temporaryWorkspace();
  const target = write(root, ".learning/journey.yaml", journey);
  const before = readFileSync(target, "utf8");
  assert.equal(inspectLearningWorkspace(root).status, "canonical-unversioned");
  const result = upgradeLearningWorkspace(root);
  assert.equal(result.source, "canonical-unversioned");
  assert.equal(readFileSync(target, "utf8"), before);
  assert.equal(inspectLearningWorkspace(root).status, "current");
});

test("malformed canonical data fails without a manifest", () => {
  const root = temporaryWorkspace();
  write(root, ".learning/journey.yaml", "questions: [\n");
  const inspection = inspectLearningWorkspace(root);
  assert.equal(inspection.status, "invalid");
  assert.throws(() => upgradeLearningWorkspace(root, inspection), /invalid/);
  assert.equal(inspectLearningWorkspace(root).status, "invalid");
});

test("invalid legacy input fails during preflight without writing migration artifacts", () => {
  const root = temporaryWorkspace();
  write(root, "notes/broken.md", "---\ntags: []\n---\nBody\n");
  assert.equal(inspectLearningWorkspace(root).status, "legacy");
  assert.throws(() => upgradeLearningWorkspace(root), /preflight failed/);
  assert.equal(inspectLearningWorkspace(root).status, "legacy");
});

test("newer schema fails closed without mutation", () => {
  const root = temporaryWorkspace();
  const target = write(root, ".learning/workspace.yaml", "schema_version: 999\n");
  const before = readFileSync(target, "utf8");
  assert.equal(inspectLearningWorkspace(root).status, "unsupported-newer");
  assert.throws(() => upgradeLearningWorkspace(root), /unsupported-newer/);
  assert.equal(readFileSync(target, "utf8"), before);
});

test("successful upgrade is idempotent", () => {
  const root = temporaryWorkspace();
  write(root, "notes/root.md", "---\ntitle: Root\n---\nBody\n");
  assert.equal(upgradeLearningWorkspace(root).changed, true);
  const journeyBefore = readFileSync(path.join(root, ".learning/journey.yaml"), "utf8");
  const manifestBefore = readFileSync(path.join(root, ".learning/workspace.yaml"), "utf8");
  assert.equal(upgradeLearningWorkspace(root).changed, false);
  assert.equal(readFileSync(path.join(root, ".learning/journey.yaml"), "utf8"), journeyBefore);
  assert.equal(readFileSync(path.join(root, ".learning/workspace.yaml"), "utf8"), manifestBefore);
});
