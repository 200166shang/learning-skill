import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ask = readFileSync(path.join(repo, "learning-ask", "SKILL.md"), "utf8");
const learn = readFileSync(path.join(repo, "learning-learn", "references", "orient.md"), "utf8");

test("fresh broad-topic routing remains read-only through candidate selection", () => {
  assert.match(ask, /workspace is empty or safely known to be IDLE/i);
  assert.match(ask, /Survey source structure without writing learning state/i);
  assert.match(ask, /Candidates are ephemeral/i);
  assert.match(ask, /do not start it from this router/i);
});

test("Learning: Learn persists and starts only an explicitly accepted root", () => {
  assert.match(learn, /After acceptance, create or reuse/i);
  assert.match(learn, /Persist only questions the learner explicitly accepts/i);
  assert.match(learn, /Start only the Root Intent the learner explicitly chooses/i);
  assert.match(learn, /Confirm via the read-only map projection[\s\S]*linked to the new root Question/i);
});

test("active workspaces resume instead of silently replacing the current root", () => {
  assert.match(ask, /For an active workspace, recommend resuming the persisted current question/i);
});
