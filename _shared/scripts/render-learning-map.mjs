#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildLearningGraph } from "../lib/learning-graph.mjs";

const mermaidId = (id) => id.replaceAll(":", "_");
const escapeMermaid = (value) => String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", " ");
const escapeMarkdown = (value) => String(value).replaceAll("[", "\\[").replaceAll("]", "\\]");

function mermaid(graph) {
  const lines = ["flowchart LR", ""];
  if (!graph.nodes.length) lines.push('    EMPTY["暂无已记录的学习问题"]');
  for (const node of graph.nodes) lines.push(`    ${mermaidId(node.id)}["${escapeMermaid(node.current ? `▶ ${node.label}` : node.label)}"]`);
  if (graph.nodes.length) lines.push("");
  for (const edge of graph.edges) lines.push(`    ${mermaidId(edge.source)} --> ${mermaidId(edge.target)}`);
  const active = graph.nodes.filter((node) => node.active && !node.current);
  const current = graph.nodes.filter((node) => node.current);
  if (active.length) lines.push("", `    class ${active.map((node) => mermaidId(node.id)).join(",")} active`);
  if (current.length) lines.push(`    class ${current.map((node) => mermaidId(node.id)).join(",")} current`);
  lines.push("", "    classDef active stroke:#178f83,stroke-width:2px", "    classDef current fill:#d9fff5,stroke:#0b6b61,stroke-width:3px", "");
  return lines.join("\n");
}

function activePath(graph) {
  if (!graph.stack.length) return "当前没有挂起的递归学习路径。";
  return graph.stack.map((frame, index) => index === graph.stack.length - 1 ? `**${escapeMarkdown(frame.question)}** ← 当前` : escapeMarkdown(frame.question)).join("\n→ ");
}

function lineage(graph) {
  if (!graph.nodes.length) return "当前还没有已记录的问题脉络。";
  const children = new Map();
  const incoming = new Set();
  for (const edge of graph.edges.filter((item) => item.type === "journey" || item.type === "derived-from")) {
    children.set(edge.source, [...(children.get(edge.source) || []), edge.target]);
    incoming.add(edge.target);
  }
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const rendered = new Set();
  const lines = [];
  const visit = (id, depth, ancestry) => {
    const node = nodes.get(id);
    if (!node || ancestry.has(id)) return;
    const suffix = node.current ? " → 当前学习中" : node.active ? " → 学习中" : "";
    const label = escapeMarkdown(node.label);
    const legacyLabel = graph.source === "legacy-derived-from" && node.notePath ? `[${label}](${encodeURI(node.notePath)})` : label;
    const references = graph.source === "journey" && node.notePaths?.length ? ` ${node.notePaths.map((notePath) => `[知识笔记](${encodeURI(notePath)})`).join(" ")}` : "";
    lines.push(`${"  ".repeat(depth)}- ${legacyLabel}${references}${suffix}`);
    rendered.add(id);
    const next = new Set(ancestry).add(id);
    for (const child of children.get(id) || []) visit(child, depth + 1, next);
  };
  for (const node of graph.nodes.filter((item) => !incoming.has(item.id))) visit(node.id, 0, new Set());
  for (const node of graph.nodes) if (!rendered.has(node.id)) visit(node.id, 0, new Set());
  return lines.join("\n");
}

export function renderLearningMap(workspace) {
  const root = path.resolve(workspace);
  mkdirSync(root, { recursive: true });
  const graph = buildLearningGraph(root);
  for (const warning of graph.warnings.filter((message) => message !== "empty workspace" && !message.startsWith("active frame has no KnowledgeNote"))) process.stdout.write(`warning: ${warning}\n`);
  const mmd = mermaid(graph);
  const markdown = `# Learning Map\n\n> 这张图记录实际发生过的理解路径，而不是预生成课程。\n\n## 理解图谱\n\n\`\`\`mermaid\n${mmd.trimEnd()}\n\`\`\`\n\n## 当前理解路径\n\n${activePath(graph)}\n\n## 问题脉络\n\n${lineage(graph)}\n`;
  writeFileSync(path.join(root, "learning-map.mmd"), mmd);
  writeFileSync(path.join(root, "learning-map.md"), markdown);
  process.stdout.write(`rendered: ${path.join(root, "learning-map.md")}\nrendered: ${path.join(root, "learning-map.mmd")}\n`);
}

const workspaceArgument = process.argv[2];
if (!workspaceArgument) {
  process.stderr.write("usage: node render-learning-map.mjs <workspace>\n");
  process.exitCode = 2;
} else renderLearningMap(workspaceArgument);
