import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(...segments) {
  return readFileSync(path.join(root, ...segments), "utf8");
}

function frontmatter(source) {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
}

test("Learning: Learn owns the execution spine while branch mechanics stay disclosed", () => {
  const skill = read("learning-learn", "SKILL.md");
  const agent = read("learning-learn", "agents", "openai.yaml");
  assert.match(skill, /no broken arrow/i);
  assert.match(skill, /PUSH[\s\S]*LEARN[\s\S]*VERIFY[\s\S]*POP[\s\S]*RESUME[\s\S]*IDLE/);
  assert.match(skill, /exactly one root KnowledgeTarget/i);
  assert.match(skill, /closed child remains Journey-only by default/i);
  assert.match(skill, /runtime concepts, not learner commands/i);
  assert.match(frontmatter(skill), /^disable-model-invocation: true$/m);
  assert.match(agent, /allow_implicit_invocation: false/);
  for (const reference of ["orient.md", "runtime.md", "verify.md"]) {
    assert.equal(existsSync(path.join(root, "learning-learn", "references", reference)), true);
  }
  assert.match(read("learning-learn", "references", "orient.md"), /candidate Root Questions/i);
  assert.equal(existsSync(path.join(root, "learning-learn", "references", "route.md")), false);
  assert.equal(existsSync(path.join(root, "learning-learn", "references", "review.md")), false);
});

test("Learning: Ask is a read-only router over public learner intents", () => {
  const skill = read("learning-ask", "SKILL.md");
  const agent = read("learning-ask", "agents", "openai.yaml");
  assert.match(skill, /read-only router/i);
  assert.match(skill, /\$learning-learn/);
  assert.match(skill, /\$learning-review/);
  assert.match(skill, /\$learning-practice/);
  assert.match(skill, /\$learning-view/);
  assert.match(frontmatter(skill), /^disable-model-invocation: true$/m);
  assert.match(agent, /allow_implicit_invocation: false/);
  assert.match(skill, /read-only|must not mutate/i);
  assert.match(skill, /broad[^\n]*(topic|objective)[^\n]*\$learning-learn|\$learning-learn[^\n]*orientation/i);
  assert.doesNotMatch(skill, /Fresh broad-topic orientation|candidate root questions|accept or choose a candidate|accepted wording/i);
  assert.doesNotMatch(skill, /learning-transition\.mjs|learning-goal\.mjs|review\.mjs|practice\.mjs/);
  assert.doesNotMatch(skill, /node\s+[^\n]*\.mjs/);
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
  const skill = read("learning-view", "SKILL.md");
  const agent = read("learning-view", "agents", "openai.yaml");
  assert.match(skill, /native Desktop Learning Companion/i);
  assert.match(skill, /native companion window/i);
  assert.match(skill, /open-viewer\.mjs/);
  assert.doesNotMatch(skill, /npm ci|_learning-viewer|tauri/i);
  assert.match(skill, /must not mutate `\.learning` domain state/i);
  assert.doesNotMatch(frontmatter(skill), /^disable-model-invocation: true$/m);
  assert.doesNotMatch(agent, /allow_implicit_invocation: false/);
  assert.equal(existsSync(path.join(root, "learning-view", "scripts", "open-viewer.mjs")), true);
});
