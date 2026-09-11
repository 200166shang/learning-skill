import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("Learning: Learn owns the execution spine while branch mechanics stay disclosed", () => {
  const skill = readFileSync(path.join(root, "learning-learn", "SKILL.md"), "utf8");
  assert.match(skill, /no broken arrow/i);
  assert.match(skill, /PUSH[\s\S]*LEARN[\s\S]*VERIFY[\s\S]*POP[\s\S]*RESUME[\s\S]*IDLE/);
  assert.match(skill, /exactly one root KnowledgeTarget/i);
  assert.match(skill, /closed child remains Journey-only by default/i);
  assert.match(skill, /runtime concepts, not learner commands/i);
  assert.match(skill, /current question[\s\S]*why it matters[\s\S]*what happens next/i);
  assert.match(skill, /references\/orient\.md/);
  assert.match(skill, /references\/runtime\.md/);
  assert.equal(existsSync(path.join(root, "learning-learn", "references", "route.md")), false);
  assert.equal(existsSync(path.join(root, "learning-learn", "references", "review.md")), false);
});

test("Learning: Ask is a read-only router over public learner intents", () => {
  const skill = readFileSync(path.join(root, "learning-ask", "SKILL.md"), "utf8");
  assert.match(skill, /read-only router/i);
  assert.match(skill, /one primary next action/i);
  assert.match(skill, /\$learning-learn/);
  assert.match(skill, /\$learning-review/);
  assert.match(skill, /\$learning-practice/);
  assert.match(skill, /\$learning-view/);
  assert.match(skill, /Never create, update, close, promote, schedule/i);
  assert.match(skill, /Do not run workspace upgrade\/migration/i);
  assert.match(skill, /Do not invoke another public skill automatically/i);
  assert.match(skill, /Fresh broad-topic orientation/);
  assert.match(skill, /normally 1–3 candidate root questions/i);
  assert.match(skill, /do not create a Goal, Root Intent, Episode, or Question/i);
  assert.match(skill, /route that exact accepted wording[\s\S]*\$learning-learn/i);
  assert.doesNotMatch(skill, /learning-transition\.mjs|learning-goal\.mjs|review\.mjs|practice\.mjs/);
  assert.doesNotMatch(skill, /node\s+[^\n]*(upgrade-learning-workspace|learning-transition|learning-goal|review|practice)\.mjs/);
});

test("Learning: Review is an independent retrieval-first skill", () => {
  const skill = readFileSync(path.join(root, "learning-review", "SKILL.md"), "utf8");
  assert.match(skill, /retrieval-first/i);
  assert.match(skill, /recall[^\n]*explain[^\n]*transfer/i);
  assert.match(skill, /cannot write Journey, State/i);
  assert.match(skill, /never reopens historical learning/i);
  assert.match(skill, /flashcard is one ReviewItem representation/i);
  assert.match(skill, /never generate cards automatically/i);
  assert.match(skill, /fail → Again/);
  assert.match(skill, /decides when an existing item reappears, never what the learner should learn next/i);
});

test("Learning: Practice is independent and stores only observable application results", () => {
  const skill = readFileSync(path.join(root, "learning-practice", "SKILL.md"), "utf8");
  assert.match(skill, /coding[^\n]*debugging[^\n]*design/i);
  assert.match(skill, /pass \| partial \| fail/);
  assert.match(skill, /merely reading\/listing a task must never execute/i);
  assert.match(skill, /cannot write Learning State/i);
  assert.match(skill, /Review schedule/i);
});

test("Learning: View owns native-window routing but not learning state", () => {
  const skill = readFileSync(path.join(root, "learning-view", "SKILL.md"), "utf8");
  assert.match(skill, /native Desktop Learning Companion/i);
  assert.match(skill, /native companion window/i);
  assert.match(skill, /already-running Learning Companion/i);
  assert.match(skill, /open-viewer\.mjs/);
  assert.doesNotMatch(skill, /npm ci|_learning-viewer|tauri/i);
  assert.match(skill, /must not mutate `\.learning` domain state/i);
});
