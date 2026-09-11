import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { gradeRecord } from "../../evals/document-delivery/grade.mjs";
import { inspectLearningDocument } from "./learning-document-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const record = (name) => path.join(root, "evals", "document-delivery", "records", name);

test("document delivery positive fixture proves grader mechanics", () => {
  const result = gradeRecord(record("mechanics-pass.json"));
  assert.equal(result.recordKind, "scripted-grader-fixture");
  assert.equal(result.verdict, "PASS", JSON.stringify(result.deterministic.checks.filter((x) => !x.pass), null, 2));
  assert.equal(result.humanSemanticReview.status, "NOT_SCORED_BY_CLI");
});

test("known missing-note regression fails delivery grading", () => {
  const result = gradeRecord(record("regression-missing-note.json"));
  assert.equal(result.verdict, "FAIL");
  assert.ok(result.deterministic.checks.some((x) => x.id === "document-exists-in-capture" && !x.pass));
});

test("known timestamp-summary regression fails content grading", () => {
  const result = gradeRecord(record("regression-timestamp-summary.json"));
  assert.equal(result.verdict, "FAIL");
  assert.ok(result.deterministic.checks.some((x) => x.id === "turn:continue-time:material:secNsec" && !x.pass));
  assert.ok(result.deterministic.checks.some((x) => x.id === "turn:continue-time:material:motion" && !x.pass));
});

test("invalid records fail with validation errors instead of throwing", () => {
  const result = gradeRecord(record("does-not-exist.json"));
  assert.equal(result.verdict, "FAIL");
  assert.match(result.validationErrors[0], /record:/);
});

test("malformed transcript turns are rejected without throwing", () => {
  const temporary = mkdtempSync(path.join(tmpdir(), "learning-eval-record-"));
  try {
    const fixture = JSON.parse(readFileSync(record("mechanics-pass.json"), "utf8"));
    fixture.transcript = path.join(root, "evals/document-delivery/transcripts/invalid-turn.json");
    const input = path.join(temporary, "invalid.json"); writeFileSync(input, JSON.stringify(fixture));
    const result = gradeRecord(input);
    assert.equal(result.verdict, "FAIL");
    assert.match(result.validationErrors[0], /unique non-empty IDs/);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test("captured Sol smoke artifacts match persisted receipts without asserting model quality", () => {
  const captures = path.join(root, "evals/document-delivery/live-smoke");
  for (const turn of ["teach", "continue-array", "dont-know", "continue-time", "insufficient", "status", "resume"]) {
    const inspected = inspectLearningDocument(path.join(captures, turn));
    assert.equal(inspected.status, "current", turn);
    assert.equal(inspected.currentQuestion.id, "q001", turn);
    assert.deepEqual(inspected.currentQuestion.noteRefs, ["notes/radar-data-model.md"], turn);
    assert.equal(inspected.document.revision, inspected.lastCommit.revision, turn);
    assert.equal(inspected.pendingRecovery.length, 0, turn);
  }
  for (const file of ["notes/radar-data-model.md", ...["workspace", "journey", "state", "evidence", "targets", "goals", "document"].map((name) => `.learning/${name}.yaml`)]) {
    assert.equal(readFileSync(path.join(captures, "status", file), "utf8"), readFileSync(path.join(captures, "insufficient", file), "utf8"), file);
    assert.equal(readFileSync(path.join(captures, "resume", file), "utf8"), readFileSync(path.join(captures, "status", file), "utf8"), file);
  }
});
