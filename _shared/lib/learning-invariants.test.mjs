import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { emptyLearningEvidence } from "./learning-evidence.mjs";
import {
  appendJourneyQuestion,
  closeEpisode,
  closeJourneyQuestion,
  startEpisode,
} from "./learning-journey.mjs";
import {
  closeVerifiedQuestion,
  pushAcceptedBlockingQuestion,
} from "./learning-loop.mjs";
import { validateLearningState } from "./learning-state.mjs";
import { inspectLearningWorkspace, upgradeLearningWorkspace } from "./learning-workspace.mjs";

const started = () => startEpisode(
  { version: 2, episodes: [], questions: [] },
  { id: "e001", rootQuestionId: "q001", question: "Root?", startedAt: "2026-09-11T00:00:00Z" },
);

const activeState = (focusStack = ["q001"]) => ({
  version: 2,
  mode: "active",
  activeEpisodeId: "e001",
  focusStack,
});

const verification = (questionId, kind) => ({
  id: `v-${questionId}`,
  episodeId: "e001",
  questionId,
  kind,
  result: "pass",
  independence: "unaided",
  demonstrated: ["the repaired connection"],
  gaps: [],
  createdAt: "2026-09-11T01:00:00Z",
});

test("only an accepted blocking proposal is persisted and pushed", () => {
  const question = {
    id: "q002",
    episodeId: "e001",
    parentId: "q001",
    question: "Child?",
    whyNeeded: "A causal arrow is missing",
    resumeCheckpoint: "Continue at the parent output",
    openedAt: "2026-09-11T00:30:00Z",
    noteRefs: [],
  };

  assert.throws(
    () => pushAcceptedBlockingQuestion(started(), activeState(), question, { accepted: false, relationship: "blocking" }),
    /learner acceptance/,
  );
  assert.throws(
    () => pushAcceptedBlockingQuestion(started(), activeState(), question, { accepted: true, relationship: "side" }),
    /blocking gap/,
  );

  const result = pushAcceptedBlockingQuestion(
    started(),
    activeState(),
    question,
    { accepted: true, relationship: "blocking" },
  );
  assert.equal(result.journey.questions.at(-1).id, "q002");
  assert.deepEqual(result.state.focusStack, ["q001", "q002"]);
});

test("child pass closes only the current child and pops to its parent", () => {
  const pushed = pushAcceptedBlockingQuestion(started(), activeState(), {
    id: "q002",
    episodeId: "e001",
    parentId: "q001",
    question: "Child?",
    whyNeeded: "gap",
    resumeCheckpoint: "arrow",
    openedAt: "2026-09-11T00:30:00Z",
    noteRefs: [],
  }, { accepted: true, relationship: "blocking" });

  const result = closeVerifiedQuestion(
    pushed.journey,
    emptyLearningEvidence(),
    pushed.state,
    verification("q002", "child_connection"),
  );
  assert.equal(result.journey.questions.find((question) => question.id === "q002").status, "closed");
  assert.equal(result.journey.questions.find((question) => question.id === "q001").status, "open");
  assert.deepEqual(result.state.focusStack, ["q001"]);
});

test("root pass is rejected until state and all open questions have returned to root", () => {
  const journey = appendJourneyQuestion(started(), {
    id: "q002",
    episodeId: "e001",
    parentId: "q001",
    question: "Child?",
    whyNeeded: "gap",
    resumeCheckpoint: "arrow",
    openedAt: "2026-09-11T00:30:00Z",
    noteRefs: [],
  });

  assert.throws(
    () => closeVerifiedQuestion(journey, emptyLearningEvidence(), activeState(["q001", "q002"]), verification("q001", "root_teach_back")),
    /returned to the root/,
  );
  assert.throws(
    () => closeVerifiedQuestion(journey, emptyLearningEvidence(), activeState(["q001"]), verification("q001", "root_teach_back")),
    /open questions.*focus_stack/,
  );
});

