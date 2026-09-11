import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copyFor, otherLanguage, preferredLanguage } from "../src/i18n.js";
import { createRefreshController, nodeDimensions, toCytoscapeElements, togglePin, wrapLabel } from "../src/viewer-model.js";

const map = (status = "current") => ({ graph: { nodes: [{ id: "question:q001", kind: "question", title: "Why?", status }], edges: [{ source: "root:rq001", target: "question:q001", kind: "episode-root" }] } });

test("ViewModel JSON adapts directly to Cytoscape without persisted schema knowledge", () => {
  const elements = toCytoscapeElements(JSON.parse(JSON.stringify(map())));
  assert.equal(elements[0].data.label, "Why?");
  assert.equal(elements[1].data.source, "root:rq001");
  const source = readFileSync(new URL("../src/viewer-model.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\.learning|yaml|journey|state\.yaml/i);
});

test("node dimensions grow with wrapped title lines and stay bounded", () => {
  assert.deepEqual(nodeDimensions("短标题", "question"), { nodeWidth: 196, nodeHeight: 62 });
  const long = nodeDimensions("如何从概念、系统架构和源码调用链完整理解小沫机器人的大模型模块，并能在面试中流畅解释其设计、数据流、关键实现与取舍？", "question");
  assert.equal(long.nodeWidth, 220);
  assert.equal(long.nodeHeight, 104);
  assert.equal(nodeDimensions("x".repeat(500), "question").nodeHeight, 104);
});

test("long unspaced titles receive explicit bounded line breaks", () => {
  assert.equal(wrapLabel("短标题", 16), "短标题");
  const wrapped = wrapLabel("如何从概念系统架构和源码调用链完整理解小沫机器人的大模型模块并能在面试中流畅解释其设计数据流关键实现与取舍".repeat(2), 18);
  const lines = wrapped.split("\n");
  assert.equal(lines.length, 4);
  assert.ok(lines.every((line) => [...line].length <= 18));
  assert.ok(lines.at(-1).endsWith("…"));
});

test("graph styles keep labels centered, wrapped, high-contrast, and zoom-bounded", () => {
  const source = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(source, /maxZoom:\s*1\.5/);
  assert.match(source, /"text-valign":\s*"center"/);
  assert.match(source, /"text-halign":\s*"center"/);
  assert.match(source, /"text-wrap":\s*"wrap"/);
  assert.match(source, /width:\s*"data\(nodeWidth\)"/);
  assert.match(source, /height:\s*"data\(nodeHeight\)"/);
  assert.match(source, /node\[status = 'current'\][^\n]*color:\s*"#2a1712"/);
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
