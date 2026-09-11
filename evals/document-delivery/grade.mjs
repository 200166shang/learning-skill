#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const evalRoot = realpathSync(here);
const digest = (text) => createHash("sha256").update(text).digest("hex");
const check = (id, pass, detail) => ({ id, pass: Boolean(pass), detail });

function safeRead(root, candidate, label, errors) {
  try {
    const realRoot = realpathSync(root);
    const lexical = path.resolve(realRoot, candidate);
    if (lexical !== realRoot && !lexical.startsWith(realRoot + path.sep)) throw new Error("path escapes root");
    const real = realpathSync(lexical);
    if (real !== realRoot && !real.startsWith(realRoot + path.sep)) throw new Error("symlink escapes root");
    if (!statSync(real).isFile()) throw new Error("not a regular file");
    return { path: real, text: readFileSync(real, "utf8") };
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

const material = {
  range: [/-90\s*°?[\s\S]{0,80}\+?90\s*°?/i, "-90° through +90°"],
  step: [/30\s*°?[\s\S]{0,40}(step|increment|间隔)/i, "30° steps"],
  seven: [/(seven|7)\s+(positions|samples|rays|格|个)/i, "seven samples"],
  index: [/\+?30\s*°?[\s\S]{0,100}(index|下标|编号)\s*(is|=|为|gives)?\s*4/i, "+30° is index 4"],
  radians: [/radian|弧度/i, "message/code angles use radians"],
  secNsec: [/\bsec\b[\s\S]{0,120}\bnsec\b/i, "sec/nsec split"],
  firstRay: [/((first|首)[\s-]*(ray|beam|束)[\s\S]{0,80}(acquisition|measurement|time|测量|采集)|(acquisition|measurement|采集|测量)[\s\S]{0,80}(first|首)[\s-]*(ray|beam|束))/i, "first-ray acquisition time"],
  motion: [/(moving|moves|motion|移动|运动)[\s\S]{0,180}(later|pose|distort|bend|shift|后续|位姿|畸变)/i, "motion consequence"],
  latency: [/(not|isn.t|must not|不能|并非)[\s\S]{0,100}(pure\s+)?network latency|network latency[\s\S]{0,100}(not|isn.t|不能|并非)/i, "not pure network latency"],
  frame: [/frame_id[\s\S]{0,100}(identif|names|标识|命名)/i, "frame_id identifies a frame"],
  tf: [/\bTF\b[\s\S]{0,100}(transform|relationship|变换|关系)/, "TF supplies transforms"]
};
const expectedAtTurn = {
  teach: ["radians"],
  "continue-array": ["range", "step", "seven", "index", "radians"],
  "dont-know": ["range", "step", "seven", "index", "radians"],
  "continue-time": ["secNsec", "firstRay", "motion", "latency", "frame", "tf"],
  insufficient: Object.keys(material)
};

export function gradeRecord(recordFile) {
  const errors = [];
  const deterministic = [];
  let record;
  try { record = JSON.parse(readFileSync(path.resolve(recordFile), "utf8")); }
  catch (error) { return invalid(recordFile, [`record: ${error.message}`]); }

  for (const field of ["kind", "transcript", "notesRoot", "captureRoot", "documentRef", "currentQuestion"]) {
    if (!record[field] || typeof record[field] !== "string") errors.push(`record.${field}: required string`);
  }
  for (const field of ["expectedTeachingTurns", "readOnlyTurns", "resumeTurns"]) {
    if (!Array.isArray(record[field]) || !record[field].every((id) => typeof id === "string" && id.length > 0) || new Set(record[field]).size !== record[field].length) errors.push(`record.${field}: required array of unique non-empty turn IDs`);
  }
  if (errors.length) return invalid(recordFile, errors);

  const recordBase = path.dirname(path.resolve(recordFile));
  const transcriptFile = safeRead(evalRoot, path.relative(evalRoot, path.resolve(recordBase, record.transcript)), "transcript", errors);
  let transcript;
  try { transcript = transcriptFile ? JSON.parse(transcriptFile.text) : null; }
  catch (error) { errors.push(`transcript: ${error.message}`); }
  if (!transcript || !Array.isArray(transcript.turns)) errors.push("transcript.turns: required array");
  else if (!transcript.turns.every((turn) => turn && typeof turn === "object" && typeof turn.id === "string" && turn.id.length > 0) || new Set(transcript.turns.map((turn) => turn.id)).size !== transcript.turns.length) errors.push("transcript.turns: requires objects with unique non-empty IDs");
  if (errors.length) return invalid(recordFile, errors);

  const captureRoot = path.resolve(recordBase, record.captureRoot);
  const notesRoot = path.resolve(recordBase, record.notesRoot);
  const noteRelativeToCapture = path.relative(captureRoot, path.resolve(notesRoot, record.documentRef));
  const note = safeRead(captureRoot, noteRelativeToCapture, "final note", errors);
  const turns = new Map((transcript?.turns || []).map((turn) => [turn.id, turn]));

  deterministic.push(check("record-kind-honest", ["agent-replay", "scripted-grader-fixture", "synthetic-known-regression"].includes(record.kind), `kind=${record.kind}`));
  deterministic.push(check("document-exists-in-capture", Boolean(note), record.documentRef));

  if (record.canonicalSnapshot) {
    const canonicalFile = safeRead(captureRoot, record.canonicalSnapshot, "canonical snapshot", errors);
    let canonical;
    try { canonical = canonicalFile ? JSON.parse(canonicalFile.text) : null; } catch (error) { errors.push(`canonical snapshot: ${error.message}`); }
    deterministic.push(check("canonical-current-question", canonical?.currentQuestion === record.currentQuestion, "captured canonical state selects expected question"));
    deterministic.push(check("canonical-document-association", canonical?.documentRefs?.includes(record.documentRef), "current question associates canonical document"));
  } else deterministic.push(check("canonical-document-association", false, "canonicalSnapshot is required"));

  for (const id of record.expectedTeachingTurns) {
    const turn = turns.get(id);
    const snapshot = turn?.snapshot ? safeRead(captureRoot, turn.snapshot, `turn ${id} snapshot`, errors) : null;
    const actualHash = snapshot ? digest(snapshot.text) : null;
    const revision = turn?.documentCommit?.revision;
    deterministic.push(check(`turn:${id}:snapshot-hash`, Boolean(actualHash) && actualHash === revision, `captured bytes hash=${actualHash}`));
    deterministic.push(check(`turn:${id}:receipt-matches`, turn?.documentCommit?.ref === record.documentRef && turn?.receipt?.ref === record.documentRef && turn?.receipt?.revision === actualHash, "commit and receipt match captured bytes"));
    for (const key of expectedAtTurn[id] || []) {
      const [pattern, detail] = material[key];
      deterministic.push(check(`turn:${id}:material:${key}`, Boolean(snapshot) && pattern.test(snapshot.text), detail));
    }
  }
  const dontKnow = turns.get("dont-know");
  if (dontKnow) deterministic.push(check("dont-know:no-immediate-quiz", dontKnow.immediateQuiz === false, "transcript observation; human should verify cadence"));

  for (const id of record.readOnlyTurns) {
    const turn = turns.get(id);
    const before = turn?.beforeSnapshot ? safeRead(captureRoot, turn.beforeSnapshot, `${id} before snapshot`, errors) : null;
    const after = turn?.afterSnapshot ? safeRead(captureRoot, turn.afterSnapshot, `${id} after snapshot`, errors) : null;
    const beforeHash = before ? digest(before.text) : null;
    const afterHash = after ? digest(after.text) : null;
    deterministic.push(check(`turn:${id}:snapshot-hashes`, beforeHash === turn?.beforeHash && afterHash === turn?.afterHash, "declared hashes match captured bytes"));
    deterministic.push(check(`turn:${id}:unchanged`, Boolean(beforeHash) && beforeHash === afterHash, "before/after captured document bytes are identical"));
    deterministic.push(check(`turn:${id}:reports-document`, turn?.reportedRef === record.documentRef, "status reports canonical document"));
  }

  if (note) for (const [key, [pattern, detail]] of Object.entries(material)) deterministic.push(check(`final-material:${key}`, pattern.test(note.text), detail));
  const failures = deterministic.filter((item) => !item.pass);
  return {
    schemaVersion: 2, record: path.relative(here, path.resolve(recordFile)), recordKind: record.kind,
    verdict: failures.length || errors.length ? "FAIL" : "PASS", validationErrors: errors,
    deterministic: { passed: deterministic.length - failures.length, total: deterministic.length, checks: deterministic },
    externalAttestation: { status: "REQUIRES_REPLAY_OPERATOR", items: record.resumeTurns.map((id) => `Attest that ${id} ran in a genuinely new agent session with no prior chat`) },
    humanSemanticReview: { status: "NOT_SCORED_BY_CLI", prompts: ["Can a reader reconstruct the angle-to-index reasoning without chat?", "Does the motion explanation connect acquisition time, pose, and distortion correctly?", "Did remediation resolve confusion rather than repeat or compress it?", "Does the note preserve source assumptions and boundaries?", "Verify observed no-immediate-quiz cadence and new-session isolation from raw run logs."] }
  };
}

function invalid(recordFile, errors) {
  return { schemaVersion: 2, record: String(recordFile), verdict: "FAIL", validationErrors: errors, deterministic: { passed: 0, total: 0, checks: [] }, externalAttestation: { status: "REQUIRES_REPLAY_OPERATOR", items: [] }, humanSemanticReview: { status: "NOT_SCORED_BY_CLI", prompts: [] } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg || arg === "--help") { console.log("Usage: node evals/document-delivery/grade.mjs <record.json>"); process.exit(arg ? 0 : 2); }
  const result = gradeRecord(arg); console.log(JSON.stringify(result, null, 2)); process.exit(result.verdict === "PASS" ? 0 : 1);
}
