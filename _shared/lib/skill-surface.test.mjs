import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
const internalPhaseNames = ["orient", "verify", "push", "pop", "resume", "overview", "note", "curate"];

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "SKILL.md should have frontmatter");
  return match[1];
}

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
    const skill = readFileSync(resolve(repo, name, "SKILL.md"), "utf8");
    const agent = readFileSync(resolve(repo, name, "agents/openai.yaml"), "utf8");
    assert.match(frontmatter(skill), /^disable-model-invocation: true$/m, `${name} should be user-invoked across harnesses`);
    assert.equal(agent.includes("allow_implicit_invocation: false"), true, `${name} should remain user-invoked in Codex`);
  }

  const viewSkill = readFileSync(resolve(repo, "learning-view", "SKILL.md"), "utf8");
  const viewAgent = readFileSync(resolve(repo, "learning-view", "agents/openai.yaml"), "utf8");
  assert.equal(viewSkill.includes("disable-model-invocation: true"), false, "learning-view should be model-invoked");
  assert.equal(viewAgent.includes("allow_implicit_invocation"), false, "learning-view should permit model invocation in Codex");
  assert.match(frontmatter(viewSkill), /Native Learning Companion/i);
  assert.match(frontmatter(viewSkill), /learning map/i);
  assert.match(frontmatter(viewSkill), /window state/i);

  for (const legacy of ["learning", "review", "practice"]) {
    assert.equal(existsSync(resolve(repo, legacy)), false, `legacy ${legacy}/ skill directory should be removed`);
  }
});

test("public surface stays exactly five skills and keeps runtime phases internal", () => {
  const publicSkillDirectories = readdirSync(repo, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(repo, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(publicSkillDirectories, skills.map(([name]) => name).sort());
  for (const phase of internalPhaseNames) {
    assert.equal(
      publicSkillDirectories.some((name) => name === phase || name === `learning-${phase}`),
      false,
      `${phase} should remain an internal Learning: Learn phase`,
    );
  }
});

test("public skills retain distinct ownership contracts", () => {
  const contracts = Object.fromEntries(
    skills.map(([name]) => [name, readFileSync(resolve(repo, name, "SKILL.md"), "utf8")]),
  );

  assert.match(contracts["learning-ask"], /read-only router/i);
  assert.match(contracts["learning-learn"], /Every closed question requires persisted passing Evidence/);
  assert.match(contracts["learning-review"], /retrieval-first/i);
  assert.match(contracts["learning-review"], /Scheduling belongs only to ReviewItems/);
  assert.match(contracts["learning-practice"], /Practice applies selected knowledge in artifacts/);
  assert.match(contracts["learning-practice"], /observable results/i);
  assert.match(contracts["learning-view"], /thin UI adapter/i);
  assert.match(contracts["learning-view"], /must not mutate `\.learning` domain state/i);
});

test("installer exposes the suite and keeps the desktop viewer internal", () => {
  const install = readFileSync(resolve(repo, "install.sh"), "utf8");
  assert.equal(install.includes("for skill in learning-ask learning-learn learning-review learning-practice learning-view"), true);
  assert.equal(install.includes("_learning-viewer"), true);
  assert.equal(install.includes("learning review practice"), true, "installer should clean legacy public skill names");
});
