import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-goals-"));
const at = (minute) => `2026-09-11T00:${String(minute).padStart(2, "0")}:00Z`;

test("creates and reloads a stable Goal with source references and accepted roots", () => {
  const root = temp();
  const goal = executeLearningGoalCommand(root, { type: "create", title: "XiaoMo robot LLM", objective: "Explain concepts, source, and end-to-end flow", sources: [{ ref: "/notes/xiaomo", role: "notes" }, { ref: "https://example.test/repo", role: "code" }], createdAt: at(0) });
  const roots = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["What role does the module play?", "How does language become robot action?"], acceptedAt: at(1) });
  executeLearningGoalCommand(root, { type: "update", goalId: goal.id, title: "XiaoMo LLM module", objective: "Explain the complete implementation chain" });

  const inspection = inspectLearningWorkspace(root), reloaded = inspection.goals.goals.goals[0];
  assert.equal(inspection.status, "current");
  assert.equal(reloaded.id, "g001");
  assert.equal(reloaded.title, "XiaoMo LLM module");
  assert.deepEqual(reloaded.sources, [{ ref: "/notes/xiaomo", role: "notes" }, { ref: "https://example.test/repo", role: "code" }]);
  assert.deepEqual(roots.map((item) => item.id), ["rq001", "rq002"]);
  assert.equal(reloaded.rootIntents.length, 2);
  assert.equal(inspection.state.state.mode, "idle");
  assert.doesNotMatch(readFileSync(path.join(root, ".learning", "goals.yaml"), "utf8"), /source contents/i);
});

test("root intent wording is editable before it starts", () => {
  const root = temp(), goal = executeLearningGoalCommand(root, { type: "create", title: "Goal", objective: "Understand it", createdAt: at(0) });
  const [intent] = executeLearningGoalCommand(root, { type: "add_roots", goalId: goal.id, questions: ["Initial question"], acceptedAt: at(1) });
  const updated = executeLearningGoalCommand(root, { type: "update_root", goalId: goal.id, rootIntentId: intent.id, question: "Revised question" });
  assert.equal(updated.id, "rq001"); assert.equal(updated.question, "Revised question");
});

test("goals are optional in existing schema-v2 workspaces", () => {
  const root = temp();
  executeLearningGoalCommand(root, { type: "create", title: "Temporary", objective: "Initialize", createdAt: at(0) });
  unlinkSync(path.join(root, ".learning", "goals.yaml"));
  const inspection = inspectLearningWorkspace(root);
  assert.equal(inspection.status, "current"); assert.deepEqual(inspection.goals.goals.goals, []);
});
