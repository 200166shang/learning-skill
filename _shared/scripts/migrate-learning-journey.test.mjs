import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import { buildLearningGraph } from "../lib/learning-graph.mjs";
import { migrateLearningJourney } from "./migrate-learning-journey.mjs";

test("migrates explicit derived-from lineage without rewriting notes", () => {
  const root = mkdtempSync(path.join(tmpdir(), "journey-migration-"));
  mkdirSync(path.join(root, "notes"));
  const parent = "---\ntitle: Root\n---\nRoot body\n";
  const child = "---\ntitle: Child\nrelations:\n  - type: derived-from\n    ref: notes/root.md\n    question: Why child?\n---\nChild body\n";
  writeFileSync(path.join(root, "notes", "root.md"), parent);
  writeFileSync(path.join(root, "notes", "child.md"), child);
  const result = migrateLearningJourney(root);
  const journey = YAML.parse(readFileSync(result.target, "utf8"));
  assert.equal(journey.questions.length, 2);
  assert.equal(journey.questions.find((item) => item.question === "Why child?").parent_id, journey.questions.find((item) => item.question === "Root").id);
  assert.equal(readFileSync(path.join(root, "notes", "child.md"), "utf8"), child);
  const graph = buildLearningGraph(root);
  assert.equal(graph.source, "journey");
  assert.equal(graph.nodes.length, 2);
  assert.deepEqual(graph.edges.map(({ type }) => type), ["journey"]);
  assert.throws(() => migrateLearningJourney(root), /already exists/);
});
