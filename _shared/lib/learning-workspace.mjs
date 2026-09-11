import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { emptyLearningEvidence, readLearningEvidence, validateLearningEvidence, writeLearningEvidence } from "./learning-evidence.mjs";
import { readLearningJourney, writeLearningJourney } from "./learning-journey.mjs";
import { readLearningRecords } from "./learning-record.mjs";
import { readLearningState, validateLearningState, writeLearningState } from "./learning-state.mjs";
import { buildLegacyV2Workspace } from "../migrations/legacy-to-v2.mjs";
import { migrateV1ToV2 } from "../migrations/v1-to-v2.mjs";

export const CURRENT_SCHEMA_VERSION = 2;
const manifest = (root) => path.join(path.resolve(root), ".learning", "workspace.yaml");
const hasLegacy = (root) => existsSync(path.join(root, ".learning", "state.yaml")) || (existsSync(path.join(root, "notes")) && readdirSync(path.join(root, "notes"), { recursive: true }).some((entry) => String(entry).endsWith(".md")));

export function validateCanonicalSnapshot({ journey, evidence, state }) {
  const warnings = [...validateLearningState(state, journey), ...validateLearningEvidence(evidence, journey)];
  for (const question of journey.questions.filter((candidate) => candidate.status === "closed")) {
    const episode = journey.episodes.find((candidate) => candidate.id === question.episodeId);
    const kind = episode?.rootQuestionId === question.id ? "root_teach_back" : "child_connection";
    if (!evidence.verifications.some((item) => item.questionId === question.id && item.kind === kind && item.result === "pass")) warnings.push(`closed question lacks passing evidence: ${question.id}`);
  }
  return [...new Set(warnings)];
}

function canonical(root) {
  const journey = readLearningJourney(root), evidence = readLearningEvidence(root), state = readLearningState(root), records = readLearningRecords(root);
  const warnings = [...journey.warnings, ...evidence.warnings, ...state.warnings, ...records.warnings];
  if (journey.exists && !evidence.exists) warnings.push("evidence.yaml is missing");
  if (journey.exists && !state.exists) warnings.push("state.yaml is missing");
  warnings.push(...validateCanonicalSnapshot({ journey: journey.journey, evidence: evidence.evidence, state: state.state }));
  return { valid: journey.exists && warnings.length === 0, journey, evidence, state, records, warnings: [...new Set(warnings)] };
}

export function inspectLearningWorkspace(workspace) {
  const root = path.resolve(workspace), target = manifest(root);
  if (!existsSync(target)) {
    if (existsSync(path.join(root, ".learning", "journey.yaml"))) return { status: "upgrade-required", workspace: root, schemaVersion: 1 };
    return { status: hasLegacy(root) ? "legacy" : "empty", workspace: root };
  }
  try {
    const data = YAML.parse(readFileSync(target, "utf8"));
    if (!data || !Number.isInteger(data.schema_version)) return { status: "invalid", workspace: root, reason: "workspace.yaml requires integer schema_version" };
    if (data.schema_version > CURRENT_SCHEMA_VERSION) return { status: "unsupported-newer", workspace: root, schemaVersion: data.schema_version };
    if (data.schema_version < CURRENT_SCHEMA_VERSION) return { status: "upgrade-required", workspace: root, schemaVersion: data.schema_version };
    const result = canonical(root);
    return result.valid ? { status: "current", workspace: root, schemaVersion: 2, ...result } : { status: "invalid", workspace: root, reason: "canonical workspace validation failed", ...result };
  } catch (error) {
    return { status: "invalid", workspace: root, reason: `malformed workspace.yaml: ${error.message}`, warnings: [] };
  }
}

export function writeWorkspaceManifest(root) {
  const target = manifest(root); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, YAML.stringify({ schema_version: 2 })); return target;
}

export function upgradeLearningWorkspace(workspace, inspection = inspectLearningWorkspace(workspace)) {
  const root = path.resolve(workspace);
  if (inspection.status === "empty" || inspection.status === "current") return { changed: false, source: inspection.status, targetSchemaVersion: inspection.schemaVersion || null, warnings: [] };
  if (["invalid", "unsupported-newer"].includes(inspection.status)) throw new Error(`${inspection.status}: ${inspection.reason || "unsupported schema"}`);
  let data;
  if (inspection.status === "upgrade-required") { if (inspection.schemaVersion !== 1) throw new Error(`no migration from schema ${inspection.schemaVersion}`); data = migrateV1ToV2(root); }
  else { data = buildLegacyV2Workspace(root); const evidence = emptyLearningEvidence(); writeLearningJourney(root, data.journey); writeLearningEvidence(root, evidence, data.journey); writeLearningState(root, data.state, data.journey); }
  writeWorkspaceManifest(root);
  const current = inspectLearningWorkspace(root);
  if (current.status !== "current") throw new Error(`migration validation failed: ${current.warnings?.join("; ") || current.reason}`);
  const active = data.state.focusStack.at(-1), question = data.journey.questions.find((candidate) => candidate.id === active), episode = data.journey.episodes.find((candidate) => candidate.id === data.state.activeEpisodeId), rootQuestion = data.journey.questions.find((candidate) => candidate.id === episode?.rootQuestionId);
  return { changed: true, source: inspection.status, targetSchemaVersion: 2, rootQuestion: rootQuestion?.question || null, currentQuestion: question?.question || null, warnings: data.warnings || [] };
}
