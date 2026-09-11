import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { projectLearningMap } from "./learning-map-view.mjs";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-map-view-"));
const at = (minute) => `2026-09-11T06:${String(minute).padStart(2, "0")}:00Z`;
const snapshot = (root) => Object.fromEntries(readdirSync(path.join(root, ".learning")).map((name) => [name, readFileSync(path.join(root, ".learning", name), "utf8")]));
const project = (root, goalId) => {
  const inspection = inspectLearningWorkspace(root);
  assert.equal(inspection.status, "current", inspection.warnings?.join("; "));
  return projectLearningMap({ goals: inspection.goals.goals, journey: inspection.journey.journey, evidence: inspection.evidence.evidence, state: inspection.state.state, targets: inspection.targets.targets }, { goalId });
};

test("projects Goal roots and the complete historical Episode tree", () => {
  const root = temp();
  const goal = executeLearningGoalCommand(root, { type: "create", title: "Robot LLM", objective: "Explain the whole chain", createdAt: at(0) });
  const roots = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Completed root?", "Active root?", "Pending root?"], acceptedAt: at(1) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["root"], gaps: [], target: { title: "Completed", kind: "concept" }, createdAt: at(3) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: roots[1].id, createdAt: at(4) });
  executeLearningTransition(root, { type: "push", question: "First child?", whyNeeded: "First gap", resumeCheckpoint: "Resume root", accepted: true, relationship: "blocking", createdAt: at(5) });
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["connection"], gaps: [], createdAt: at(6) });
  executeLearningTransition(root, { type: "push", question: "Sibling child?", whyNeeded: "Second gap", resumeCheckpoint: "Resume dispatch", accepted: true, relationship: "blocking", createdAt: at(7) });
  mkdirSync(path.join(root, "notes"), { recursive: true });
  writeFileSync(path.join(root, "notes", "dispatch.md"), "---\ntitle: Dispatch\n---\nBody\n");
  executeLearningTransition(root, { type: "set_note_refs", questionId: "q004", noteRefs: ["notes/dispatch.md"] });

  const before = snapshot(root), result = project(root);
  assert.deepEqual(result.roots.map((item) => item.status), ["completed", "active", "pending"]);
  assert.deepEqual(result.graph.nodes.filter((node) => node.kind === "question").map((node) => node.questionId), ["q002", "q003", "q004"]);
  assert.deepEqual(result.graph.edges.filter((edge) => edge.kind === "blocking-child"), [
    { source: "question:q002", target: "question:q003", kind: "blocking-child" },
    { source: "question:q002", target: "question:q004", kind: "blocking-child" },
  ]);
  assert.equal(result.current.questionId, "q004");
  assert.equal(result.current.whyNeeded, "Second gap");
  assert.equal(result.current.resumeCheckpoint, "Resume dispatch");
  assert.equal(result.current.popDestinationQuestionId, "q002");
  assert.deepEqual(result.current.noteRefs, ["notes/dispatch.md"]);
  assert.deepEqual(result.graph.nodes.find((node) => node.questionId === "q004").noteRefs, ["notes/dispatch.md"]);
  assert.equal(result.graph.nodes.find((node) => node.questionId === "q003").status, "completed");
  assert.deepEqual(snapshot(root), before);
  assert.deepEqual(project(root), result);
});

test("POP and root closure update current state without inventing a current node", () => {
  const root = temp();
  const goal = executeLearningGoalCommand(root, { type: "create", title: "Goal", objective: "Objective", createdAt: at(0) });
  const [intent] = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Root?"], acceptedAt: at(0) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: intent.id, createdAt: at(0) });
  executeLearningTransition(root, { type: "push", question: "Child?", whyNeeded: "Gap", resumeCheckpoint: "Resume root", accepted: true, relationship: "blocking", createdAt: at(1) });
  assert.equal(project(root).current.questionId, "q002");
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["connection"], gaps: [], createdAt: at(2) });
  assert.equal(project(root).current.questionId, "q001");
  executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["root"], gaps: [], target: { title: "Root", kind: "concept" }, createdAt: at(3) });
  const closed = project(root, goal.id);
  assert.equal(closed.mode, "idle");
  assert.equal(closed.current, null);
  assert.equal(closed.roots[0].status, "completed");
  assert.equal(closed.graph.nodes.find((node) => node.kind === "root").status, "completed");
  assert.equal(closed.graph.nodes.some((node) => node.status === "current"), false);
});

test("direct question-first Episode works without Goal context", () => {
  const root = temp();
  executeLearningTransition(root, { type: "start", question: "Why PWM?", createdAt: at(0) });
  const result = project(root);
  assert.equal(result.goal, null);
  assert.equal(result.current.questionId, "q001");
  assert.equal(result.graph.nodes[0].kind, "question");
  assert.deepEqual(result.availableGoals, []);
  assert.deepEqual(result.current.noteRefs, []);
});

test("invalid cross-model links fail canonical inspection before projection", () => {
  const root = temp();
  const goal = executeLearningGoalCommand(root, { type: "create", title: "Goal", objective: "Objective", createdAt: at(0) });
  const [intent] = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Root?"], acceptedAt: at(1) });
  executeLearningTransition(root, { type: "start", goalId: goal.id, rootIntentId: intent.id, createdAt: at(2) });
  const target = path.join(root, ".learning", "goals.yaml");
  writeFileSync(target, readFileSync(target, "utf8").replace("episode_id: e001", "episode_id: e999"));
  assert.equal(inspectLearningWorkspace(root).status, "invalid");
});
