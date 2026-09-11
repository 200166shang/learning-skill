import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-goal-start-"));
const at = (minute) => `2026-09-11T01:${String(minute).padStart(2, "0")}:00Z`;
const setup = () => { const workspace = temp(), goal = executeLearningGoalCommand(workspace, { type: "create", title: "Robot LLM", objective: "Understand the chain", createdAt: at(0) }), [root] = executeLearningGoalCommand(workspace, { type: "add_roots", goalId: goal.id, questions: ["How does language become action?"], acceptedAt: at(1) }); return { workspace, goal, root }; };

test("starts an Episode from stored Root Intent text and links it atomically", () => {
  const { workspace, goal, root } = setup();
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: root.id, createdAt: at(2) });
  const current = inspectLearningWorkspace(workspace), stored = current.goals.goals.goals[0].rootIntents[0];
  assert.equal(stored.episodeId, "e001"); assert.equal(current.journey.journey.questions[0].question, stored.question); assert.deepEqual(current.state.state.focusStack, ["q001"]);
});

test("active retry is idempotent and a completed Root Intent cannot restart", () => {
  const { workspace, goal, root } = setup(), start = { type: "start", goalId: goal.id, rootIntentId: root.id, createdAt: at(2) };
  executeLearningTransition(workspace, start); executeLearningTransition(workspace, start);
  assert.equal(inspectLearningWorkspace(workspace).journey.journey.episodes.length, 1);
  executeLearningTransition(workspace, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["end-to-end chain"], gaps: [], target: { title: "Language to action", kind: "concept" }, createdAt: at(3) });
  assert.throws(() => executeLearningTransition(workspace, start), /already started/);
});

test("Goal-backed Episodes retain normal child PUSH and root closure semantics", () => {
  const { workspace, goal, root } = setup();
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: root.id, createdAt: at(2) });
  executeLearningTransition(workspace, { type: "push", question: "How is dispatch resolved?", whyNeeded: "Dispatch connects planning to action", resumeCheckpoint: "Return to the end-to-end chain", accepted: true, relationship: "blocking", createdAt: at(3) });
  executeLearningTransition(workspace, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["dispatch"], gaps: [], createdAt: at(4) });
  executeLearningTransition(workspace, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["chain"], gaps: [], target: { title: "Robot LLM chain", kind: "concept" }, createdAt: at(5) });
  const current = inspectLearningWorkspace(workspace); assert.equal(current.state.state.mode, "idle"); assert.equal(current.journey.journey.episodes[0].status, "closed"); assert.equal(current.targets.targets.targets.length, 1);
});
