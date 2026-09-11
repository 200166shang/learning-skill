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
  assert.equal(existsSync(path.join(root, "learning", "references", "route.md")), false);
});
