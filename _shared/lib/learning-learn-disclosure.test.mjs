import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const main = readFileSync(path.join(root, "learning-learn", "SKILL.md"), "utf8");
const orient = readFileSync(path.join(root, "learning-learn", "references", "orient.md"), "utf8");
const runtime = readFileSync(path.join(root, "learning-learn", "references", "runtime.md"), "utf8");
const documentFirst = readFileSync(path.join(root, "learning-learn", "references", "document-first.md"), "utf8");

test("Learning: Learn keeps the invariant and completion gates in the primary skill", () => {
  assert.match(main, /no broken arrow/i);
  assert.match(main, /PUSH[\s\S]*LEARN[\s\S]*VERIFY[\s\S]*POP[\s\S]*RESUME[\s\S]*IDLE/);
  assert.match(main, /Descend only after the learner asks or accepts/i);
  assert.match(main, /exact `resume_checkpoint`/i);
  assert.match(main, /Every closed question requires persisted passing Evidence/i);
  assert.match(main, /child[\s\S]*passing Evidence[\s\S]*saved checkpoint/i);
  assert.match(main, /root[\s\S]*exactly one root KnowledgeTarget[\s\S]*State is IDLE/i);
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
  assert.match(runtime, /upgrade-learning-workspace\.mjs/);
  assert.match(runtime, /learning-transition\.mjs/);
  assert.match(runtime, /learning-view\.mjs/);
  assert.match(runtime, /view is read-only and never routing authority/i);
});

test("main skill points precisely to conditional references", () => {
  for (const pointer of ["document-first workflow", "verification", "persistence", "teaching tactics", "overview", "curate"]) {
    assert.match(main, new RegExp(`read \\[${pointer}\\]`, "i"));
  }
});

test("document-first learning produces a source-grounded artifact before questioning without claiming mastery", () => {
  assert.match(main, /Document-first request:[^\n]*read \[document-first workflow\]/i);
  assert.match(documentFirst, /complete, navigable knowledge document/i);
  assert.match(documentFirst, /module boundaries[\s\S]*end-to-end[\s\S]*key classes[\s\S]*data formats[\s\S]*concurrency[\s\S]*tradeoffs[\s\S]*interview/i);
  assert.match(documentFirst, /write or update the document before beginning teach-back questions/i);
  assert.match(documentFirst, /does not prove mastery/i);
  assert.match(documentFirst, /active question/i);
});
