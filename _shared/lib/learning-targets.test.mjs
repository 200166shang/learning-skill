import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { executeLearningTransition } from "./learning-runtime.mjs";
import { inspectLearningWorkspace } from "./learning-workspace.mjs";

const temp = () => mkdtempSync(path.join(tmpdir(), "learning-targets-"));
const at = "2026-09-11T01:00:00Z";
const start = (root) => executeLearningTransition(root, { type: "start", question: "Root?", createdAt: at });
const pass = (root, target) => executeLearningTransition(root, { type: "verify", result: "pass", independence: "unaided", demonstrated: ["answer"], gaps: [], createdAt: at, target });

test("root closure creates exactly one stable KnowledgeTarget linked from evidence", () => {
  const root = temp(); start(root);
  pass(root, { title: "Root concept", kind: "concept", noteRefs: [], sourceRefs: ["README.md"] });
  const recovered = inspectLearningWorkspace(root);
  assert.equal(recovered.targets.targets.targets.length, 1);
  assert.deepEqual(recovered.targets.targets.targets[0].origin.questionIds, ["q001"]);
  assert.equal(recovered.evidence.evidence.verifications[0].targetId, "k001");
  assert.equal(recovered.state.state.mode, "idle");
});

test("children stay selective and explicit promotion is idempotent", () => {
  const root = temp(); start(root);
  executeLearningTransition(root, { type: "push", question: "Child?", whyNeeded: "gap", resumeCheckpoint: "resume", accepted: true, relationship: "blocking", createdAt: at });
  pass(root);
  assert.equal(inspectLearningWorkspace(root).targets.targets.targets.length, 0);
  executeLearningTransition(root, { type: "promote_target", questionId: "q002", title: "Reusable child", kind: "procedure", noteRefs: [], sourceRefs: [] });
  executeLearningTransition(root, { type: "promote_target", questionId: "q002", title: "Reusable child", kind: "procedure", noteRefs: [], sourceRefs: [] });
  const recovered = inspectLearningWorkspace(root);
  assert.equal(recovered.targets.targets.targets.length, 1);
  assert.equal(recovered.targets.targets.targets[0].id, "k001");
});

test("open child cannot be promoted and target IDs survive title changes", () => {
  const root = temp(); start(root);
  executeLearningTransition(root, { type: "push", question: "Child?", whyNeeded: "gap", resumeCheckpoint: "resume", accepted: true, relationship: "blocking", createdAt: at });
  assert.throws(() => executeLearningTransition(root, { type: "promote_target", questionId: "q002", title: "Too soon", kind: "concept" }), /closed question/);
  pass(root);
  executeLearningTransition(root, { type: "promote_target", questionId: "q002", title: "First title", kind: "concept" });
  executeLearningTransition(root, { type: "update_target", targetId: "k001", title: "Renamed title" });
  const target = inspectLearningWorkspace(root).targets.targets.targets[0];
  assert.equal(target.id, "k001");
  assert.equal(target.title, "Renamed title");
});

test("canonical inspection rejects evidence linked to a nonexistent target", () => {
  const root = temp(); start(root);
  const evidencePath = path.join(root, ".learning", "evidence.yaml");
  writeFileSync(evidencePath, readFileSync(evidencePath, "utf8").replace("target_id: null", "target_id: k999"));
  // Empty evidence has no target_id line, so first record a failed attempt when needed.
  if (inspectLearningWorkspace(root).status === "current") {
    executeLearningTransition(root, { type: "verify", result: "fail", independence: "unaided", demonstrated: [], gaps: ["gap"], createdAt: at });
    writeFileSync(evidencePath, readFileSync(evidencePath, "utf8").replace("target_id: null", "target_id: k999"));
  }
  assert.match(inspectLearningWorkspace(root).warnings.join("\n"), /verification target not found/);
});
