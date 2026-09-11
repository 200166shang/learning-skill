import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ask = readFileSync(path.join(repo, "learning-ask", "SKILL.md"), "utf8");
const learn = readFileSync(path.join(repo, "learning-learn", "references", "orient.md"), "utf8");

test("Learning: Ask routes broad topics without owning orientation", () => {
  assert.match(ask, /broad[^\n]*(topic|objective)[^\n]*Learning: Learn|Learning: Learn[^\n]*orientation/i);
  assert.doesNotMatch(ask, /survey source|candidate root|accept or choose|accepted wording/i);
});

test("Learning: Learn persists and starts only an explicitly accepted root", () => {
  assert.match(learn, /After acceptance, create or reuse/i);
  assert.match(learn, /Persist only questions the learner explicitly accepts/i);
  assert.match(learn, /Start only the Root Intent the learner explicitly chooses/i);
  assert.match(learn, /Confirm via the read-only map projection[\s\S]*linked to the new root Question/i);
});

test("active workspaces resume instead of silently replacing the current root", () => {
  assert.match(ask, /active[^\n]*(resume|current question)|current question[^\n]*resume/i);
});
