import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copyFor, otherLanguage, preferredLanguage } from "../src/i18n.js";
import { createRefreshController, toCytoscapeElements, togglePin } from "../src/viewer-model.js";

const map = (status = "current") => ({ graph: { nodes: [{ id: "question:q001", kind: "question", title: "Why?", status }], edges: [{ source: "root:rq001", target: "question:q001", kind: "episode-root" }] } });

test("ViewModel JSON adapts directly to Cytoscape without persisted schema knowledge", () => {
  const elements = toCytoscapeElements(JSON.parse(JSON.stringify(map())));
  assert.equal(elements[0].data.label, "Why?");
  assert.equal(elements[1].data.source, "root:rq001");
  const source = readFileSync(new URL("../src/viewer-model.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\.learning|yaml|journey|state\.yaml/i);
});

test("identical polling snapshots do not duplicate or redraw elements", async () => {
  const updates = [];
  const refresh = createRefreshController({ load: async () => map(), onUpdate: (value) => updates.push(value), onError: assert.fail });
  assert.equal(await refresh(), true);
  assert.equal(await refresh(), false);
  assert.equal(updates.length, 1);
});

test("a changed ViewModel updates current status without restarting", async () => {
  let status = "current";
  const updates = [];
  const refresh = createRefreshController({ load: async () => map(status), onUpdate: (value) => updates.push(value), onError: assert.fail });
  await refresh(); status = "completed"; await refresh();
  assert.equal(updates.length, 2);
  assert.equal(updates[1].graph.nodes[0].status, "completed");
});

test("Pin delegates to the native always-on-top API and updates local UI", async () => {
  const calls = [];
  const attributes = new Map([["aria-pressed", "false"]]);
  const button = { textContent: "Pin", getAttribute: (name) => attributes.get(name), setAttribute: (name, value) => attributes.set(name, value) };
  await togglePin({ setAlwaysOnTop: async (value) => calls.push(value) }, button);
  assert.deepEqual(calls, [true]);
  assert.equal(button.textContent, "Pinned");
  assert.equal(attributes.get("aria-pressed"), "true");
});

test("language selection follows saved preference then system language", () => {
  assert.equal(preferredLanguage("zh-CN"), "zh");
  assert.equal(preferredLanguage("en-US"), "en");
  assert.equal(preferredLanguage("en-US", "zh"), "zh");
  assert.equal(otherLanguage("zh"), "en");
  assert.equal(copyFor("zh").noActive, "当前没有活跃问题");
  assert.equal(copyFor("en").noActive, "No active question");
});

test("viewer code exposes no Learning mutation command path", () => {
  const source = ["app.js", "viewer-model.js"].map((name) => readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8")).join("\n");
  const commands = [...source.matchAll(/invoke\(["']([^"']+)/g)].map((match) => match[1]);
  assert.deepEqual(commands, ["read_learning_map"]);
});
