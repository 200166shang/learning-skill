import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const main = readFileSync(path.join(root, "learning-learn", "SKILL.md"), "utf8");
const orient = readFileSync(path.join(root, "learning-learn", "references", "orient.md"), "utf8");
const runtime = readFileSync(path.join(root, "learning-learn", "references", "runtime.md"), "utf8");
const documentsPath = path.join(root, "learning-learn", "references", "documents.md");
const documents = existsSync(documentsPath) ? readFileSync(documentsPath, "utf8") : "";

test("Learning: Learn keeps the invariant and completion gates in the primary skill", () => {
  assert.match(main, /no broken arrow/i);
  assert.match(main, /RESOLVE[\s\S]*ANSWER \/ TEACH[\s\S]*DOCUMENT RECONCILE[\s\S]*PUSH[\s\S]*VERIFY[\s\S]*POP \/ RESUME[\s\S]*IDLE/);
  assert.match(main, /PUSH[^\n]*only after the learner asks or accepts/i);
  assert.match(main, /exact `resume_checkpoint`/i);
  assert.match(main, /Every closed question requires persisted passing Evidence/i);
  assert.match(main, /child[\s\S]*passing Evidence[\s\S]*saved checkpoint/i);
  assert.match(main, /root pass[\s\S]*exactly one root KnowledgeTarget[\s\S]*State[^\n]*IDLE/i);
});

test("normal conversation reconciles durable documents before closure", () => {
  assert.match(main, /ANSWER|TEACH/);
  assert.match(main, /DOCUMENT RECONCILE/);
  assert.match(main, /Verification is a closure gate, not the default conversational cadence/i);
  assert.match(main, /FINAL DOCUMENT RECONCILE[\s\S]*root pass/i);
});

test("topic orientation is disclosed only behind its branch pointer", () => {
  assert.match(main, /Topic-first orientation:[^\n]*read \[orientation\]/i);
  assert.doesNotMatch(main, /Survey cheap structure first|learning-goal\.mjs|add_roots/);
  assert.match(orient, /Survey cheap structure first/);
  assert.match(orient, /normally 1–3 candidate Root Questions/);
  assert.match(orient, /Persist only questions the learner explicitly accepts/);
  assert.match(orient, /selection boundary/);
  const choice = orient.indexOf("Stop for an explicit learner choice");
  const create = orient.indexOf("After acceptance, create or reuse");
  assert.ok(choice >= 0 && create > choice, "orientation must not create state before the learner chooses");
  assert.match(orient, /Before that choice, do not run `learning-goal\.mjs`[\s\S]*state-writing command/);
});

test("runtime implementation mechanics have one disclosed home", () => {
  assert.match(main, /Read \[runtime mechanics\][^\n]*before the first persisted read or write/i);
  assert.doesNotMatch(main, /upgrade-learning-workspace\.mjs|learning-transition\.mjs|learning-view\.mjs/);
  assert.match(runtime, /deterministic runtime owns[^\n]*(persisted )?writes/i);
  assert.match(runtime, /schema recovery[^\n]*before persisted access|before persisted access[^\n]*schema recovery/i);
  assert.match(runtime, /atomic/i);
  assert.match(runtime, /never hand-edit/i);
  assert.match(runtime, /read-only projection[^\n]*not routing authority/i);
  assert.match(runtime, /focus stack/i);
  assert.doesNotMatch(runtime, /\.learning\/(journey|evidence|state|targets|goals)\.yaml/);
});

test("main skill points precisely to conditional references", () => {
  for (const pointer of ["document lifecycle", "verification", "persistence", "teaching tactics", "overview", "curate"]) {
    assert.match(main, new RegExp(`read \\[${pointer}\\]`, "i"));
  }
});

test("one document lifecycle owns continuous reconciliation and optional write-first initialization", () => {
  assert.equal(existsSync(path.join(root, "learning-learn", "references", "document-first.md")), false);
  assert.match(documents, /Default flow/i);
  assert.match(documents, /Explicit write-first flow/i);
  assert.match(documents, /Topic\/Module document/i);
  assert.match(documents, /Concept document/i);
  assert.match(documents, /many-to-many/i);
  assert.match(documents, /substantive learning/i);
  assert.doesNotMatch(main, /document-first/i);
});
