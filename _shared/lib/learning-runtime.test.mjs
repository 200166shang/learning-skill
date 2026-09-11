import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-runtime-"));
const cli = fileURLToPath(new URL("../scripts/learning-transition.mjs", import.meta.url));
const transitionInFreshProcess = (root, intent) => {
  const result = spawnSync(process.execPath, [cli, root], { input: JSON.stringify(intent), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
};
const startIntent = {
  type: "start",
  question: "Why does the system recover?",
  createdAt: "2026-09-11T00:00:00Z",
};

test("runtime owns a complete start, nested push, reload, and pop transition", () => {
  const root = temp();
  transitionInFreshProcess(root, startIntent);
  transitionInFreshProcess(root, {
    type: "push",
    question: "What is persisted?",
    whyNeeded: "Recovery needs durable truth",
    resumeCheckpoint: "Return to the recovery mechanism",
    accepted: true,
    relationship: "blocking",
    createdAt: "2026-09-11T00:01:00Z",
  });
  transitionInFreshProcess(root, {
    type: "push",
    question: "How is the focus encoded?",
    whyNeeded: "The durable truth needs an exact cursor",
    resumeCheckpoint: "Continue from durable truth to recovery",
    accepted: true,
    relationship: "blocking",
    createdAt: "2026-09-11T00:02:00Z",
  });

  let recovered = inspectLearningWorkspace(root);
  assert.equal(recovered.status, "current");
  assert.equal(recovered.state.state.activeEpisodeId, "e001");
  assert.deepEqual(recovered.state.state.focusStack, ["q001", "q002", "q003"]);
  assert.equal(recovered.journey.journey.questions.find((q) => q.id === "q003").resumeCheckpoint, "Continue from durable truth to recovery");
  assert.equal(recovered.evidence.evidence.verifications.length, 0);

  transitionInFreshProcess(root, {
    type: "verify",
    result: "pass",
    independence: "unaided",
    demonstrated: ["focus_stack is the durable cursor"],
    gaps: [],
    createdAt: "2026-09-11T00:03:00Z",
  });
  recovered = inspectLearningWorkspace(root);
  assert.equal(recovered.status, "current");
  assert.deepEqual(recovered.state.state.focusStack, ["q001", "q002"]);
  assert.equal(recovered.journey.journey.questions.find((q) => q.id === "q003").status, "closed");
});

test("runtime fails closed before mutation when persisted models disagree", () => {
  const root = temp();
  executeLearningTransition(root, startIntent);
  const statePath = path.join(root, ".learning", "state.yaml");
  writeFileSync(statePath, readFileSync(statePath, "utf8").replace("q001", "q999"));
  const before = readFileSync(statePath, "utf8");

  assert.throws(() => executeLearningTransition(root, {
    type: "push",
    question: "Should never persist",
    whyNeeded: "invalid input",
    resumeCheckpoint: "none",
    accepted: true,
    relationship: "blocking",
    createdAt: "2026-09-11T00:04:00Z",
  }), /workspace is invalid/);
  assert.equal(readFileSync(statePath, "utf8"), before);
});

test("canonical inspection reuses State and Evidence cross-file validators", () => {
  const root = temp();
  executeLearningTransition(root, startIntent);
  const statePath = path.join(root, ".learning", "state.yaml");
  writeFileSync(statePath, readFileSync(statePath, "utf8").replace("q001", "q999"));
  assert.match(inspectLearningWorkspace(root).warnings.join("\n"), /invalid open focus question: q999/);

  const clean = temp();
  executeLearningTransition(clean, startIntent);
  const evidencePath = path.join(clean, ".learning", "evidence.yaml");
  writeFileSync(evidencePath, "version: 1\nverifications:\n  - id: v001\n    episode_id: e001\n    question_id: q999\n    kind: review\n    result: fail\n    independence: unaided\n    demonstrated: []\n    gaps: []\n    created_at: 2026-09-11T00:05:00Z\nmisconceptions: []\n");
  assert.match(inspectLearningWorkspace(clean).warnings.join("\n"), /verification question mismatch: v001/);
});
