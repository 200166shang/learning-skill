import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("primary skill owns the execution spine and keeps real branches optional", () => {
  const skill = readFileSync(path.join(root, "learning", "SKILL.md"), "utf8");
  assert.match(skill, /no broken arrow/i);
  assert.match(skill, /PUSH[\s\S]*LEARN[\s\S]*VERIFY[\s\S]*POP[\s\S]*RESUME[\s\S]*IDLE/);
  assert.match(skill, /only when[^\n]*KnowledgeNote/i);
  assert.match(skill, /only when[^\n]*(close|verification)/i);
  assert.match(skill, /exactly one root KnowledgeTarget/i);
  assert.match(skill, /closed child remains Journey-only by default/i);
  assert.match(skill, /learning-view\.mjs/);
  assert.match(skill, /view is read-only and never routing authority/i);
  assert.equal(existsSync(path.join(root, "learning", "references", "route.md")), false);
});

test("review is an independent retrieval-first skill", () => {
  const skill = readFileSync(path.join(root, "review", "SKILL.md"), "utf8");
  assert.match(skill, /retrieval-first/i);
  assert.match(skill, /recall[^\n]*explain[^\n]*transfer/i);
  assert.match(skill, /cannot write Journey, State/i);
  assert.match(skill, /never reopens historical learning/i);
  assert.match(skill, /flashcard is one ReviewItem representation/i);
  assert.match(skill, /never generate cards automatically/i);
  assert.match(skill, /fail → Again/);
  assert.match(skill, /decides when an existing item reappears, never what the learner should learn next/i);
});

test("practice is independent and stores only observable application results", () => {
  const skill = readFileSync(path.join(root, "practice", "SKILL.md"), "utf8");
  assert.match(skill, /coding[^\n]*debugging[^\n]*design/i);
  assert.match(skill, /pass \| partial \| fail/);
  assert.match(skill, /merely reading\/listing a task must never execute/i);
  assert.match(skill, /cannot write Learning State/i);
  assert.match(skill, /Review schedule/i);
});
