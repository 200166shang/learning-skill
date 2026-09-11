import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { emptyLearningEvidence, writeLearningEvidence } from "./learning-evidence.mjs";
import { nextEpisodeId, nextJourneyQuestionId, startEpisode, writeLearningJourney } from "./learning-journey.mjs";
import { closeVerifiedQuestion, pushAcceptedBlockingQuestion, recordVerification } from "./learning-loop.mjs";
import { idleLearningState, writeLearningState } from "./learning-state.mjs";
import { createKnowledgeTarget, emptyLearningTargets, nextKnowledgeTargetId, updateKnowledgeTarget, writeLearningTargets } from "./learning-targets.mjs";
import { emptyLearningGoals, linkRootIntent, writeLearningGoals } from "./learning-goals.mjs";
import { inspectLearningWorkspace, validateCanonicalSnapshot, writeWorkspaceManifest } from "./learning-workspace.mjs";

const files = ["workspace.yaml", "journey.yaml", "evidence.yaml", "state.yaml", "targets.yaml", "goals.yaml"];
const nextId = (items, prefix) => { const used = new Set(items.map((item) => item.id)); let number = Math.max(0, ...[...used].filter((id) => new RegExp(`^${prefix}\\d+$`).test(id)).map((id) => Number(id.slice(1)))); do number += 1; while (used.has(`${prefix}${String(number).padStart(3, "0")}`)); return `${prefix}${String(number).padStart(3, "0")}`; };

function load(workspace, type) {
  const inspection = inspectLearningWorkspace(workspace);
  if (inspection.status === "empty" && type === "start") return { journey: { version: 2, episodes: [], questions: [] }, evidence: emptyLearningEvidence(), state: idleLearningState(), targets: emptyLearningTargets(), goals: emptyLearningGoals() };
  if (inspection.status !== "current") throw new Error(`workspace is invalid for transition: ${inspection.status}`);
  return { journey: structuredClone(inspection.journey.journey), evidence: structuredClone(inspection.evidence.evidence), state: structuredClone(inspection.state.state), targets: structuredClone(inspection.targets.targets), goals: structuredClone(inspection.goals.goals) };
}

function persistAtomically(workspace, snapshot) {
  const warnings = validateCanonicalSnapshot(snapshot); if (warnings.length) throw new Error(`transition produced invalid workspace: ${warnings.join("; ")}`);
  const root = path.resolve(workspace), stage = mkdtempSync(path.join(tmpdir(), "learning-transition-")), targetDir = path.join(root, ".learning"), backups = new Map();
  try {
    writeWorkspaceManifest(stage); writeLearningJourney(stage, snapshot.journey); writeLearningTargets(stage, snapshot.targets, snapshot.journey); writeLearningEvidence(stage, snapshot.evidence, snapshot.journey, snapshot.targets); writeLearningState(stage, snapshot.state, snapshot.journey); writeLearningGoals(stage, snapshot.goals, snapshot.journey);
    const staged = inspectLearningWorkspace(stage); if (staged.status !== "current") throw new Error(`staged transition is invalid: ${staged.warnings.join("; ")}`);
    mkdirSync(targetDir, { recursive: true });
    for (const name of files) { const target = path.join(targetDir, name); backups.set(name, existsSync(target) ? readFileSync(target) : null); }
    try { for (const name of files) renameSync(path.join(stage, ".learning", name), path.join(targetDir, name)); }
    catch (error) { for (const [name, content] of backups) { const target = path.join(targetDir, name); if (content === null) rmSync(target, { force: true }); else writeFileSync(target, content); } throw error; }
  } finally { rmSync(stage, { recursive: true, force: true }); }
}

