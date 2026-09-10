import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { watchLearningFiles } from "./watcher.mjs";

test("observes nested Markdown note changes and debounces refreshes", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "learning-watch-test-"));
  const notes = path.join(root, "notes", "nested");
  mkdirSync(notes, { recursive: true });
  let changes = 0;
  const observer = watchLearningFiles(root, () => { changes += 1; }, 40);
  await new Promise((resolve) => setTimeout(resolve, 120));
  writeFileSync(path.join(notes, "topic.md"), "# first\n");
  writeFileSync(path.join(notes, "topic.md"), "# second\n");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await observer.close();
  assert.equal(changes, 1);
});
