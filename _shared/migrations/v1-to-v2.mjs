import { existsSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

import { emptyLearningEvidence, writeLearningEvidence } from "../lib/learning-evidence.mjs";
import { writeLearningJourney } from "../lib/learning-journey.mjs";
import { idleLearningState, writeLearningState } from "../lib/learning-state.mjs";

const text = (value) => typeof value === "string" ? value.trim() : "";

export function migrateV1ToV2(workspace) {
  const root = path.resolve(workspace);
  const journeyPath = path.join(root, ".learning", "journey.yaml");
  const statePath = path.join(root, ".learning", "state.yaml");
  const oldJourney = YAML.parse(readFileSync(journeyPath, "utf8")) || {};
  const oldState = existsSync(statePath) ? YAML.parse(readFileSync(statePath, "utf8")) || {} : {};
  const rawQuestions = Array.isArray(oldJourney.questions) ? oldJourney.questions : [];
  const stack = (Array.isArray(oldState.focus_stack) ? oldState.focus_stack : [])
    .map((frame) => typeof frame === "string" ? frame : text(frame?.id))
    .filter(Boolean);
  const activeIds = new Set(stack);
  const active = stack.length > 0;
  const now = new Date().toISOString();
  let abandonedNumber = active ? 2 : 1;

  const abandonedEpisodes = [];
  const questions = rawQuestions.map((question) => {
    const id = text(question.id);
    const isActive = activeIds.has(id);
    let episodeId = "e001";
    let parentId = text(question.parent_id) || null;
    if (active && !isActive) {
      episodeId = `e${String(abandonedNumber).padStart(3, "0")}`;
      abandonedNumber += 1;
      parentId = null;
      abandonedEpisodes.push({ id: episodeId, rootQuestionId: id, status: "abandoned", startedAt: null, closedAt: now });
    }
    return {
      id,
      episodeId,
      parentId,
      question: text(question.question),
      whyNeeded: text(question.why_needed) || null,
      resumeCheckpoint: text(question.resume_checkpoint) || null,
      status: "open",
      openedAt: null,
      closedAt: null,
      noteRefs: Array.isArray(question.note_refs) ? question.note_refs : [],
    };
  });
  const episodes = active
    ? [{ id: "e001", rootQuestionId: stack[0], status: "active", startedAt: null, closedAt: null }, ...abandonedEpisodes]
    : questions.length ? [{ id: "e001", rootQuestionId: text(oldJourney.root_id) || questions[0].id, status: "abandoned", startedAt: null, closedAt: now }] : [];
  const journey = { version: 2, episodes, questions };
  const state = active
    ? { version: 2, mode: "active", activeEpisodeId: "e001", focusStack: stack }
    : idleLearningState();
  const evidence = emptyLearningEvidence();

  writeLearningJourney(root, journey);
  writeLearningEvidence(root, evidence, journey);
  writeLearningState(root, state, journey);

  const oldOverview = path.join(root, "SYNTHESIS.md");
  const overview = path.join(root, "OVERVIEW.md");
  if (existsSync(oldOverview) && !existsSync(overview)) renameSync(oldOverview, overview);
  return {
    journey,
    state,
    evidence,
    warnings: active
      ? ["V1 had no verification evidence; the active path remains open and inactive history is abandoned"]
      : ["V1 had no completion evidence; migrated history is marked abandoned"],
  };
}