export function executeLearningTransition(workspace, intent) {
  if (!intent || typeof intent !== "object") throw new Error("transition intent is required");
  let snapshot = load(workspace, intent.type);
  if (intent.type === "start") {
    const hasQuestion = typeof intent.question === "string" && intent.question.trim().length > 0;
    const hasGoalId = typeof intent.goalId === "string" && intent.goalId.trim().length > 0;
    const hasRootIntentId = typeof intent.rootIntentId === "string" && intent.rootIntentId.trim().length > 0;
    if ((hasGoalId || hasRootIntentId) && hasQuestion) throw new Error("start accepts either question or goalId/rootIntentId, not both");
    if (hasGoalId !== hasRootIntentId) throw new Error("goal-backed start requires both goalId and rootIntentId");
    if (!hasGoalId && !hasQuestion) throw new Error("direct start requires a question");

    let question = intent.question, selectedRoot = null;
    if (hasGoalId) {
      const goal = snapshot.goals.goals.find((candidate) => candidate.id === intent.goalId);
      if (!goal) throw new Error(`goal not found: ${intent.goalId}`); if (goal.closedAt) throw new Error(`goal is closed: ${intent.goalId}`);
      selectedRoot = goal.rootIntents.find((candidate) => candidate.id === intent.rootIntentId);
      if (!selectedRoot) throw new Error(`root intent not found in goal: ${intent.rootIntentId}`);
      if (selectedRoot.episodeId) {
        const episode = snapshot.journey.episodes.find((candidate) => candidate.id === selectedRoot.episodeId);
        if (episode?.status === "active" && snapshot.state.activeEpisodeId === episode.id) return inspectLearningWorkspace(workspace);
        throw new Error(`root intent already started: ${selectedRoot.id}`);
      }
      question = selectedRoot.question;
    }
    if (snapshot.state.mode !== "idle") throw new Error("cannot start while an Episode is active");
    const episodeId = nextEpisodeId(snapshot.journey), questionId = nextJourneyQuestionId(snapshot.journey);
    snapshot.journey = startEpisode(snapshot.journey, { id: episodeId, rootQuestionId: questionId, question, startedAt: intent.createdAt });
    snapshot.state = { version: 2, mode: "active", activeEpisodeId: episodeId, focusStack: [questionId] };
    if (selectedRoot) snapshot.goals = linkRootIntent(snapshot.goals, intent.goalId, selectedRoot.id, episodeId);
  } else if (intent.type === "push") {
    const result = pushAcceptedBlockingQuestion(snapshot.journey, snapshot.state, { id: nextJourneyQuestionId(snapshot.journey), episodeId: snapshot.state.activeEpisodeId, parentId: snapshot.state.focusStack.at(-1), question: intent.question, whyNeeded: intent.whyNeeded, resumeCheckpoint: intent.resumeCheckpoint, openedAt: intent.createdAt, noteRefs: intent.noteRefs || [] }, { accepted: intent.accepted, relationship: intent.relationship });
    snapshot = { ...snapshot, ...result };
  } else if (intent.type === "verify") {
    if (snapshot.state.mode !== "active") throw new Error("verification requires an active Episode");
    const questionId = snapshot.state.focusStack.at(-1), episode = snapshot.journey.episodes.find((candidate) => candidate.id === snapshot.state.activeEpisodeId);
    const verification = { id: nextId(snapshot.evidence.verifications, "v"), episodeId: snapshot.state.activeEpisodeId, questionId, kind: episode.rootQuestionId === questionId ? "root_teach_back" : "child_connection", result: intent.result, independence: intent.independence, demonstrated: intent.demonstrated || [], gaps: intent.gaps || [], createdAt: intent.createdAt };
    if (intent.result === "pass") {
      const isRoot = episode.rootQuestionId === questionId;
      if (isRoot && !intent.target) throw new Error("root closure requires KnowledgeTarget metadata");
      snapshot = { ...snapshot, ...closeVerifiedQuestion(snapshot.journey, snapshot.evidence, snapshot.state, verification) };
      if (isRoot) {
        const target = { id: nextKnowledgeTargetId(snapshot.targets), title: intent.target.title, kind: intent.target.kind, origin: { episodeId: episode.id, questionIds: [questionId] }, noteRefs: intent.target.noteRefs || [], sourceRefs: intent.target.sourceRefs || [], createdAt: intent.createdAt };
        const created = createKnowledgeTarget(snapshot.targets, target, snapshot.journey, snapshot.evidence); snapshot.targets = created.model;
        snapshot.evidence = { ...snapshot.evidence, verifications: snapshot.evidence.verifications.map((item) => item.id === verification.id ? { ...item, targetId: created.target.id } : item) };
      }
    } else snapshot.evidence = recordVerification(snapshot.evidence, verification);
  } else if (intent.type === "promote_target") {
    const question = snapshot.journey.questions.find((candidate) => candidate.id === intent.questionId);
    if (!question || question.status !== "closed") throw new Error("target promotion requires a closed question");
    const target = { id: nextKnowledgeTargetId(snapshot.targets), title: intent.title, kind: intent.kind, origin: { episodeId: question.episodeId, questionIds: [question.id] }, noteRefs: intent.noteRefs || [], sourceRefs: intent.sourceRefs || [], createdAt: intent.createdAt || null };
    snapshot.targets = createKnowledgeTarget(snapshot.targets, target, snapshot.journey, snapshot.evidence).model;
  } else if (intent.type === "update_target") snapshot.targets = updateKnowledgeTarget(snapshot.targets, intent.targetId, intent, snapshot.journey);
  else throw new Error(`unknown transition type: ${intent.type}`);
  persistAtomically(workspace, snapshot); return inspectLearningWorkspace(workspace);
}
