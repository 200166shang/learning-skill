import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { buildLegacyV1Workspace } from "../migrations/legacy-to-v1.mjs";
import { readLearningJourney, writeLearningJourney } from "./learning-journey.mjs";
import { readLearningRecords } from "./learning-record.mjs";
import { readLearningState } from "./learning-state.mjs";

export const CURRENT_SCHEMA_VERSION = 1;
const migrations = new Map();
const manifestPath = (workspace) => path.join(path.resolve(workspace), ".learning", "workspace.yaml");
const meaningfulLegacyArtifactsExist = (workspace) => {
  const root = path.resolve(workspace);
  const notes = path.join(root, "notes");
  return existsSync(path.join(root, ".learning", "state.yaml")) || (existsSync(notes) && readdirSync(notes, { recursive: true }).some((entry) => String(entry).toLowerCase().endsWith(".md")));
};

function validateCanonical(workspace) {
  const journey = readLearningJourney(workspace);
  const state = readLearningState(workspace);
  const records = readLearningRecords(workspace);
  const warnings = [...journey.warnings.filter((warning) => !warning.startsWith("non-standard journey question id")), ...state.warnings, ...records.warnings];
  return { valid: journey.exists && warnings.length === 0, journey, state, records, warnings };
}

function buildMigrationChain(fromVersion) {
  const chain = [];
  for (let version = fromVersion; version < CURRENT_SCHEMA_VERSION; version += 1) {
    const migration = migrations.get(version);
    if (!migration) return null;
    chain.push(migration);
  }
  return chain;
}

export function inspectLearningWorkspace(workspace) {
  const root = path.resolve(workspace);
  const target = manifestPath(root);
  if (!existsSync(target)) {
    if (existsSync(path.join(root, ".learning", "journey.yaml"))) {
      const canonical = validateCanonical(root);
      return canonical.valid ? { status: "canonical-unversioned", workspace: root, manifestPath: target, ...canonical } : { status: "invalid", workspace: root, manifestPath: target, reason: "canonical workspace validation failed", ...canonical };
    }
    return { status: meaningfulLegacyArtifactsExist(root) ? "legacy" : "empty", workspace: root, manifestPath: target };
  }

  let manifest;
  try { manifest = YAML.parse(readFileSync(target, "utf8"), { prettyErrors: true }); }
  catch (error) { return { status: "invalid", workspace: root, manifestPath: target, reason: `malformed workspace.yaml: ${error.message}`, warnings: [] }; }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) || Object.keys(manifest).length !== 1 || !Number.isInteger(manifest.schema_version)) return { status: "invalid", workspace: root, manifestPath: target, reason: "workspace.yaml must contain only an integer schema_version", warnings: [] };
  const schemaVersion = manifest.schema_version;
  if (schemaVersion > CURRENT_SCHEMA_VERSION) return { status: "unsupported-newer", workspace: root, manifestPath: target, schemaVersion };
  if (schemaVersion < CURRENT_SCHEMA_VERSION) {
    const chain = buildMigrationChain(schemaVersion);
    return chain ? { status: "upgrade-required", workspace: root, manifestPath: target, schemaVersion, chain } : { status: "invalid", workspace: root, manifestPath: target, schemaVersion, reason: `no complete migration chain from schema ${schemaVersion} to ${CURRENT_SCHEMA_VERSION}`, warnings: [] };
  }
  const canonical = validateCanonical(root);
  return canonical.valid ? { status: "current", workspace: root, manifestPath: target, schemaVersion, ...canonical } : { status: "invalid", workspace: root, manifestPath: target, schemaVersion, reason: "current workspace validation failed", ...canonical };
}

function writeManifest(workspace) {
  const target = manifestPath(workspace);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, YAML.stringify({ schema_version: CURRENT_SCHEMA_VERSION }, { lineWidth: 0 }));
  return target;
}

const reportFor = (source, journey, state, warnings = []) => {
  const rootQuestion = journey.questions.find((question) => question.id === journey.rootId) || null;
  const activeFrame = state.focusStack.at(-1) || null;
  return { changed: true, source, targetSchemaVersion: CURRENT_SCHEMA_VERSION, rootQuestion: rootQuestion?.question || state.rootQuestion.question || null, currentQuestion: activeFrame?.question || null, resumeCheckpoint: activeFrame?.resume?.checkpoint || null, resumeParentQuestion: activeFrame?.resume?.question || null, warnings };
};

export function upgradeLearningWorkspace(workspace, inspection = inspectLearningWorkspace(workspace)) {
  const root = path.resolve(workspace);
  if (inspection.status === "empty" || inspection.status === "current") return { changed: false, source: inspection.status, targetSchemaVersion: inspection.schemaVersion || null, warnings: [] };
  if (inspection.status === "unsupported-newer" || inspection.status === "invalid") throw new Error(`${inspection.status}: ${inspection.reason || `workspace schema ${inspection.schemaVersion} is newer than supported schema ${CURRENT_SCHEMA_VERSION}`}`);
  if (inspection.status === "canonical-unversioned") {
    writeManifest(root);
    return reportFor(inspection.status, inspection.journey.journey, inspection.state.state);
  }
  if (inspection.status === "legacy") {
    const proposed = buildLegacyV1Workspace(root);
    writeLearningJourney(root, proposed.journey);
    const canonical = validateCanonical(root);
    if (!canonical.valid) throw new Error(`migrated canonical workspace validation failed: ${canonical.warnings.join("; ")}`);
    writeManifest(root);
    return reportFor(inspection.status, proposed.journey, proposed.state, proposed.warnings);
  }
  if (inspection.status === "upgrade-required") {
    let context = { workspace: root };
    for (const migration of inspection.chain) context = migration(context);
    const canonical = validateCanonical(root);
    if (!canonical.valid) throw new Error(`upgraded canonical workspace validation failed: ${canonical.warnings.join("; ")}`);
    writeManifest(root);
    return reportFor(inspection.status, canonical.journey.journey, canonical.state.state, context.warnings || []);
  }
  throw new Error(`unsupported workspace status: ${inspection.status}`);
}
