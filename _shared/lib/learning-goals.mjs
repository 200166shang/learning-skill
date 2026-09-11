import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const text = (value) => typeof value === "string" ? value.trim() : "";
export const SOURCE_ROLES = new Set(["notes", "code", "transcript", "doc", "other"]);
export const emptyLearningGoals = () => ({ version: 1, goals: [] });

export function normalizeLearningGoals(input) {
  const warnings = [], source = input && typeof input === "object" ? input : {};
  if (source.goals != null && !Array.isArray(source.goals)) warnings.push("goals must be an array");
  const goals = (Array.isArray(source.goals) ? source.goals : []).flatMap((goal, goalIndex) => {
    if (!goal || !text(goal.id) || !text(goal.title) || !text(goal.objective)) {
      warnings.push(`goals[${goalIndex}] is missing id, title, or objective`); return [];
    }
    const sources = (Array.isArray(goal.sources) ? goal.sources : []).flatMap((item, index) => {
      if (!item || !text(item.ref) || !text(item.role)) { warnings.push(`goals[${goalIndex}].sources[${index}] is missing ref or role`); return []; }
      return [{ ref: String(item.ref), role: text(item.role) }];
    });
    const roots = (Array.isArray(goal.root_intents) ? goal.root_intents : []).flatMap((item, index) => {
      if (!item || !text(item.id) || !text(item.question)) { warnings.push(`goals[${goalIndex}].root_intents[${index}] is missing id or question`); return []; }
      return [{ id: text(item.id), question: text(item.question), acceptedAt: item.accepted_at ? String(item.accepted_at) : null, episodeId: text(item.episode_id) || null }];
    });
    return [{ id: text(goal.id), title: text(goal.title), objective: text(goal.objective), sources, rootIntents: roots, createdAt: goal.created_at ? String(goal.created_at) : null, closedAt: goal.closed_at ? String(goal.closed_at) : null }];
  });
  return { goals: { version: Number(source.version) || 1, goals }, warnings };
}

export function validateLearningGoals(model, journey = { episodes: [], questions: [] }) {
  const warnings = [], goalIds = new Set(), rootIds = new Set(), linkedEpisodes = new Set();
  const episodes = new Map(journey.episodes.map((episode) => [episode.id, episode]));
  const questions = new Map(journey.questions.map((question) => [question.id, question]));
  for (const goal of model.goals) {
    if (goalIds.has(goal.id)) warnings.push(`duplicate goal id: ${goal.id}`); goalIds.add(goal.id);
    if (!/^g\d+$/.test(goal.id)) warnings.push(`non-standard goal id: ${goal.id}`);
    if (!text(goal.title) || !text(goal.objective)) warnings.push(`goal requires title and objective: ${goal.id}`);
    for (const source of goal.sources) if (!SOURCE_ROLES.has(source.role)) warnings.push(`invalid source role: ${goal.id}:${source.role}`);
    for (const root of goal.rootIntents) {
      if (rootIds.has(root.id)) warnings.push(`duplicate root intent id: ${root.id}`); rootIds.add(root.id);
      if (!/^rq\d+$/.test(root.id)) warnings.push(`non-standard root intent id: ${root.id}`);
      if (!text(root.question)) warnings.push(`root intent requires question: ${root.id}`);
      if (root.episodeId) {
        if (linkedEpisodes.has(root.episodeId)) warnings.push(`episode linked by multiple root intents: ${root.episodeId}`); linkedEpisodes.add(root.episodeId);
        const episode = episodes.get(root.episodeId), rootQuestion = questions.get(episode?.rootQuestionId);
        if (!episode) warnings.push(`root intent episode not found: ${root.id}`);
        else if (!rootQuestion || text(rootQuestion.question) !== text(root.question)) warnings.push(`root intent question mismatch: ${root.id}`);
      }
    }
  }
  return [...new Set(warnings)];
}

const nextId = (items, prefix) => { const used = new Set(items.map((item) => item.id)); let number = Math.max(0, ...[...used].filter((id) => new RegExp(`^${prefix}\\d+$`).test(id)).map((id) => Number(id.slice(prefix.length)))); do number += 1; while (used.has(`${prefix}${String(number).padStart(3, "0")}`)); return `${prefix}${String(number).padStart(3, "0")}`; };
export const nextGoalId = (model) => nextId(model.goals, "g");
export const nextRootIntentId = (model) => nextId(model.goals.flatMap((goal) => goal.rootIntents), "rq");

