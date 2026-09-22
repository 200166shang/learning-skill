import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import test from "node:test";

const execFileAsync = promisify(execFile);
const expectedSkills = [
  "learning",
  "learning-learn",
  "learning-review",
  "learning-practice",
  "learning-resources",
  "learning-organize",
];

test("CLI installs the six public skills and removes the retired research skill", async () => {
  const target = await mkdtemp(join(tmpdir(), "learning-skill-test-"));

  try {
    await mkdir(join(target, "learning-research"));
    await execFileAsync(process.execPath, ["bin/install.mjs", target], {
      cwd: new URL("..", import.meta.url),
    });

    await assert.rejects(readFile(join(target, "learning-research", "SKILL.md")));

    for (const skill of expectedSkills) {
      const content = await readFile(join(target, skill, "SKILL.md"), "utf8");
      assert.match(content, new RegExp(`name: ${skill}\\n`));
    }
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});

test("installed skills share the multi-Root question and cross-Root topic contract", async () => {
  const target = await mkdtemp(join(tmpdir(), "learning-skill-contract-"));

  try {
    await execFileAsync(process.execPath, ["bin/install.mjs", target], {
      cwd: new URL("..", import.meta.url),
    });

    const recording = await readFile(
      join(target, "learning-learn", "references", "recording.md"),
      "utf8",
    );
    const organize = await readFile(
      join(target, "learning-organize", "SKILL.md"),
      "utf8",
    );

    assert.match(recording, /root-compass\.yaml/);
    assert.match(recording, /r003-q003/);
    assert.match(recording, /candidate has no `path`/);
    assert.match(organize, /source_snapshot:\n  roots:/);
    assert.match(organize, /sources:\n      - r001-q004/);
    assert.doesNotMatch(organize, /source_snapshot:\n  questions:/);
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});
