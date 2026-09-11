import { createHash } from "node:crypto";
import {
  closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync,
  renameSync, rmdirSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { parseKnowledgeNote } from "./learning-record.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";
import { setJourneyQuestionNoteRefs, writeLearningJourney } from "./learning-journey.mjs";

const DOCUMENT_FILE = "document.yaml";
const TX_ROOT = ".document-transactions";
const LOCK = ".document.lock";
const LOCK_REAPER = ".document.lock-reaper";
const ABSENT = "absent";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const text = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
};

export const LEARNING_DOCUMENT_INPUT_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["questionId", "documentRef", "section", "expectedRevision", "markdown", "operationId"],
  properties: {
    questionId: { type: "string", minLength: 1 }, documentRef: { type: "string", pattern: "^notes/.+\\.md$" },
    section: { type: "string", minLength: 1 }, expectedRevision: { type: "string", minLength: 1 },
    markdown: { type: "string", minLength: 1 }, operationId: { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$" },
    mode: { enum: ["create", "append", "replace"] }, title: { type: "string", minLength: 1 }, committedAt: { type: "string" },
  },
};

function metadataPath(root) { return path.join(root, ".learning", DOCUMENT_FILE); }
function readMetadata(root) {
  const target = metadataPath(root);
  if (!existsSync(target)) return { version: 1, primaryDocument: null, lastCommit: null, operations: [] };
  const data = YAML.parse(readFileSync(target, "utf8")) || {};
  return {
    version: 1, primaryDocument: typeof data.primary_document === "string" ? data.primary_document : null,
    lastCommit: data.last_commit || null, operations: Array.isArray(data.operations) ? data.operations : [],
  };
}
function serializeMetadata(data) {
  return YAML.stringify({ version: 1, primary_document: data.primaryDocument, last_commit: data.lastCommit, operations: data.operations }, { lineWidth: 0 });
}

function normalizeRef(workspace, value, { mustExist = false } = {}) {
  const raw = text(value, "documentRef").replaceAll("\\", "/");
  const ref = path.posix.normalize(raw);
  if (ref !== raw || !ref.startsWith("notes/") || ref === "notes/" || !ref.endsWith(".md") || path.posix.isAbsolute(ref) || ref.includes("../")) {
    throw new Error(`documentRef must be a normalized workspace-relative notes/*.md path: ${value}`);
  }
  const root = path.resolve(workspace), notes = path.join(root, "notes"), target = path.resolve(root, ref);
  const realRoot = realpathSync(root), realNotes = existsSync(notes) ? realpathSync(notes) : null;
  if (realNotes && realNotes !== realRoot && !realNotes.startsWith(`${realRoot}${path.sep}`)) throw new Error("workspace notes directory escapes through a symlink");
  let cursor = existsSync(target) ? target : path.dirname(target);
  while (!existsSync(cursor) && cursor !== root) cursor = path.dirname(cursor);
  const realAncestor = realpathSync(cursor);
  if (realNotes && realAncestor !== realNotes && !realAncestor.startsWith(`${realNotes}${path.sep}`)) throw new Error(`documentRef escapes notes through a symlink: ${value}`);
  if (!realNotes && realAncestor !== realpathSync(root)) throw new Error(`documentRef escapes workspace through a symlink: ${value}`);
  if (existsSync(target)) {
    const actual = realpathSync(target);
    if (!realNotes || (actual !== realNotes && !actual.startsWith(`${realNotes}${path.sep}`))) throw new Error(`documentRef escapes notes through a symlink: ${value}`);
    if (!statSync(target).isFile()) throw new Error(`documentRef is not a file: ${ref}`);
  } else if (mustExist) throw new Error(`document does not exist: ${ref}`);
  return { ref, target };
}

