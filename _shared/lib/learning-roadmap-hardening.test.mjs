import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { executeLearningGoalCommand } from "./learning-goal-runtime.mjs";
import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-roadmap-hardening-"));
const at = (minute) => `2026-09-11T05:${String(minute).padStart(2, "0")}:00Z`;
const viewCli = fileURLToPath(new URL("../scripts/learning-view.mjs", import.meta.url));
const canonicalFiles = ["workspace.yaml", "journey.yaml", "evidence.yaml", "state.yaml", "targets.yaml", "goals.yaml"];

function snapshotCanonical(workspace) {
  return Object.fromEntries(canonicalFiles.map((name) => {
    const target = path.join(workspace, ".learning", name);
    return [name, existsSync(target) ? readFileSync(target) : null];
  }));
}

function createGoalWithRoots(workspace, questions = ["First root?", "Second root?"]) {
  const goal = executeLearningGoalCommand(workspace, { type: "create", title: "Robot LLM", objective: "Understand the complete chain", sources: [{ ref: "/robot", role: "code" }], createdAt: at(0) });
  const roots = executeLearningGoalCommand(workspace, { type: "add_roots", goalId: goal.id, questions, acceptedAt: at(1) });
  return { goal, roots };
}

function readGoalsYaml(workspace) {
  const target = path.join(workspace, ".learning", "goals.yaml");
  return { target, data: YAML.parse(readFileSync(target, "utf8")) };
}

test("start contract rejects ambiguous and incomplete shapes without mutating persisted state", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace, ["How does language become action?"]), before = snapshotCanonical(workspace);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", question: "duplicate caller text", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) }), /either question or goalId\/rootIntentId/);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", goalId: goal.id, createdAt: at(2) }), /requires both goalId and rootIntentId/);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", rootIntentId: roots[0].id, createdAt: at(2) }), /requires both goalId and rootIntentId/);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", createdAt: at(2) }), /direct start requires a question/);
  assert.deepEqual(snapshotCanonical(workspace), before);
});

test("wrong Goal/root relation and closed Goals fail without creating an Episode", () => {
  const workspace = temp();
  const first = createGoalWithRoots(workspace, ["First goal root?"]);
  const secondGoal = executeLearningGoalCommand(workspace, { type: "create", title: "Second", objective: "Another objective", createdAt: at(2) });
  const [secondRoot] = executeLearningGoalCommand(workspace, { type: "add_roots", goalId: secondGoal.id, questions: ["Second goal root?"], acceptedAt: at(3) });

  let before = snapshotCanonical(workspace);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", goalId: secondGoal.id, rootIntentId: first.roots[0].id, createdAt: at(4) }), /root intent not found in goal/);
  assert.deepEqual(snapshotCanonical(workspace), before);

  executeLearningGoalCommand(workspace, { type: "close", goalId: first.goal.id, closedAt: at(5) });
  before = snapshotCanonical(workspace);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", goalId: first.goal.id, rootIntentId: first.roots[0].id, createdAt: at(6) }), /goal is closed/);
  assert.deepEqual(snapshotCanonical(workspace), before);
  const current = inspectLearningWorkspace(workspace);
  assert.equal(current.journey.journey.episodes.length, 0);
  assert.equal(secondRoot.episodeId, null);
});

test("an active Episode blocks another accepted root and preserves the pending root", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  const before = snapshotCanonical(workspace);
  assert.throws(() => executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[1].id, createdAt: at(3) }), /cannot start while an Episode is active/);
  assert.deepEqual(snapshotCanonical(workspace), before);
  const current = inspectLearningWorkspace(workspace);
  assert.equal(current.journey.journey.episodes.length, 1);
  assert.equal(current.goals.goals.goals[0].rootIntents[0].episodeId, "e001");
  assert.equal(current.goals.goals.goals[0].rootIntents[1].episodeId, null);
});

test("closing a Goal does not close or replace its active Episode", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace, ["Active root?"]);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  executeLearningGoalCommand(workspace, { type: "close", goalId: goal.id, closedAt: at(3) });
  const current = inspectLearningWorkspace(workspace);
  assert.equal(current.goals.goals.goals[0].closedAt, at(3));
  assert.equal(current.journey.journey.episodes[0].status, "active");
  assert.equal(current.state.state.mode, "active");
  assert.equal(current.state.state.activeEpisodeId, "e001");
});

