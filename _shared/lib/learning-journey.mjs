import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const text = (value) => typeof value === "string" ? value.trim() : "";
const questionIdPattern = /^q\d+$/;

export function normalizeLearningJourney(input) {
  const warnings = [];
  const source = input && typeof input === "object" ? input : {};
  const candidates = Array.isArray(source.questions) ? source.questions : [];
  if (source.questions != null && !Array.isArray(source.questions)) warnings.push("questions must be an array");
  const questions = candidates.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== "object") {
      warnings.push(`questions[${index}] must be an object`);
      return [];
    }
    const id = text(candidate.id);
    const question = text(candidate.question);
    if (!id || !question) {
      warnings.push(`questions[${index}] is missing id or question`);
      return [];
    }
    const refs = Array.isArray(candidate.note_refs) ? candidate.note_refs : [];
    if (candidate.note_refs != null && !Array.isArray(candidate.note_refs)) warnings.push(`question ${id} note_refs must be an array`);
    return [{
      id,
      question,
      parentId: text(candidate.parent_id) || null,
      whyNeeded: text(candidate.why_needed) || null,
      resumeCheckpoint: text(candidate.resume_checkpoint) || null,
      noteRefs: [...new Set(refs.map(text).filter(Boolean))],
    }];
  });
  return { journey: { version: Number(source.version) || 1, rootId: text(source.root_id) || questions.find((item) => !item.parentId)?.id || null, questions }, warnings };
}

export function validateLearningJourney(journey) {
  const warnings = [];
  const ids = new Set();
  for (const question of journey.questions) {
    if (ids.has(question.id)) warnings.push(`duplicate journey question id: ${question.id}`);
    ids.add(question.id);
    if (!questionIdPattern.test(question.id)) warnings.push(`non-standard journey question id: ${question.id}`);
  }
  if (journey.rootId && !ids.has(journey.rootId)) warnings.push(`journey root not found: ${journey.rootId}`);
  for (const question of journey.questions) if (question.parentId && !ids.has(question.parentId)) warnings.push(`journey parent not found: ${question.id} -> ${question.parentId}`);

  const byId = new Map(journey.questions.map((item) => [item.id, item]));
  for (const question of journey.questions) {
    const seen = new Set([question.id]);
    let cursor = question;
    while (cursor?.parentId && byId.has(cursor.parentId)) {
      if (seen.has(cursor.parentId)) {
        warnings.push(`journey cycle detected at: ${question.id}`);
        break;
      }
      seen.add(cursor.parentId);
      cursor = byId.get(cursor.parentId);
    }
  }
  return [...new Set(warnings)];
}

export function readLearningJourney(workspace) {
  const journeyPath = path.join(path.resolve(workspace), ".learning", "journey.yaml");
  if (!existsSync(journeyPath)) return { ...normalizeLearningJourney({}), exists: false, path: journeyPath };
  try {
    const normalized = normalizeLearningJourney(YAML.parse(readFileSync(journeyPath, "utf8"), { prettyErrors: true }));
    return { ...normalized, exists: true, warnings: [...normalized.warnings, ...validateLearningJourney(normalized.journey)], path: journeyPath };
  } catch (error) {
    return { ...normalizeLearningJourney({}), exists: true, warnings: [`malformed journey.yaml: ${error.message}`], path: journeyPath };
  }
}

export function nextJourneyQuestionId(journey) {
  const used = new Set(journey.questions.map((item) => item.id));
  let number = Math.max(0, ...[...used].filter((id) => questionIdPattern.test(id)).map((id) => Number(id.slice(1))));
  do number += 1; while (used.has(`q${String(number).padStart(3, "0")}`));
  return `q${String(number).padStart(3, "0")}`;
}

export function appendJourneyQuestion(journey, question) {
  if (journey.questions.some((item) => item.id === question.id)) throw new Error(`journey question id already exists: ${question.id}`);
  const next = { ...journey, rootId: journey.rootId || question.id, questions: [...journey.questions, { ...question, noteRefs: [...new Set(question.noteRefs || [])] }] };
  const warnings = validateLearningJourney(next);
  if (warnings.some((warning) => warning.startsWith("journey parent not found") || warning.startsWith("journey cycle"))) throw new Error(warnings.join("; "));
  return next;
}

export function setJourneyQuestionNoteRefs(journey, id, noteRefs) {
  if (!journey.questions.some((item) => item.id === id)) throw new Error(`journey question not found: ${id}`);
  return { ...journey, questions: journey.questions.map((item) => item.id === id ? { ...item, noteRefs: [...new Set(noteRefs.map(text).filter(Boolean))] } : item) };
}

export function writeLearningJourney(workspace, journey) {
  const result = validateLearningJourney(journey);
  const fatal = result.filter((warning) => !warning.startsWith("non-standard journey question id"));
  if (fatal.length) throw new Error(`invalid learning journey: ${fatal.join("; ")}`);
  const output = {
    version: journey.version || 1,
    root_id: journey.rootId,
    questions: journey.questions.map((item) => ({ id: item.id, question: item.question, parent_id: item.parentId, why_needed: item.whyNeeded, resume_checkpoint: item.resumeCheckpoint, note_refs: item.noteRefs || [] })),
  };
  const target = path.join(path.resolve(workspace), ".learning", "journey.yaml");
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, YAML.stringify(output, { lineWidth: 0 }));
  return target;
}