test("valid root pass closes root and Episode and enters IDLE", () => {
  const result = closeVerifiedQuestion(
    started(),
    emptyLearningEvidence(),
    activeState(),
    verification("q001", "root_teach_back"),
  );
  assert.equal(result.journey.questions[0].status, "closed");
  assert.equal(result.journey.episodes[0].status, "closed");
  assert.deepEqual(result.state, { version: 2, mode: "idle", activeEpisodeId: null, focusStack: [] });
});

test("closed Episodes and closed parents reject new children", () => {
  const child = {
    id: "q002",
    episodeId: "e001",
    parentId: "q001",
    question: "Child?",
    whyNeeded: "gap",
    resumeCheckpoint: "arrow",
    openedAt: "2026-09-11T00:30:00Z",
    noteRefs: [],
  };
  assert.throws(
    () => appendJourneyQuestion(closeEpisode(started(), "e001", "closed"), child),
    /active Episode/,
  );
  assert.throws(
    () => appendJourneyQuestion(closeJourneyQuestion(started(), "q001", "closed"), child),
    /open parent/,
  );
});

test("active State rejects dangling open questions outside its focus chain", () => {
  const journey = appendJourneyQuestion(started(), {
    id: "q002",
    episodeId: "e001",
    parentId: "q001",
    question: "Child?",
    whyNeeded: "gap",
    resumeCheckpoint: "arrow",
    openedAt: "2026-09-11T00:30:00Z",
    noteRefs: [],
  });
  assert.match(validateLearningState(activeState(), journey).join("\n"), /open questions.*focus_stack/);
});

const migrationWorkspace = () => mkdtempSync(path.join(tmpdir(), "learning-migration-invariant-"));
const write = (root, relative, content) => {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
};

test("V1 migration separates inactive history from the active open path", () => {
  const root = migrationWorkspace();
  write(root, ".learning/workspace.yaml", "schema_version: 1\n");
  write(root, ".learning/journey.yaml", `version: 1
root_id: q001
questions:
  - id: q001
    question: Root
    parent_id: null
    note_refs: []
  - id: q002
    question: Active child
    parent_id: q001
    note_refs: []
  - id: q003
    question: Historical side branch
    parent_id: q001
    note_refs: []
`);
  write(root, ".learning/state.yaml", "version: 1\nfocus_stack:\n  - id: q001\n  - id: q002\n");

  upgradeLearningWorkspace(root);
  const inspection = inspectLearningWorkspace(root);
  assert.equal(inspection.status, "current");
  assert.deepEqual(inspection.state.state.focusStack, ["q001", "q002"]);
  assert.equal(inspection.journey.journey.questions.find((question) => question.id === "q003").episodeId, "e002");
  assert.equal(inspection.journey.journey.episodes.find((episode) => episode.id === "e002").status, "abandoned");
  assert.equal(inspection.evidence.evidence.verifications.length, 0);
});

test("legacy migration keeps extra notes as abandoned history without fabricating evidence", () => {
  const root = migrationWorkspace();
  write(root, "notes/root.md", "---\ntitle: Root\n---\nRoot body\n");
  write(root, "notes/active.md", "---\ntitle: Active child\nrelations:\n  - type: derived-from\n    ref: root.md\n    question: Active child\n---\nActive body\n");
  write(root, "notes/historical.md", "---\ntitle: Historical note\n---\nHistorical body\n");
  write(root, ".learning/state.yaml", `version: 1
root_question:
  id: q001
  question: Root
focus_stack:
  - id: q001
    question: Root
    note: notes/root.md
  - id: q002
    question: Active child
    note: notes/active.md
    why_needed: gap
    resume:
      checkpoint: arrow
`);

  upgradeLearningWorkspace(root);
  const inspection = inspectLearningWorkspace(root);
  assert.equal(inspection.status, "current");
  assert.deepEqual(inspection.state.state.focusStack, ["q001", "q002"]);
  assert.ok(inspection.journey.journey.episodes.some((episode) => episode.status === "abandoned"));
  assert.equal(inspection.evidence.evidence.verifications.length, 0);
  assert.equal(existsSync(path.join(root, ".learning", "evidence.yaml")), true);
});