function headings(markdown) {
  const result = []; let fenced = false;
  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (!fenced) { const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/); if (match) result.push({ line: index, level: match[1].length, title: match[2].trim() }); }
  }
  return result;
}
function sectionRange(markdown, section) {
  const lines = markdown.split(/\r?\n/), all = headings(markdown), matches = all.filter((item) => item.title === section);
  if (matches.length !== 1) {
    const candidates = all.map((item) => item.title).filter((value, index, array) => array.indexOf(value) === index);
    const error = new Error(matches.length ? `section heading is ambiguous: ${section}` : `section heading not found: ${section}`);
    error.candidates = candidates; throw error;
  }
  const start = matches[0], next = all.find((item) => item.line > start.line && item.level <= start.level);
  return { lines, start: start.line, end: next?.line ?? lines.length, level: start.level };
}
function savedSection(markdown, section) { const range = sectionRange(markdown, section); return range.lines.slice(range.start, range.end).join("\n").trimEnd(); }
function validateLinks(markdown, documentPath) {
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    let destination = match[1].trim().replace(/^<|>$/g, "").split(/\s+["']/)[0];
    if (!destination || destination.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
    destination = decodeURIComponent(destination.split("#")[0]).replace(/:\d+(?::\d+)?$/, "");
    const target = path.isAbsolute(destination) ? destination : path.resolve(path.dirname(documentPath), destination);
    if (path.resolve(target) === path.resolve(documentPath)) continue;
    if (!existsSync(target)) throw new Error(`local document link does not exist: ${destination}`);
    if (!statSync(target).isFile()) throw new Error(`local document link is not a file: ${destination}`);
  }
}
function compose(existing, draft) {
  const body = draft.markdown.trim();
  if (!body) throw new Error("markdown must contain non-whitespace content");
  if (/^#{1,6}\s+/m.test(body) && headings(body).some((item) => item.title === draft.section)) throw new Error("markdown must be section body only, without duplicating the section heading");
  if (!existing) return `---\ntitle: ${YAML.stringify(draft.title).trim()}\n---\n\n# ${draft.title}\n\n## ${draft.section}\n\n${body}\n`;
  if (draft.mode === "append") {
    const matches = headings(existing).filter((item) => item.title === draft.section);
    if (matches.length) { const error = new Error(`section heading already exists: ${draft.section}`); error.candidates = matches; throw error; }
    return `${existing.trimEnd()}\n\n## ${draft.section}\n\n${body}\n`;
  }
  const range = sectionRange(existing, draft.section), lines = range.lines;
  return [...lines.slice(0, range.start), `${"#".repeat(range.level)} ${draft.section}`, "", body, ...lines.slice(range.end)].join("\n").replace(/\n*$/, "\n");
}
function validateNote(markdown, ref) {
  const parsed = parseKnowledgeNote(markdown, ref);
  if (!parsed.note || parsed.warnings.length) throw new Error(`invalid KnowledgeNote: ${parsed.warnings.join("; ")}`);
}
function activeQuestion(inspection) {
  const id = inspection.status === "current" ? inspection.state.state.focusStack.at(-1) : null;
  return inspection.status === "current" ? inspection.journey.journey.questions.find((item) => item.id === id) || null : null;
}
function pendingTransactions(root) {
  const dir = path.join(root, ".learning", TX_ROOT); if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(path.join(dir, entry.name, "journal.yaml"))).map((entry) => entry.name).sort();
}

export function assertNoPendingDocumentTransaction(workspace) {
  const root = path.resolve(workspace), lockPath = path.join(root, ".learning", LOCK);
  if (existsSync(lockPath)) throw new Error("document workspace is locked by a commit or recovery");
  const pending = pendingTransactions(root);
  if (pending.length) throw new Error(`unfinished document transaction exists (${pending.join(", ")}); run learning-document.mjs recover before mutating the workspace`);
}

export function readLearningDocumentSummary(workspace) {
  const root = path.resolve(workspace), metadata = readMetadata(root), pendingRecovery = pendingTransactions(root);
  let primaryStatus = null;
  if (metadata.primaryDocument) {
    try {
      const normalized = normalizeRef(root, metadata.primaryDocument, { mustExist: true }), revision = hash(readFileSync(normalized.target));
      primaryStatus = { documentRef: normalized.ref, path: normalized.target, exists: true, revision, matchesLastCommit: metadata.lastCommit?.document_ref === normalized.ref ? metadata.lastCommit.revision === revision : null };
    } catch (error) { primaryStatus = { documentRef: metadata.primaryDocument, exists: false, error: error.message }; }
  }
  return { primaryDocument: metadata.primaryDocument, primaryStatus, lastCommit: metadata.lastCommit, pendingRecovery };
}

function sectionInfo(markdown, section, maxBytes) {
  const range = sectionRange(markdown, section), savedMarkdown = range.lines.slice(range.start, range.end).join("\n").trimEnd();
  const encoded = Buffer.from(savedMarkdown), truncated = encoded.length > maxBytes;
  return { headingLevel: range.level, savedMarkdown: truncated ? encoded.subarray(0, maxBytes).toString("utf8") : savedMarkdown, sectionHash: hash(savedMarkdown), truncated };
}

export function inspectLearningDocument(workspace, options = {}) {
  const root = path.resolve(workspace), inspection = inspectLearningWorkspace(root), metadata = inspection.status === "current" ? readMetadata(root) : { primaryDocument: null, lastCommit: null, operations: [] };
  const question = activeQuestion(inspection), requested = options.documentRef || null;
  const relevantPrimary = question?.noteRefs.includes(metadata.primaryDocument) ? metadata.primaryDocument : null;
  const candidates = [...new Set([relevantPrimary, ...(question?.noteRefs || [])].filter(Boolean))];
  const selectedRef = requested || relevantPrimary || (candidates.length === 1 ? candidates[0] : null);
  let document = null;
  if (selectedRef) {
    const normalized = normalizeRef(root, selectedRef, { mustExist: true }), markdown = readFileSync(normalized.target, "utf8"), revision = hash(markdown), maxBytes = Number.isInteger(options.maxBytes) && options.maxBytes > 0 ? options.maxBytes : 32768;
    document = { documentRef: normalized.ref, path: normalized.target, revision, bytes: Buffer.byteLength(markdown), content: null, truncated: false, section: null };
    if (options.section) document.section = { name: options.section, sectionLink: `${normalized.ref}#${encodeURIComponent(options.section)}`, ...sectionInfo(markdown, options.section, maxBytes) };
    else { const bytes = Buffer.from(markdown); document.content = bytes.length > maxBytes ? bytes.subarray(0, maxBytes).toString("utf8") : markdown; document.truncated = bytes.length > maxBytes; }
  }
  return {
    status: inspection.status, workspace: root, schemaVersion: inspection.schemaVersion || null,
    currentQuestion: question ? { id: question.id, question: question.question, noteRefs: question.noteRefs } : null,
    primaryDocument: metadata.primaryDocument, candidates, document, lastCommit: metadata.lastCommit,
    pendingRecovery: existsSync(path.join(root, ".learning")) ? pendingTransactions(root) : [],
  };
}

function lock(root) {
  const learningDir = path.join(root, ".learning"), createdLearningDir = !existsSync(learningDir); mkdirSync(learningDir, { recursive: true });
  const target = path.join(learningDir, LOCK), gate = path.join(learningDir, LOCK_REAPER), candidate = `${target}-${process.pid}-${Date.now()}`;
  try { mkdirSync(gate); } catch (error) { if (createdLearningDir) { try { rmdirSync(learningDir); } catch {} } if (error.code === "EEXIST") throw new Error("document lock recovery guard is held; if its owner crashed, remove .learning/.document.lock-reaper manually after verifying no writer is running"); throw error; }
  try {
    mkdirSync(candidate); durableWrite(path.join(candidate, "owner.yaml"), YAML.stringify({ pid: process.pid, created_at: new Date().toISOString() }));
    try { renameSync(candidate, target); }
    catch (error) {
      if (!["EEXIST", "ENOTEMPTY"].includes(error.code)) throw error;
      let owner = null; try { owner = YAML.parse(readFileSync(path.join(target, "owner.yaml"), "utf8")); } catch {}
      let alive = true; if (Number.isInteger(owner?.pid)) { try { process.kill(owner.pid, 0); } catch (killError) { if (killError.code === "ESRCH") alive = false; } }
      if (owner?.pid && alive) throw new Error(`document workspace is locked by pid ${owner.pid}`);
      rmSync(target, { recursive: true, force: true });
      renameSync(candidate, target);
    }
  } catch (error) { rmSync(candidate, { recursive: true, force: true }); throw error; }
  finally { rmSync(gate, { recursive: true, force: true }); }
  return () => { rmSync(target, { recursive: true, force: true }); if (createdLearningDir) { try { rmdirSync(learningDir); } catch {} } };
}
export function withLearningWorkspaceMutationLock(workspace, callback) {
  if (typeof callback !== "function") throw new Error("workspace mutation lock requires a callback");
  const root = path.resolve(workspace), release = lock(root);
  try { const pending = pendingTransactions(root); if (pending.length) throw new Error(`unfinished document transaction exists (${pending.join(", ")}); run learning-document.mjs recover before mutating the workspace`); return callback(); }
  finally { release(); }
}
function durableWrite(target, content) {
  mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, content);
  const fd = openSync(target, "r"); try { fsyncSync(fd); } finally { closeSync(fd); }
}
function atomicDurableWrite(target, content) {
  const temporary = `${target}.tmp-${process.pid}`; durableWrite(temporary, content); renameSync(temporary, target);
  const fd = openSync(path.dirname(target), "r"); try { fsyncSync(fd); } finally { closeSync(fd); }
}
function syncDirectoryChain(directory, root) {
  // Persist both entries and newly created ancestors before the journal relies on them.
  for (let current = path.resolve(directory); ; current = path.dirname(current)) {
    const fd = openSync(current, "r"); try { fsyncSync(fd); } finally { closeSync(fd); }
    if (current === path.resolve(root) || current === path.dirname(current)) break;
  }
}
function receiptFromOperation(operation, root, { idempotent = false } = {}) {
  const target = path.join(root, operation.document_ref), markdown = readFileSync(target, "utf8"), savedMarkdown = savedSection(markdown, operation.section);
  const revision = hash(markdown), sectionHash = hash(savedMarkdown);
  if (idempotent && (revision !== operation.revision || sectionHash !== operation.section_hash)) throw new Error(`operation result was superseded after commit: ${operation.operation_id}`);
  return { status: "committed", operationId: operation.operation_id, questionId: operation.question_id, documentRef: operation.document_ref, path: target, section: operation.section, sectionLink: `${operation.document_ref}#${encodeURIComponent(operation.section)}`, headingLevel: sectionRange(markdown, operation.section).level, revision, sectionHash, savedMarkdown, changed: !idempotent, idempotent };
}
function applyJournal(root, txDir, interruptAfter = null) {
  const journalPath = path.join(txDir, "journal.yaml"), journal = YAML.parse(readFileSync(journalPath, "utf8"));
  if (!journal || !Array.isArray(journal.files) || !Number.isInteger(journal.applied) || journal.applied < 0 || journal.applied > journal.files.length) throw new Error("invalid document transaction journal");
  for (const item of journal.files) {
    if (!item || typeof item.target !== "string" || path.isAbsolute(item.target) || item.target.includes("..") || typeof item.stage !== "string" || !item.stage.startsWith("stage/") || item.stage.includes("..")) throw new Error("invalid document transaction journal path");
    if (item.stage === "stage/note.md") normalizeRef(root, item.target);
    else if (item.stage === "stage/journey.yaml" && item.target === ".learning/journey.yaml") {}
    else if (item.stage === "stage/document.yaml" && item.target === `.learning/${DOCUMENT_FILE}`) {}
    else throw new Error("document transaction journal target is not allowed");
  }
  let applied = Number(journal.applied || 0);
  for (let index = 0; index < applied; index += 1) { const item = journal.files[index], target = path.join(root, item.target), actual = existsSync(target) ? hash(readFileSync(target)) : ABSENT; if (actual !== item.desired_revision) throw new Error(`transaction recovery conflict for already-applied ${item.target}`); }
  for (let index = applied; index < journal.files.length; index += 1) {
    const item = journal.files[index], target = path.join(root, item.target), staged = path.join(txDir, item.stage);
    const actual = existsSync(target) ? hash(readFileSync(target)) : ABSENT;
    if (!existsSync(staged)) {
      if (actual !== item.desired_revision) throw new Error(`transaction recovery conflict for ${item.target}: staged file is missing and target does not match committed revision`);
      applied = index + 1; atomicDurableWrite(journalPath, YAML.stringify({ ...journal, applied }, { lineWidth: 0 })); continue;
    }
    if (actual !== item.expected_revision) throw new Error(`transaction recovery conflict for ${item.target}: expected ${item.expected_revision}, actual ${actual}`);
    mkdirSync(path.dirname(target), { recursive: true }); renameSync(staged, target);
    syncDirectoryChain(path.dirname(target), root);
    applied = index + 1;
    atomicDurableWrite(journalPath, YAML.stringify({ ...journal, applied }, { lineWidth: 0 }));
    if (interruptAfter === applied) throw new Error(`simulated interruption after ${applied} transaction file(s)`);
  }
  rmSync(txDir, { recursive: true, force: true });
}

export function recoverLearningDocument(workspace) {
  const root = path.resolve(workspace), inspection = inspectLearningWorkspace(root);
  if (!["current", "invalid"].includes(inspection.status)) throw new Error(`workspace cannot recover document transactions: ${inspection.status}`);
  const release = lock(root); const recovered = [];
  try { for (const id of pendingTransactions(root)) { applyJournal(root, path.join(root, ".learning", TX_ROOT, id)); recovered.push(id); } }
  finally { release(); }
  const final = inspectLearningWorkspace(root); if (final.status !== "current") throw new Error(`recovery did not restore a current workspace: ${final.status}`);
  return { status: "recovered", recovered, workspace: root };
}

export function commitLearningDocument(workspace, input, options = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("document draft must be an object");
  const allowed = new Set(Object.keys(LEARNING_DOCUMENT_INPUT_SCHEMA.properties)); for (const key of Object.keys(input)) if (!allowed.has(key)) throw new Error(`unknown draft field: ${key}`);
  const root = path.resolve(workspace), inspection = inspectLearningWorkspace(root);
  if (inspection.status !== "current") throw new Error(`document commit requires a current workspace: ${inspection.status}`);
  if (pendingTransactions(root).length) throw new Error("unfinished document transaction exists; run recover before committing");
  const inspectedJourneyRevision = hash(readFileSync(inspection.journey.path));
  const draft = { ...input, questionId: text(input.questionId, "questionId"), section: text(input.section, "section"), expectedRevision: text(input.expectedRevision, "expectedRevision"), markdown: text(input.markdown, "markdown"), operationId: text(input.operationId, "operationId"), mode: input.mode || null };
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(draft.operationId)) throw new Error("operationId has invalid characters or length");
  if (/\r|\n/.test(draft.section)) throw new Error("section must be one line");
  if (draft.mode !== null && !["create", "append", "replace"].includes(draft.mode)) throw new Error(`invalid mode: ${draft.mode}`);
  if (input.committedAt !== undefined) { draft.committedAt = text(input.committedAt, "committedAt"); if (Number.isNaN(Date.parse(draft.committedAt))) throw new Error("committedAt must be an ISO-compatible timestamp"); }
  const question = inspection.journey.journey.questions.find((item) => item.id === draft.questionId); if (!question) throw new Error(`question not found: ${draft.questionId}`);
  const normalized = normalizeRef(root, input.documentRef), exists = existsSync(normalized.target), mode = draft.mode || (draft.expectedRevision === ABSENT ? "create" : "replace"); draft.mode = mode;
  if (input.title !== undefined) { draft.title = text(input.title, "title"); if (/\r|\n/.test(draft.title)) throw new Error("title must be one line"); }
  const existingMetadataPath = metadataPath(root), inspectedMetadataRevision = existsSync(existingMetadataPath) ? hash(readFileSync(existingMetadataPath)) : ABSENT;
  const metadata = readMetadata(root), prior = metadata.operations.find((item) => item.operation_id === draft.operationId);
  if (prior) {
    if (prior.input_hash !== hash(JSON.stringify({ ...draft, documentRef: normalized.ref }))) throw new Error(`operationId was already used for a different draft: ${draft.operationId}`);
    return receiptFromOperation(prior, root, { idempotent: true });
  }
  if (!exists && mode !== "create") throw new Error("a new document requires mode=create");
  if (exists && mode === "create") throw new Error("mode=create requires an absent document");
  if (!exists) draft.title = text(input.title, "title");
  const oldMarkdown = exists ? readFileSync(normalized.target, "utf8") : null, actualRevision = oldMarkdown === null ? ABSENT : hash(oldMarkdown);
  if (draft.expectedRevision !== actualRevision) { const error = new Error(`document revision conflict: expected ${draft.expectedRevision}, actual ${actualRevision}`); error.actualRevision = actualRevision; throw error; }
  const sectionLevel = oldMarkdown && mode === "replace" ? sectionRange(oldMarkdown, draft.section).level : 2;
  if (headings(draft.markdown).some((item) => item.level <= sectionLevel)) throw new Error(`markdown headings must be deeper than the selected level ${sectionLevel} section`);
  const nextMarkdown = compose(oldMarkdown, draft); validateNote(nextMarkdown, normalized.ref);
  validateLinks(nextMarkdown, normalized.target);
  const nextJourney = setJourneyQuestionNoteRefs(inspection.journey.journey, draft.questionId, [...question.noteRefs, normalized.ref]);
  const operation = { operation_id: draft.operationId, input_hash: hash(JSON.stringify({ ...draft, documentRef: normalized.ref })), question_id: draft.questionId, document_ref: normalized.ref, section: draft.section, revision: hash(nextMarkdown), section_hash: hash(savedSection(nextMarkdown, draft.section)), committed_at: input.committedAt || new Date().toISOString() };
  const nextMetadata = { version: 1, primaryDocument: question.noteRefs.includes(metadata.primaryDocument) ? metadata.primaryDocument : normalized.ref, lastCommit: operation, operations: [...metadata.operations, operation].slice(-100) };
  const release = lock(root); const safeId = hash(draft.operationId).slice(0, 24), txDir = path.join(root, ".learning", TX_ROOT, safeId);
  try {
    if (pendingTransactions(root).length) throw new Error("unfinished document transaction exists; run recover before committing");
    const lockedNoteRevision = existsSync(normalized.target) ? hash(readFileSync(normalized.target)) : ABSENT;
    if (lockedNoteRevision !== actualRevision) throw new Error(`document revision conflict after lock: expected ${actualRevision}, actual ${lockedNoteRevision}`);
    if (hash(readFileSync(path.join(root, ".learning", "journey.yaml"))) !== inspectedJourneyRevision) throw new Error("journey changed while preparing document commit");
    const lockedMetadataRevision = existsSync(existingMetadataPath) ? hash(readFileSync(existingMetadataPath)) : ABSENT;
    if (lockedMetadataRevision !== inspectedMetadataRevision) throw new Error("document metadata changed while preparing document commit");
    mkdirSync(path.join(txDir, "stage"), { recursive: true });
    const journeyTarget = path.join(root, ".learning", "journey.yaml"), documentTarget = metadataPath(root), metadataContent = serializeMetadata(nextMetadata);
    const files = [
      { target: normalized.ref, stage: "stage/note.md", content: nextMarkdown, expected_revision: actualRevision, desired_revision: hash(nextMarkdown) },
      { target: ".learning/journey.yaml", stage: "stage/journey.yaml", expected_revision: hash(readFileSync(journeyTarget)) },
      { target: `.learning/${DOCUMENT_FILE}`, stage: "stage/document.yaml", content: metadataContent, expected_revision: existsSync(documentTarget) ? hash(readFileSync(documentTarget)) : ABSENT, desired_revision: hash(metadataContent) },
    ];
    durableWrite(path.join(txDir, files[0].stage), files[0].content);
    writeLearningJourney(path.join(txDir, "journey-workspace"), nextJourney); renameSync(path.join(txDir, "journey-workspace", ".learning", "journey.yaml"), path.join(txDir, files[1].stage)); rmSync(path.join(txDir, "journey-workspace"), { recursive: true, force: true });
    const journeyFd = openSync(path.join(txDir, files[1].stage), "r"); try { fsyncSync(journeyFd); } finally { closeSync(journeyFd); }
    files[1].desired_revision = hash(readFileSync(path.join(txDir, files[1].stage)));
    durableWrite(path.join(txDir, files[2].stage), files[2].content);
    syncDirectoryChain(path.join(txDir, "stage"), root);
    atomicDurableWrite(path.join(txDir, "journal.yaml"), YAML.stringify({ version: 1, operation_id: draft.operationId, applied: 0, files: files.map(({ target, stage, expected_revision, desired_revision }) => ({ target, stage, expected_revision, desired_revision })) }, { lineWidth: 0 }));
    applyJournal(root, txDir, options.interruptAfter ?? null);
  } catch (error) { if (!existsSync(path.join(txDir, "journal.yaml"))) rmSync(txDir, { recursive: true, force: true }); throw error; }
  finally { release(); }
  const final = inspectLearningWorkspace(root); if (final.status !== "current") throw new Error(`document commit validation failed: ${final.status}`);
  return receiptFromOperation(operation, root);
}