test("a started Root Intent is immutable", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace, ["Stable root wording?"]);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  const before = snapshotCanonical(workspace);
  assert.throws(() => executeLearningGoalCommand(workspace, { type: "update_root", goalId: goal.id, rootIntentId: roots[0].id, question: "Drifted wording" }), /started root intent is immutable/);
  assert.deepEqual(snapshotCanonical(workspace), before);
});

test("canonical inspection rejects duplicate Episode linkage between Root Intents", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  const { target, data } = readGoalsYaml(workspace);
  data.goals[0].root_intents[1].episode_id = "e001";
  writeFileSync(target, YAML.stringify(data));
  const invalid = inspectLearningWorkspace(workspace);
  assert.equal(invalid.status, "invalid");
  assert.match(invalid.warnings.join("; "), /episode linked by multiple root intents: e001/);
});

test("canonical inspection rejects Root Intent and Journey root text drift", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace, ["Original wording?"]);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  const { target, data } = readGoalsYaml(workspace);
  data.goals[0].root_intents[0].question = "Different persisted wording?";
  writeFileSync(target, YAML.stringify(data));
  const invalid = inspectLearningWorkspace(workspace);
  assert.equal(invalid.status, "invalid");
  assert.match(invalid.warnings.join("; "), /root intent question mismatch: rq001/);
});

test("Goal view is read-only and invalid Goal links fail closed", () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace);
  executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) });
  const before = snapshotCanonical(workspace);
  const valid = spawnSync(process.execPath, [viewCli, "--workspace", workspace, "--goal", goal.id, "--format", "json"], { encoding: "utf8" });
  assert.equal(valid.status, 0, valid.stderr);
  assert.deepEqual(snapshotCanonical(workspace), before);

  const { target, data } = readGoalsYaml(workspace);
  data.goals[0].root_intents[0].episode_id = "e999";
  writeFileSync(target, YAML.stringify(data));
  const invalid = spawnSync(process.execPath, [viewCli, "--workspace", workspace, "--goal", goal.id, "--format", "text"], { encoding: "utf8" });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /learning workspace is invalid/i);
  assert.match(invalid.stderr, /root intent episode not found/i);
});

test("direct question-first Episodes remain valid without a LearningGoal", () => {
  const workspace = temp();
  executeLearningTransition(workspace, { type: "start", question: "Why can PWM control motor speed?", createdAt: at(0) });
  const current = inspectLearningWorkspace(workspace);
  assert.equal(current.status, "current");
  assert.equal(current.goals.goals.goals.length, 0);
  assert.equal(current.journey.journey.questions[0].question, "Why can PWM control motor speed?");
  assert.deepEqual(current.state.state.focusStack, ["q001"]);
  const output = spawnSync(process.execPath, [viewCli, "--workspace", workspace, "--format", "text"], { encoding: "utf8" });
  assert.equal(output.status, 0, output.stderr);
  assert.match(output.stdout, /Episode: Why can PWM control motor speed\?/);
});

test("filesystem commit failure leaves Goal, Journey, and State byte-identical", { skip: process.platform === "win32" || (typeof process.getuid === "function" && process.getuid() === 0) }, () => {
  const workspace = temp(), { goal, roots } = createGoalWithRoots(workspace, ["Atomic root?"]), learningDir = path.join(workspace, ".learning"), before = snapshotCanonical(workspace);
  chmodSync(learningDir, 0o500);
  try {
    assert.throws(() => executeLearningTransition(workspace, { type: "start", goalId: goal.id, rootIntentId: roots[0].id, createdAt: at(2) }), /EACCES|EPERM|permission denied/i);
  } finally {
    chmodSync(learningDir, 0o700);
  }
  assert.deepEqual(snapshotCanonical(workspace), before);
  const current = inspectLearningWorkspace(workspace);
  assert.equal(current.status, "current");
  assert.equal(current.state.state.mode, "idle");
  assert.equal(current.journey.journey.episodes.length, 0);
  assert.equal(current.goals.goals.goals[0].rootIntents[0].episodeId, null);
});
