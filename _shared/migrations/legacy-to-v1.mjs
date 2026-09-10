import path from "node:path";
import { readLearningRecords, normalizeNotePath } from "../lib/learning-record.mjs";
import { readLearningState } from "../lib/learning-state.mjs";
import { validateLearningJourney } from "../lib/learning-journey.mjs";

const comparable = (value) => String(value ?? "").trim().replace(/[？?。.!！]+$/u, "");
const normalizedRef = (workspace, record, ref) => {
  const fromWorkspace = path.resolve(workspace, ref);
  const fromRecord = path.resolve(path.dirname(record.absolutePath), ref);
  const workspacePath = normalizeNotePath(workspace, fromWorkspace);
  return workspacePath.startsWith("notes/") ? workspacePath : normalizeNotePath(workspace, fromRecord);
};

export function buildLegacyV1Workspace(workspace) {
  const root = path.resolve(workspace);
  const stateResult = readLearningState(root);
  const recordResult = readLearningRecords(root);
  const warnings = [...stateResult.warnings, ...recordResult.warnings];
  if (warnings.length) throw new Error(`legacy workspace preflight failed: ${warnings.join("; ")}`);
  const recordsByPath = new Map(recordResult.records.map((record) => [record.notePath, record]));
  const framesByNote = new Map(stateResult.state.focusStack.filter((frame) => frame.note).map((frame) => [normalizeNotePath(root, path.resolve(root, frame.note)), frame]));
  const framesByQuestion = new Map(stateResult.state.focusStack.map((frame) => [comparable(frame.question), frame]));
  if (stateResult.state.rootQuestion.question && stateResult.state.rootQuestion.id) framesByQuestion.set(comparable(stateResult.state.rootQuestion.question), { id: stateResult.state.rootQuestion.id });
  const usedIds = new Set();
  const idByPath = new Map();
  let counter = 0;
  const allocate = () => {
    let id;
    do { counter += 1; id = `q${String(counter).padStart(3, "0")}`; } while (usedIds.has(id));
    usedIds.add(id);
    return id;
  };

  for (const record of recordResult.records) {
    const frame = framesByNote.get(record.notePath) || framesByQuestion.get(comparable(record.title));
    const id = frame?.id && !usedIds.has(frame.id) ? frame.id : allocate();
    usedIds.add(id);
    idByPath.set(record.notePath, id);
  }

  const questions = recordResult.records.map((record) => {
    const relations = record.relations.filter((relation) => relation?.type === "derived-from");
    const uniqueRelations = [...new Map(relations.map((relation) => [`${relation.ref || ""}|${relation.question || ""}`, relation])).values()];
    if (uniqueRelations.length > 1) warnings.push(`ambiguous derived-from relations omitted: ${record.notePath}`);
    const relation = uniqueRelations.length === 1 ? uniqueRelations[0] : null;
    const parentPath = relation?.ref ? normalizedRef(root, record, relation.ref) : null;
    if (parentPath && !recordsByPath.has(parentPath)) warnings.push(`migration parent not found: ${record.notePath} -> ${relation.ref}`);
    const frame = framesByNote.get(record.notePath) || framesByQuestion.get(comparable(record.title));
    return { id: idByPath.get(record.notePath), question: typeof relation?.question === "string" && relation.question.trim() ? relation.question.trim() : record.title, parentId: parentPath ? idByPath.get(parentPath) || null : null, whyNeeded: frame?.whyNeeded || null, resumeCheckpoint: frame?.resume?.checkpoint || null, noteRefs: [record.notePath] };
  });

  for (const [index, frame] of stateResult.state.focusStack.entries()) {
    if (questions.some((item) => item.id === frame.id)) continue;
    questions.push({ id: frame.id || allocate(), question: frame.question, parentId: index ? stateResult.state.focusStack[index - 1].id : null, whyNeeded: frame.whyNeeded, resumeCheckpoint: frame.resume.checkpoint, noteRefs: [] });
  }
  if (stateResult.state.rootQuestion.question && !questions.some((item) => item.id === stateResult.state.rootQuestion.id)) {
    questions.unshift({ id: stateResult.state.rootQuestion.id || allocate(), question: stateResult.state.rootQuestion.question, parentId: null, whyNeeded: null, resumeCheckpoint: null, noteRefs: [] });
  }
  const byId = new Map(questions.map((item) => [item.id, item]));
  for (let index = 1; index < stateResult.state.focusStack.length; index += 1) {
    const frame = stateResult.state.focusStack[index];
    const question = byId.get(frame.id);
    if (question && !question.parentId) question.parentId = stateResult.state.focusStack[index - 1].id;
  }
  for (const question of questions) {
    const seen = new Set([question.id]);
    let cursor = question;
    while (cursor?.parentId && byId.has(cursor.parentId)) {
      if (seen.has(cursor.parentId)) {
        warnings.push(`migration cycle omitted at: ${question.id}`);
        question.parentId = null;
        break;
      }
      seen.add(cursor.parentId);
      cursor = byId.get(cursor.parentId);
    }
  }
  const rootId = stateResult.state.rootQuestion.id && byId.has(stateResult.state.rootQuestion.id) ? stateResult.state.rootQuestion.id : questions.find((item) => !item.parentId)?.id || null;
  const journey = { version: 1, rootId, questions };
  const validationWarnings = validateLearningJourney(journey).filter((warning) => !warning.startsWith("non-standard journey question id"));
  if (validationWarnings.length) throw new Error(`invalid proposed learning journey: ${validationWarnings.join("; ")}`);
  return { journey, state: stateResult.state, warnings: [...new Set(warnings)] };
}
