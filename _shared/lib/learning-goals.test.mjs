import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { projectLearningGoalView, projectLearningGoals } from "./learning-view.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-goals-"));
const at = (minute) => `2026-09-11T00:${String(minute).padStart(2, "0")}:00Z`;

test("topic-first lifecycle persists accepted roots and derives status across reloads", () => {
  const root = temp();
  const goal = executeLearningGoalCommand(root, { type: "create", title: "XiaoMo robot LLM", objective: "Explain concepts, source, and the end-to-end chain", sources: [{ ref: "/notes/xiaomo", role: "notes" }, { ref: "/repo/robot", role: "code" }, { ref: "/course", role: "transcript" }], createdAt: at(0) });
  const roots = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["What role does the module play?", "How does language become robot action?", "Where is the chain implemented?"], acceptedAt: at(1) });
  let current = inspectLearningWorkspace(root), view = projectLearningGoalView(current.goals.goals.goals[0], current.journey.journey, current.evidence.evidence, current.state.state, current.targets.targets);
  assert.deepEqual(view.roots.map((item) => item.derivedStatus), ["pending", "pending", "pending"]); assert.equal(current.state.state.mode, "idle");

  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: roots[1].id, createdAt: at(2) });
  current = inspectLearningWorkspace(root); view = projectLearningGoalView(current.goals.goals.goals[0], current.journey.journey, current.evidence.evidence, current.state.state, current.targets.targets);
  assert.deepEqual(view.roots.map((item) => item.derivedStatus), ["pending", "active", "pending"]); assert.equal(view.roots[1].question, current.journey.journey.questions[0].question);

  executeLearningTransition(root, { type: "push", question: "How is a tool dispatched?", whyNeeded: "The action chain crosses this boundary", resumeCheckpoint: "Return to language becoming action", accepted: true, relationship: "blocking", createdAt: at(3) });
  current = inspectLearningWorkspace(root); view = projectLearningGoalView(current.goals.goals.goals[0], current.journey.journey, current.evidence.evidence, current.state.state, current.targets.targets);
  assert.deepEqual(view.roots[1].activePath.map((item) => item.questionId), ["q001", "q002"]);
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["dispatch boundary"], gaps: [], createdAt: at(4) });
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["complete chain"], gaps: [], target: { title: "Language to robot action", kind: "concept" }, createdAt: at(5) });
  current = inspectLearningWorkspace(root); view = projectLearningGoalView(current.goals.goals.goals[0], current.journey.journey, current.evidence.evidence, current.state.state, current.targets.targets);
  assert.equal(view.roots[1].derivedStatus, "completed"); assert.deepEqual(view.roots[1].targetIds, ["k001"]); assert.equal(current.state.state.mode, "idle"); assert.equal(current.journey.journey.episodes.length, 1);

  executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["How does feedback affect later decisions?"], acceptedAt: at(6) });
  current = inspectLearningWorkspace(root); assert.deepEqual(projectLearningGoals(current.goals.goals, current.journey.journey)[0].counts, { pending: 3, active: 0, completed: 1, abandoned: 0 });
});

test("goal-backed start is idempotent while active and rejects reuse after completion", () => {
  const root = temp(), goal = executeLearningGoalCommand(root, { type: "create", title: "Goal", objective: "Understand it", createdAt: at(0) });
  const [rootIntent] = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Why?"], acceptedAt: at(1) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: rootIntent.id, createdAt: at(2) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: rootIntent.id, createdAt: at(2) });
  assert.equal(inspectLearningWorkspace(root).journey.journey.episodes.length, 1);
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["why"], gaps: [], target: { title: "Why", kind: "concept" }, createdAt: at(3) });
  assert.throws(() => executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: rootIntent.id, createdAt: at(4) }), /already started/);
});

test("closing a goal leaves an active Episode unchanged", () => {
  const root = temp(), goal = executeLearningGoalCommand(root, { type: "create", title: "Goal", objective: "Understand it", createdAt: at(0) });
  const [rootIntent] = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Why?"], acceptedAt: at(1) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: rootIntent.id, createdAt: at(2) });
  executeLearningGoalCommand(root, { type: "close", goalId: goal.id, closedAt: at(3) });
  const current = inspectLearningWorkspace(root); assert.equal(current.state.state.mode, "active"); assert.equal(current.journey.journey.episodes[0].status, "active");
});
