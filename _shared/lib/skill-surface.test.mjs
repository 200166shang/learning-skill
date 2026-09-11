import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const skills = [
  ["learning-ask", "Learning: Ask"],
  ["learning-learn", "Learning: Learn"],
  ["learning-review", "Learning: Review"],
  ["learning-practice", "Learning: Practice"],
  ["learning-view", "Learning: View"],
];

test("public Learning Suite skill surface is namespaced and discoverable", () => {
  for (const [name, displayName] of skills) {
    const skillPath = resolve(repo, name, "SKILL.md");
    const agentPath = resolve(repo, name, "agents/openai.yaml");
    assert.equal(existsSync(skillPath), true, `${name}/SKILL.md should exist`);
    assert.equal(existsSync(agentPath), true, `${name}/agents/openai.yaml should exist`);

    const skill = readFileSync(skillPath, "utf8");
    const agent = readFileSync(agentPath, "utf8");
    assert.match(skill, new RegExp(`^---\\nname: ${name}\\n`, "m"));
    assert.match(agent, new RegExp(`display_name: "${displayName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}"`));
    assert.match(agent, /allow_implicit_invocation: false/);
  }

  for (const legacy of ["learning", "review", "practice"]) {
    assert.equal(existsSync(resolve(repo, legacy)), false, `legacy ${legacy}/ skill directory should be removed`);
  }
});

test("installer exposes the suite and keeps the desktop viewer internal", () => {
  const install = readFileSync(resolve(repo, "install.sh"), "utf8");
  for (const [name] of skills) {
    assert.match(install, new RegExp(`cp -R .*\\$skill|${name}`));
  }
  assert.match(install, /_learning-viewer/);
  assert.match(install, /learning review practice/);
});
