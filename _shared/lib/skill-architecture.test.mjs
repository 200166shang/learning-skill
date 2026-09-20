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
  assert.equal(existsSync(path.join(root, "learning", "references", "route.md")), false);
});

test("learning-organize is explicit, approval-gated, and keeps organized output derived", () => {
  const skill = readFileSync(path.join(root, "learning-organize", "SKILL.md"), "utf8");
  const metadata = readFileSync(path.join(root, "learning-organize", "agents", "openai.yaml"), "utf8");
  const quality = readFileSync(path.join(root, "learning-organize", "references", "topic-quality.md"), "utf8");

  assert.match(metadata, /allow_implicit_invocation:\s*false/);
  assert.match(skill, /PROPOSE[\s\S]*stop[\s\S]*approved proposal[\s\S]*WRITE[\s\S]*VALIDATE/i);
  assert.match(skill, /Create or change no files in this phase/i);
  assert.match(skill, /organized\/[\s\S]*organize\.yaml[\s\S]*topics\//);
  assert.match(skill, /Questions preserve how learning happened/i);
  assert.match(skill, /Topics are replaceable projections/i);
  assert.match(skill, /learner's current instruction[\s\S]*original Questions[\s\S]*current Topics/i);
  assert.match(skill, /read and apply the complete \[Topic quality contract\]/i);
  assert.match(skill, /Remove obsolete Topic files/i);
  assert.match(skill, /never `Q → T → U`/i);
  assert.match(skill, /do not invent a curriculum/i);
  assert.match(skill, /semantically unchanged/i);
  assert.match(quality, /whole → parts → whole/i);
  assert.match(quality, /Preserve the reasoning spine; remove conversational redundancy/i);
  assert.match(quality, /add integration value beyond its sources/i);
  assert.match(quality, /without the original Questions/i);
});

test("learning-research is explicit and keeps research outside canonical learning state", () => {
  const skill = readFileSync(path.join(root, "learning-research", "SKILL.md"), "utf8");
  const metadata = readFileSync(path.join(root, "learning-research", "agents", "openai.yaml"), "utf8");
  const quality = readFileSync(path.join(root, "learning-research", "references", "source-quality.md"), "utf8");

  assert.match(metadata, /allow_implicit_invocation:\s*false/);
  assert.match(skill, /Current Question[\s\S]*Selected Questions[\s\S]*Organized Topic/);
  assert.match(skill, /3–6 core sources/);
  assert.match(skill, /Research may suggest Questions[\s\S]*Only `\$learning` may create a Question/);
  assert.match(skill, /research\/rNNN\.md/);
  assert.match(skill, /Do not allocate Question IDs/);
  assert.match(skill, /research itself never starts[\s\S]*`\$learning-organize`/i);
  assert.match(skill, /Research immediately when[\s\S]*one reasonable direction/i);
  assert.match(skill, /materially different searches or primary source sets/i);
  assert.match(skill, /offer 2–4 genuinely distinct directions/i);
  assert.match(skill, /Ask one concise question, then stop/i);
  assert.match(skill, /Perform no full research and create no Research Note before the learner chooses/i);
  assert.match(skill, /After research, always explain the findings[\s\S]*discuss the possible next learning directions/i);
  assert.match(skill, /Direction alignment alone never creates one/i);
  assert.match(quality, /Primary and authoritative/);
  assert.match(quality, /Exclude shallow summaries[\s\S]*SEO pages/);
  assert.match(quality, /Verify every claimed document section, code path, symbol, behavior, and video chapter/);
});
