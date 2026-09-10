import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

import { readLearningRecords } from "../lib/learning-record.mjs";
import { idleLearningState } from "../lib/learning-state.mjs";

export function buildLegacyV2Workspace(workspace) {
  const root = path.resolve(workspace);
  const records = readLearningRecords(root);
  if (records.warnings.length) throw new Error(`legacy workspace preflight failed: ${records.warnings.join("; ")}`);
  const statePath = path.join(root, ".learning", "state.yaml");
  const rawState = existsSync(statePath) ? YAML.parse(readFileSync(statePath, "utf8")) || {} : {};
  const frames = Array.isArray(rawState.focus_stack) ? rawState.focus_stack : [];
  const frameIdsByNote = new Map(frames.filter((frame) => frame?.note && frame?.id).map((frame) => [String(frame.note), String(frame.id)]));
  const usedIds = new Set(frameIdsByNote.values());
  let questionNumber = 0;
  const allocateQuestionId = () => {
    let id;
    do {
      questionNumber += 1;
      id = `q${String(questionNumber).padStart(3, "0")}`;
    } while (usedIds.has(id));
    usedIds.add(id);
    return id;
  };
  const idsByNote = new Map(records.records.map((record) => [record.notePath, frameIdsByNote.get(record.notePath) || allocateQuestionId()]));
  const stack = frames.map((frame) => String(frame?.id || "")).filter(Boolean);
  const activeIds = new Set(stack);
  const active = stack.length > 0;
  const now = new Date().toISOString();

  const questions = records.records.map((record) => {
    const relation = record.relations.find((candidate) => candidate?.type === "derived-from");
    const relativeParent = relation?.ref
      ? path.normalize(path.join(path.dirname(record.notePath), relation.ref)).split(path.sep).join("/")
      : null;
    const frame = frames.find((candidate) => candidate?.note === record.notePath);
    return {
      id: idsByNote.get(record.notePath),
      parentId: idsByNote.get(relativeParent) || null,
      question: typeof relation?.question === "string" && relation.question.trim() ? relation.question.trim() : record.title,
      whyNeeded: frame?.why_needed || null,
      resumeCheckpoint: frame?.resume?.checkpoint || null,
      status: "open",
      openedAt: null,
      closedAt: null,
      noteRefs: [record.notePath],
    };
  });
  for (const [index, frame] of frames.entries()) {
    if (!frame?.id || questions.some((question) => question.id === String(frame.id))) continue;
    questions.push({
      id: String(frame.id),
      parentId: index ? String(frames[index - 1].id) : null,
      question: String(frame.question),
      whyNeeded: frame.why_needed || null,
      resumeCheckpoint: frame.resume?.checkpoint || null,
      status: "open",
      openedAt: null,
      closedAt: null,
      noteRefs: [],
    });
  }

  const episodes = [];
  let abandonedNumber = active ? 2 : 1;
  for (const question of questions) {
    if (activeIds.has(question.id)) {
      question.episodeId = "e001";
      const stackIndex = stack.indexOf(question.id);
      question.parentId = stackIndex > 0 ? stack[stackIndex - 1] : null;
      continue;
    }
    const episodeId = `e${String(abandonedNumber).padStart(3, "0")}`;
    abandonedNumber += 1;
    question.episodeId = episodeId;
    question.parentId = null;
    episodes.push({ id: episodeId, rootQuestionId: question.id, status: "abandoned", startedAt: null, closedAt: now });
  }
  if (active) episodes.unshift({ id: "e001", rootQuestionId: stack[0], status: "active", startedAt: null, closedAt: null });

  return {
    journey: { version: 2, episodes, questions },
    state: active ? { version: 2, mode: "active", activeEpisodeId: "e001", focusStack: stack } : idleLearningState(),
    warnings: [active
      ? "Legacy active position recovered; unrelated history was abandoned and no verification evidence was invented"
      : "Legacy notes contain no verification evidence; imported history is abandoned"],
  };
}
