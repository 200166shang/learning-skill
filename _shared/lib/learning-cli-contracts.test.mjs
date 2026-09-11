import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const goal = fileURLToPath(new URL("../scripts/learning-goal.mjs", import.meta.url)), transition = fileURLToPath(new URL("../scripts/learning-transition.mjs", import.meta.url)), status = fileURLToPath(new URL("../scripts/learning-status.mjs", import.meta.url));
const temp = () => mkdtempSync(path.join(tmpdir(), "learning-cli-"));
const run = (cli, args = [], input = "") => spawnSync(process.execPath, [cli, ...args], { input, encoding: "utf8" });
test("help and schema are complete and workspace-independent", () => {
  const root = temp(); for (const cli of [goal, transition, status]) assert.equal(run(cli, ["--help"]).status, 0);
  const goalSchema = JSON.parse(run(goal, ["--schema"]).stdout), transitionSchema = JSON.parse(run(transition, ["--schema"]).stdout);
  assert.deepEqual(goalSchema.oneOf.map((item) => item.properties.type.const), ["create", "add_roots", "update", "update_root", "add_source", "remove_source", "close", "list", "show"]);
  assert.deepEqual(transitionSchema.oneOf.map((item) => item.properties.type.const), ["start", "push", "verify", "promote_target", "update_target", "set_note_refs", "replace_note_refs"]); assert.equal(existsSync(path.join(root, ".learning")), false);
});
test("invalid intents and empty reads do not initialize a workspace", () => {
  for (const [cli, intent] of [[goal, { type: "bogus" }], [transition, { type: "bogus" }]]) { const root = temp(), result = run(cli, [root], JSON.stringify(intent)); assert.notEqual(result.status, 0); assert.equal(existsSync(path.join(root, ".learning")), false); }
  const listRoot = temp(), list = run(goal, [listRoot], JSON.stringify({ type: "list" })); assert.equal(list.status, 0, list.stderr); assert.deepEqual(JSON.parse(list.stdout), []); assert.equal(existsSync(path.join(listRoot, ".learning")), false);
  const showRoot = temp(), show = run(goal, [showRoot], JSON.stringify({ type: "show", goalId: "g001" })); assert.equal(show.status, 1); assert.equal(existsSync(path.join(showRoot, ".learning")), false);
});
test("malformed goal fields are rejected before initialization", () => {
  for (const intent of [{ type: "create", title: "Title", objective: "Objective", sources: [{ ref: "/x", role: "guess" }] }, { type: "create", title: "Title", objective: "Objective", sources: [{ ref: "", role: "code" }] }, { type: "add_roots", goalId: "g001", questions: [] }, { type: "add_roots", goalId: "g001", questions: ["  "] }]) { const root = temp(), result = run(goal, [root], JSON.stringify(intent)); assert.equal(result.status, 1); assert.equal(existsSync(path.join(root, ".learning")), false); }
});
test("transition schema describes nested target and replacement contracts", () => {
  const schema = JSON.parse(run(transition, ["--schema"]).stdout), byType = new Map(schema.oneOf.map((entry) => [entry.properties.type.const, entry]));
  assert.equal(byType.get("start").oneOf.length, 2); assert.deepEqual(byType.get("start").oneOf[1].required, ["goalId", "rootIntentId"]);
  assert.deepEqual(byType.get("verify").properties.target.required, ["title", "kind"]); assert.deepEqual(byType.get("promote_target").properties.kind.enum, ["memory", "concept", "procedure", "design"]);
  assert.match(byType.get("verify").properties.target.description, /passing.*root.*child/i);
  assert.ok(byType.get("update_target").properties.noteRefs.items.minLength); assert.deepEqual(byType.get("replace_note_refs").properties.replacements.items.required, ["from", "to"]);
});
test("start rejects empty, partial goal, and mixed shapes before workspace inspection", () => {
  for (const intent of [{ type: "start" }, { type: "start", goalId: "g001" }, { type: "start", rootIntentId: "rq001" }, { type: "start", question: "Direct", goalId: "g001", rootIntentId: "rq001" }]) {
    const root = temp(), result = run(transition, [root], JSON.stringify(intent)); assert.equal(result.status, 1); assert.equal(existsSync(path.join(root, ".learning")), false);
  }
});