export function createLearningGoal(model, input, journey) {
  const goal = { id: nextGoalId(model), title: text(input.title), objective: text(input.objective), sources: (input.sources || []).map((item) => ({ ref: String(item.ref), role: text(item.role) })), rootIntents: [], createdAt: input.createdAt || null, closedAt: null };
  const next = { ...model, goals: [...model.goals, goal] }, warnings = validateLearningGoals(next, journey);
  if (warnings.length) throw new Error(warnings.join("; ")); return { model: next, goal };
}

export function addRootIntents(model, goalId, roots, journey) {
  const goal = model.goals.find((item) => item.id === goalId); if (!goal) throw new Error(`goal not found: ${goalId}`); if (goal.closedAt) throw new Error(`goal is closed: ${goalId}`);
  let idModel = model;
  const added = roots.map((item) => { const root = { id: nextRootIntentId(idModel), question: text(item.question), acceptedAt: item.acceptedAt || null, episodeId: null }; idModel = { ...idModel, goals: idModel.goals.map((candidate) => candidate.id === goalId ? { ...candidate, rootIntents: [...candidate.rootIntents, root] } : candidate) }; return root; });
  const warnings = validateLearningGoals(idModel, journey); if (warnings.length) throw new Error(warnings.join("; ")); return { model: idModel, roots: added };
}

export function updateLearningGoal(model, goalId, changes, journey) {
  if (!model.goals.some((goal) => goal.id === goalId)) throw new Error(`goal not found: ${goalId}`);
  const next = { ...model, goals: model.goals.map((goal) => goal.id !== goalId ? goal : { ...goal, ...(changes.title !== undefined ? { title: text(changes.title) } : {}), ...(changes.objective !== undefined ? { objective: text(changes.objective) } : {}), ...(changes.sources !== undefined ? { sources: changes.sources.map((item) => ({ ref: String(item.ref), role: text(item.role) })) } : {}), ...(changes.closedAt !== undefined ? { closedAt: changes.closedAt } : {}) }) };
  const warnings = validateLearningGoals(next, journey); if (warnings.length) throw new Error(warnings.join("; ")); return next;
}

export function linkRootIntent(model, goalId, rootIntentId, episodeId) {
  const goal = model.goals.find((item) => item.id === goalId), root = goal?.rootIntents.find((item) => item.id === rootIntentId);
  if (!goal) throw new Error(`goal not found: ${goalId}`); if (!root) throw new Error(`root intent not found in goal: ${rootIntentId}`); if (root.episodeId && root.episodeId !== episodeId) throw new Error(`root intent already started: ${rootIntentId}`);
  return { ...model, goals: model.goals.map((item) => item.id !== goalId ? item : { ...item, rootIntents: item.rootIntents.map((candidate) => candidate.id === rootIntentId ? { ...candidate, episodeId } : candidate) }) };
}

export function updateRootIntent(model, goalId, rootIntentId, question, journey) {
  const goal = model.goals.find((item) => item.id === goalId), root = goal?.rootIntents.find((item) => item.id === rootIntentId);
  if (!goal) throw new Error(`goal not found: ${goalId}`); if (!root) throw new Error(`root intent not found in goal: ${rootIntentId}`); if (root.episodeId) throw new Error(`started root intent is immutable: ${rootIntentId}`);
  const next = { ...model, goals: model.goals.map((item) => item.id !== goalId ? item : { ...item, rootIntents: item.rootIntents.map((candidate) => candidate.id === rootIntentId ? { ...candidate, question: text(question) } : candidate) }) };
  const warnings = validateLearningGoals(next, journey); if (warnings.length) throw new Error(warnings.join("; ")); return next;
}

export function readLearningGoals(workspace) { const target = path.join(path.resolve(workspace), ".learning", "goals.yaml"); if (!existsSync(target)) return { ...normalizeLearningGoals({}), exists: false, path: target }; try { const result = normalizeLearningGoals(YAML.parse(readFileSync(target, "utf8"), { prettyErrors: true })); return { ...result, exists: true, path: target }; } catch (error) { return { ...normalizeLearningGoals({}), exists: true, warnings: [`malformed goals.yaml: ${error.message}`], path: target }; } }
export function writeLearningGoals(workspace, model, journey = { episodes: [], questions: [] }) { const warnings = validateLearningGoals(model, journey); if (warnings.length) throw new Error(`invalid learning goals: ${warnings.join("; ")}`); const output = { version: 1, goals: model.goals.map((goal) => ({ id: goal.id, title: goal.title, objective: goal.objective, sources: goal.sources, root_intents: goal.rootIntents.map((root) => ({ id: root.id, question: root.question, accepted_at: root.acceptedAt, episode_id: root.episodeId })), created_at: goal.createdAt, closed_at: goal.closedAt })) }; const target = path.join(path.resolve(workspace), ".learning", "goals.yaml"); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, YAML.stringify(output, { lineWidth: 0 })); return target; }
