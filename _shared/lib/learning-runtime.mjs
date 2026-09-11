import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { emptyLearningEvidence, writeLearningEvidence } from "./learning-evidence.mjs";
import { nextEpisodeId, nextJourneyQuestionId, startEpisode, writeLearningJourney } from "./learning-journey.mjs";
import { closeVerifiedQuestion, pushAcceptedBlockingQuestion, recordVerification } from "./learning-loop.mjs";
import { idleLearningState, writeLearningState } from "./learning-state.mjs";
import { inspectLearningWorkspace, validateCanonicalSnapshot, writeWorkspaceManifest } from "./learning-workspace.mjs";

const files = ["workspace.yaml", "journey.yaml", "evidence.yaml", "state.yaml"];
const nextId = (items, prefix) => { const used = new Set(items.map((item) => item.id)); let number = Math.max(0, ...[...used].filter((id) => new RegExp(`^${prefix}\\d+$`).test(id)).map((id) => Number(id.slice(1)))); do number += 1; while (used.has(`${prefix}${String(number).padStart(3, "0")}`)); return `${prefix}${String(number).padStart(3, "0")}`; };

function load(workspace, type) {
  const inspection = inspectLearningWorkspace(workspace);
  if (inspection.status === "empty" && type === "start") return { journey: { version: 2, episodes: [], questions: [] }, evidence: emptyLearningEvidence(), state: idleLearningState() };
  if (inspection.status !== "current") throw new Error(`workspace is invalid for transition: ${inspection.status}`);
  return { journey: structuredClone(inspection.journey.journey), evidence: structuredClone(inspection.evidence.evidence), state: structuredClone(inspection.state.state) };
}

function persistAtomically(workspace, snapshot) {
  const warnings = validateCanonicalSnapshot(snapshot); if (warnings.length) throw new Error(`transition produced invalid workspace: ${warnings.join("; ")}`);
  const root = path.resolve(workspace), stage = mkdtempSync(path.join(tmpdir(), "learning-transition-")), targetDir = path.join(root, ".learning"), backups = new Map();
  try {
    writeWorkspaceManifest(stage); writeLearningJourney(stage, snapshot.journey); writeLearningEvidence(stage, snapshot.evidence, snapshot.journey); writeLearningState(stage, snapshot.state, snapshot.journey);
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
    if (snapshot.state.mode !== "idle") throw new Error("cannot start while an Episode is active");
    const episodeId = nextEpisodeId(snapshot.journey), questionId = nextJourneyQuestionId(snapshot.journey);
    snapshot.journey = startEpisode(snapshot.journey, { id: episodeId, rootQuestionId: questionId, question: intent.question, startedAt: intent.createdAt });
    snapshot.state = { version: 2, mode: "active", activeEpisodeId: episodeId, focusStack: [questionId] };
  } else if (intent.type === "push") {
    const result = pushAcceptedBlockingQuestion(snapshot.journey, snapshot.state, { id: nextJourneyQuestionId(snapshot.journey), episodeId: snapshot.state.activeEpisodeId, parentId: snapshot.state.focusStack.at(-1), question: intent.question, whyNeeded: intent.whyNeeded, resumeCheckpoint: intent.resumeCheckpoint, openedAt: intent.createdAt, noteRefs: intent.noteRefs || [] }, { accepted: intent.accepted, relationship: intent.relationship });
    snapshot = { ...snapshot, ...result };
  } else if (intent.type === "verify") {
    if (snapshot.state.mode !== "active") throw new Error("verification requires an active Episode");
    const questionId = snapshot.state.focusStack.at(-1), episode = snapshot.journey.episodes.find((candidate) => candidate.id === snapshot.state.activeEpisodeId);
    const verification = { id: nextId(snapshot.evidence.verifications, "v"), episodeId: snapshot.state.activeEpisodeId, questionId, kind: episode.rootQuestionId === questionId ? "root_teach_back" : "child_connection", result: intent.result, independence: intent.independence, demonstrated: intent.demonstrated || [], gaps: intent.gaps || [], createdAt: intent.createdAt };
    if (intent.result === "pass") snapshot = closeVerifiedQuestion(snapshot.journey, snapshot.evidence, snapshot.state, verification); else snapshot.evidence = recordVerification(snapshot.evidence, verification);
  } else throw new Error(`unknown transition type: ${intent.type}`);
  persistAtomically(workspace, snapshot); return inspectLearningWorkspace(workspace);
}
