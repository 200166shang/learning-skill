import { appendJourneyQuestion, closeEpisode, closeJourneyQuestion } from "./learning-journey.mjs";
import { idleLearningState, validateLearningState } from "./learning-state.mjs";

export function recordVerification(evidence,v){if(!["child_connection","root_teach_back","review"].includes(v.kind))throw new Error("invalid verification kind");return{...evidence,verifications:[...evidence.verifications,v]};}

export function pushAcceptedBlockingQuestion(journey, state, question, decision) {
  if (decision?.accepted !== true) throw new Error("learner acceptance is required before persisting a proposed question");
  if (decision.relationship !== "blocking") throw new Error("only a blocking gap may be pushed onto the active path");
  if (state.mode !== "active" || state.activeEpisodeId !== question.episodeId) throw new Error("an active matching Episode is required");
  if (state.focusStack.at(-1) !== question.parentId) throw new Error("the current focus must be the proposed child's parent");
  const nextJourney = appendJourneyQuestion(journey, question);
  const nextState = { ...state, focusStack: [...state.focusStack, question.id] };
  const warnings = validateLearningState(nextState, nextJourney);
  if (warnings.length) throw new Error(`invalid pushed learning state: ${warnings.join("; ")}`);
  return { journey: nextJourney, state: nextState };
}

export function closeVerifiedQuestion(journey, evidence, state, verification) {
  const question = journey.questions.find((candidate) => candidate.id === verification.questionId);
  if (!question) throw new Error(`question not found: ${verification.questionId}`);
  const episode = journey.episodes.find((candidate) => candidate.id === question.episodeId);
  const root = episode?.rootQuestionId === question.id;
  const requiredKind = root ? "root_teach_back" : "child_connection";
  if (verification.kind !== requiredKind || verification.result !== "pass") throw new Error(`${requiredKind} pass evidence is required`);
  if (verification.episodeId !== question.episodeId) throw new Error("verification episode mismatch");
  if (state.mode !== "active" || state.activeEpisodeId !== question.episodeId) throw new Error("matching active State is required");
  if (question.status !== "open" || episode?.status !== "active") throw new Error("only an open question in an active Episode can close");

  if (root) {
    if (state.focusStack.length !== 1 || state.focusStack[0] !== question.id) throw new Error("State must have returned to the root before root closure");
    const stateWarnings = validateLearningState(state, journey);
    if (stateWarnings.length) throw new Error(`cannot close root: ${stateWarnings.join("; ")}`);
  } else {
    if (state.focusStack.at(-1) !== question.id) throw new Error("only current child can close");
    const stateWarnings = validateLearningState(state, journey);
    if (stateWarnings.length) throw new Error(`cannot close child: ${stateWarnings.join("; ")}`);
  }

  const nextJourney = closeJourneyQuestion(journey, question.id, verification.createdAt);
  const nextEvidence = recordVerification(evidence, verification);
  if (root) {
    return {
      journey: closeEpisode(nextJourney, episode.id, verification.createdAt),
      evidence: nextEvidence,
      state: idleLearningState(),
    };
  }
  return {
    journey: nextJourney,
    evidence: nextEvidence,
    state: { ...state, focusStack: state.focusStack.slice(0, -1) },
  };
}
