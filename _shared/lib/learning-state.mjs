import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const text = (value) => typeof value === "string" ? value.trim() : "";

export function normalizeLearningState(input) {
  const warnings = [];
  const source = input && typeof input === "object" ? input : {};
  const rootSource = source.root_question && typeof source.root_question === "object" ? source.root_question : {};
  const frames = Array.isArray(source.focus_stack) ? source.focus_stack : [];
  if (source.focus_stack != null && !Array.isArray(source.focus_stack)) warnings.push("focus_stack must be an array");
  const focusStack = frames.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== "object" || !text(candidate.question)) {
      warnings.push(`focus_stack[${index}] is missing a question`);
      return [];
    }
    const resume = candidate.resume && typeof candidate.resume === "object" ? candidate.resume : {};
    return [{ id: text(candidate.id) || `frame-${index + 1}`, question: text(candidate.question), note: text(candidate.note) || null, whyNeeded: text(candidate.why_needed) || null, resume: { question: text(resume.question) || null, checkpoint: text(resume.checkpoint) || null } }];
  });
  return { state: { version: Number(source.version) || 1, rootQuestion: { id: text(rootSource.id) || focusStack[0]?.id || null, question: text(rootSource.question) || focusStack[0]?.question || null }, focusStack }, warnings };
}

export function validateLearningState(state) {
  const warnings = [];
  if (!state.rootQuestion.question && state.focusStack.length) warnings.push("root_question is missing; inferred from focus_stack");
  if (state.rootQuestion.question && state.focusStack[0] && state.rootQuestion.question !== state.focusStack[0].question) warnings.push("root_question does not match the first focus_stack frame");
  const ids = new Set();
  for (const frame of state.focusStack) {
    if (ids.has(frame.id)) warnings.push(`duplicate focus frame id: ${frame.id}`);
    ids.add(frame.id);
  }
  return warnings;
}

export function readLearningState(workspace) {
  const statePath = path.join(path.resolve(workspace), ".learning", "state.yaml");
  if (!existsSync(statePath)) return { ...normalizeLearningState({}), path: statePath };
  try {
    const normalized = normalizeLearningState(YAML.parse(readFileSync(statePath, "utf8"), { prettyErrors: true }));
    return { ...normalized, warnings: [...normalized.warnings, ...validateLearningState(normalized.state)], path: statePath };
  } catch (error) {
    return { ...normalizeLearningState({}), warnings: [`malformed state.yaml: ${error.message}`], path: statePath };
  }
}
