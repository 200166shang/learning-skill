import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { appendJourneyQuestion, nextJourneyQuestionId, readLearningJourney, setJourneyQuestionNoteRefs, writeLearningJourney } from "./learning-journey.mjs";

test("round trips a minimal journey and permits note reuse", () => {
  const root = mkdtempSync(path.join(tmpdir(), "journey-test-"));
  let journey = { version: 1, rootId: null, questions: [] };
  journey = appendJourneyQuestion(journey, { id: "q001", question: "Root", parentId: null, whyNeeded: null, resumeCheckpoint: null, noteRefs: ["notes/shared.md"] });
  journey = appendJourneyQuestion(journey, { id: "q002", question: "Child", parentId: "q001", whyNeeded: "Broken arrow", resumeCheckpoint: "Return here", noteRefs: [] });
  journey = setJourneyQuestionNoteRefs(journey, "q002", ["notes/shared.md"]);
  writeLearningJourney(root, journey);
  const result = readLearningJourney(root);
  assert.equal(result.exists, true);
  assert.equal(result.journey.questions[1].parentId, "q001");
  assert.deepEqual(result.journey.questions.map((item) => item.noteRefs), [["notes/shared.md"], ["notes/shared.md"]]);
  assert.equal(nextJourneyQuestionId(result.journey), "q003");
});

test("reports malformed parent links and cycles", () => {
  const root = mkdtempSync(path.join(tmpdir(), "journey-test-"));
  const journey = { version: 1, rootId: "q001", questions: [
    { id: "q001", question: "A", parentId: "q002", whyNeeded: null, resumeCheckpoint: null, noteRefs: [] },
    { id: "q002", question: "B", parentId: "q001", whyNeeded: null, resumeCheckpoint: null, noteRefs: [] },
    { id: "q003", question: "C", parentId: "missing", whyNeeded: null, resumeCheckpoint: null, noteRefs: [] },
  ] };
  assert.throws(() => writeLearningJourney(root, journey), /cycle detected/);
});
