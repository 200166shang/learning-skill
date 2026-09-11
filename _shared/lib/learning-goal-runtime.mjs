import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { addRootIntents, createLearningGoal, emptyLearningGoals, updateLearningGoal, updateRootIntent, writeLearningGoals } from "./learning-goals.mjs";
import { writeLearningJourney } from "./learning-journey.mjs";
import { emptyLearningEvidence, writeLearningEvidence } from "./learning-evidence.mjs";
import { idleLearningState, writeLearningState } from "./learning-state.mjs";
import { emptyLearningTargets, writeLearningTargets } from "./learning-targets.mjs";
import { inspectLearningWorkspace, writeWorkspaceManifest } from "./learning-workspace.mjs";
import { GOAL_INTENT_SCHEMA, validateIntent } from "./learning-cli-contracts.mjs";
import { withLearningWorkspaceMutationLock } from "./learning-document-runtime.mjs";

function ensureWorkspace(workspace) {
  const inspection = inspectLearningWorkspace(workspace);
  if (inspection.status === "current") return inspection;
  if (inspection.status !== "empty") throw new Error(`workspace is invalid for goal mutation: ${inspection.status}`);
  const journey = { version: 2, episodes: [], questions: [] }, evidence = emptyLearningEvidence(), state = idleLearningState(), targets = emptyLearningTargets(), goals = emptyLearningGoals();
  writeWorkspaceManifest(workspace); writeLearningJourney(workspace, journey); writeLearningTargets(workspace, targets, journey); writeLearningEvidence(workspace, evidence, journey, targets); writeLearningState(workspace, state, journey); writeLearningGoals(workspace, goals, journey);
  return inspectLearningWorkspace(workspace);
}

function persistGoals(workspace, goals, journey) {
  const stage = mkdtempSync(path.join(tmpdir(), "learning-goal-"));
  try {
    const staged = writeLearningGoals(stage, goals, journey), target = path.join(path.resolve(workspace), ".learning", "goals.yaml"), backup = existsSync(target) ? readFileSync(target) : null;
    mkdirSync(path.dirname(target), { recursive: true });
    try { renameSync(staged, target); } catch (error) { if (backup === null) rmSync(target, { force: true }); else writeFileSync(target, backup); throw error; }
  } finally { rmSync(stage, { recursive: true, force: true }); }
}

function executeLearningGoalCommandLocked(workspace, intent) {
  const initial = inspectLearningWorkspace(workspace);
  if (intent.type === "list" && initial.status === "empty") return [];
  if (intent.type === "show" && initial.status === "empty") throw new Error(`goal not found: ${intent.goalId}`);
  const inspection = ["list", "show"].includes(intent.type) ? initial : ensureWorkspace(workspace);
  if (inspection.status !== "current") throw new Error(`workspace is invalid for goal command: ${inspection.status}`);
  const current = structuredClone(inspection.goals.goals), journey = inspection.journey.journey;
  let model = current, result;
  if (intent.type === "create") { const created = createLearningGoal(model, intent, journey); model = created.model; result = created.goal; }
  else if (intent.type === "add_roots") { const added = addRootIntents(model, intent.goalId, (intent.questions || []).map((question) => ({ question, acceptedAt: intent.acceptedAt })), journey); model = added.model; result = added.roots; }
  else if (intent.type === "update") { model = updateLearningGoal(model, intent.goalId, intent, journey); result = model.goals.find((goal) => goal.id === intent.goalId); }
  else if (intent.type === "update_root") { model = updateRootIntent(model, intent.goalId, intent.rootIntentId, intent.question, journey); result = model.goals.find((goal) => goal.id === intent.goalId).rootIntents.find((root) => root.id === intent.rootIntentId); }
  else if (intent.type === "add_source" || intent.type === "remove_source") {
    const goal = model.goals.find((item) => item.id === intent.goalId); if (!goal) throw new Error(`goal not found: ${intent.goalId}`);
    const sources = intent.type === "add_source" ? [...goal.sources, { ref: intent.ref, role: intent.role }] : goal.sources.filter((source) => !(source.ref === intent.ref && (!intent.role || source.role === intent.role)));
    model = updateLearningGoal(model, intent.goalId, { sources }, journey); result = model.goals.find((item) => item.id === intent.goalId);
  } else if (intent.type === "close") { model = updateLearningGoal(model, intent.goalId, { closedAt: intent.closedAt }, journey); result = model.goals.find((goal) => goal.id === intent.goalId); }
  else if (intent.type === "list") return model.goals;
  else if (intent.type === "show") { const goal = model.goals.find((item) => item.id === intent.goalId); if (!goal) throw new Error(`goal not found: ${intent.goalId}`); return goal; }
  else throw new Error(`unknown goal command: ${intent.type}`);
  persistGoals(workspace, model, journey);
  const persisted = inspectLearningWorkspace(workspace); if (persisted.status !== "current") throw new Error(`goal mutation produced invalid workspace: ${persisted.warnings?.join("; ")}`);
  return result;
}

export function executeLearningGoalCommand(workspace, intent) {
  validateIntent(intent, GOAL_INTENT_SCHEMA, "goal");
  if (["list", "show"].includes(intent.type)) return executeLearningGoalCommandLocked(workspace, intent);
  return withLearningWorkspaceMutationLock(workspace, () => executeLearningGoalCommandLocked(workspace, intent));
}
