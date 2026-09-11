import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const userInvoked = [
  ["learning-ask", "Learning: Ask"],
  ["learning-learn", "Learning: Learn"],
  ["learning-review", "Learning: Review"],
  ["learning-practice", "Learning: Practice"],
];
const modelInvoked = [["learning-view", "Learning: View"]];
const skills = [...userInvoked, ...modelInvoked];

test("public Learning Suite skill surface is namespaced and discoverable", () => {
  for (const [name, displayName] of skills) {
    const skillPath = resolve(repo, name, "SKILL.md");
    const agentPath = resolve(repo, name, "agents/openai.yaml");
    assert.equal(existsSync(skillPath), true, `${name}/SKILL.md should exist`);
    assert.equal(existsSync(agentPath), true, `${name}/agents/openai.yaml should exist`);

    const skill = readFileSync(skillPath, "utf8");
    const agent = readFileSync(agentPath, "utf8");
    assert.equal(skill.startsWith(`---\nname: ${name}\n`), true, `${name} frontmatter should use the directory name`);
    assert.equal(agent.includes(`display_name: "${displayName}"`), true, `${name} should expose ${displayName}`);
  }

  for (const [name] of userInvoked) {
    const agent = readFileSync(resolve(repo, name, "agents/openai.yaml"), "utf8");
    assert.equal(agent.includes("allow_implicit_invocation: false"), true, `${name} should remain user-invoked in Codex`);
  }

  const viewSkill = readFileSync(resolve(repo, "learning-view", "SKILL.md"), "utf8");
  const viewAgent = readFileSync(resolve(repo, "learning-view", "agents/openai.yaml"), "utf8");
  assert.equal(viewSkill.includes("disable-model-invocation: true"), false, "learning-view should be model-invoked");
  assert.equal(viewAgent.includes("allow_implicit_invocation"), false, "learning-view should permit model invocation in Codex");
  assert.match(viewSkill, /Use when the learner asks to open, show, focus, inspect, pin/i);

  for (const legacy of ["learning", "review", "practice"]) {
    assert.equal(existsSync(resolve(repo, legacy)), false, `legacy ${legacy}/ skill directory should be removed`);
  }
});

test("installer exposes the suite and keeps the desktop viewer internal", () => {
  const install = readFileSync(resolve(repo, "install.sh"), "utf8");
  assert.equal(install.includes("for skill in learning-ask learning-learn learning-review learning-practice learning-view"), true);
  assert.equal(install.includes("_learning-viewer"), true);
  assert.equal(install.includes("learning review practice"), true, "installer should clean legacy public skill names");
});
