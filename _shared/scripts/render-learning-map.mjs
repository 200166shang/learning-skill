#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

function warn(message) {
  process.stdout.write(`warning: ${message}\n`);
}

function scalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function frontmatter(markdown, source) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) {
    warn(`malformed KnowledgeNote frontmatter: ${source}`);
    return null;
  }

  const lines = match[1].split(/\r?\n/);
  const data = { relations: [] };
  let relation = null;
  let inRelations = false;
  for (const line of lines) {
    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (top) {
      inRelations = top[1] === "relations";
      relation = null;
      if (!inRelations) data[top[1]] = scalar(top[2]);
      continue;
    }
    if (!inRelations) continue;
    const item = line.match(/^\s*-\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) {
      relation = { [item[1]]: scalar(item[2]) };
      data.relations.push(relation);
      continue;
    }
    const field = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field && relation) relation[field[1]] = scalar(field[2]);
  }
  return data;
}

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory).sort()) {
    const absolute = path.join(directory, entry);
    const stats = statSync(absolute);
    if (stats.isDirectory()) result.push(...markdownFiles(absolute));
    else if (stats.isFile() && entry.endsWith(".md")) result.push(absolute);
  }
  return result;
}

function stateStack(statePath) {
  if (!existsSync(statePath)) return [];
  const lines = readFileSync(statePath, "utf8").split(/\r?\n/);
  const stack = [];
  let inStack = false;
  let frame = null;
  for (const line of lines) {
    if (/^focus_stack:\s*$/.test(line)) {
      inStack = true;
      continue;
    }
    if (inStack && /^\S/.test(line)) break;
    if (!inStack) continue;
    const item = line.match(/^\s{2}-\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) {
      frame = { [item[1]]: scalar(item[2]) };
      stack.push(frame);
      continue;
    }
    const field = line.match(/^\s{4}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field && frame) frame[field[1]] = scalar(field[2]);
  }
  return stack.filter((frame) => frame.question);
}

function normalizeRef(workspace, notePath, ref) {
  const workspaceCandidate = path.resolve(workspace, ref);
  const noteCandidate = path.resolve(path.dirname(notePath), ref);
  if (existsSync(workspaceCandidate)) return workspaceCandidate;
  if (existsSync(noteCandidate)) return noteCandidate;
  return workspaceCandidate;
}

function keyForPath(workspace, absolute) {
  return path.relative(workspace, absolute).split(path.sep).join("/");
}

function nodeId(key) {
  return `N${createHash("sha1").update(key).digest("hex").slice(0, 10)}`;
}

function escapeMermaid(label) {
  return label.replaceAll("\\", "\\\\").replaceAll('"', "\\\"").replaceAll("\n", " ");
}

function escapeMarkdown(label) {
  return label.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function sameQuestion(left, right) {
  const normalize = (text) => String(text ?? "").trim().replace(/[？?。.!！]+$/u, "");
  return normalize(left) === normalize(right);
}

function hasCycle(nodes, edges) {
  const children = new Map();
  for (const [parent, child] of edges) {
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(child);
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(key) {
    if (visiting.has(key)) return true;
    if (visited.has(key)) return false;
    visiting.add(key);
    for (const child of children.get(key) ?? []) if (visit(child)) return true;
    visiting.delete(key);
    visited.add(key);
    return false;
  }
  return [...nodes.keys()].some(visit);
}

function buildGraph(workspace) {
  const nodes = new Map();
  const durableEdges = [];
  const notePaths = markdownFiles(path.join(workspace, "notes"));
  for (const absolute of notePaths) {
    const relative = keyForPath(workspace, absolute);
    const metadata = frontmatter(readFileSync(absolute, "utf8"), relative);
    if (!metadata?.title) {
      if (metadata) warn(`KnowledgeNote missing title: ${relative}`);
      continue;
    }
    nodes.set(relative, { key: relative, label: metadata.title, path: relative, active: false, current: false });
    for (const relation of metadata.relations) {
      if (relation.type !== "derived-from") continue;
      if (!relation.ref) {
        warn(`invalid derived-from relation skipped: ${relative}`);
        continue;
      }
      const parentAbsolute = normalizeRef(workspace, absolute, relation.ref);
      const parent = keyForPath(workspace, parentAbsolute);
      durableEdges.push([parent, relative, relation.ref]);
    }
  }

  const validEdges = [];
  for (const [parent, child, originalRef] of durableEdges) {
    if (!nodes.has(parent)) {
      warn(`derived-from target not found: ${originalRef}`);
      continue;
    }
    validEdges.push([parent, child]);
  }

  const stack = stateStack(path.join(workspace, ".learning", "state.yaml"));
  const activeKeys = [];
  for (const [index, frame] of stack.entries()) {
    let key = null;
    if (frame.note) {
      const candidate = keyForPath(workspace, path.resolve(workspace, frame.note));
      if (nodes.has(candidate)) key = candidate;
    }
    if (!key) key = [...nodes.values()].find((node) => sameQuestion(node.label, frame.question))?.key;
    if (!key) {
      key = `active:${frame.id || createHash("sha1").update(frame.question).digest("hex").slice(0, 10)}`;
      nodes.set(key, { key, label: frame.question, path: null, active: true, current: false });
    }
    const node = nodes.get(key);
    node.active = true;
    node.current = index === stack.length - 1;
    activeKeys.push(key);
  }

  const activeEdges = [];
  for (let index = 1; index < activeKeys.length; index += 1) {
    const edge = [activeKeys[index - 1], activeKeys[index]];
    if (!validEdges.some(([parent, child]) => parent === edge[0] && child === edge[1])) activeEdges.push(edge);
  }
  if (hasCycle(nodes, validEdges)) warn("derived-from relation cycle detected; rendering finite graph");
  return { nodes, durableEdges: validEdges, activeEdges, stack, activeKeys };
}

function mermaid(graph) {
  const lines = ["flowchart TD", ""];
  if (graph.nodes.size === 0) lines.push('    EMPTY["暂无已记录的学习问题"]');
  for (const node of graph.nodes.values()) {
    const prefix = node.current ? "▶ " : "";
    lines.push(`    ${nodeId(node.key)}["${escapeMermaid(prefix + node.label)}"]`);
  }
  if (graph.nodes.size > 0) lines.push("");
  for (const [parent, child] of [...graph.durableEdges, ...graph.activeEdges]) {
    lines.push(`    ${nodeId(parent)} --> ${nodeId(child)}`);
  }
  const active = [...graph.nodes.values()].filter((node) => node.active && !node.current);
  const current = [...graph.nodes.values()].filter((node) => node.current);
  if (active.length) lines.push("", `    class ${active.map((node) => nodeId(node.key)).join(",")} active`);
  if (current.length) lines.push(`    class ${current.map((node) => nodeId(node.key)).join(",")} current`);
  lines.push("", "    classDef active stroke:#2563eb,stroke-width:2px", "    classDef current fill:#dbeafe,stroke:#1d4ed8,stroke-width:3px", "");
  return lines.join("\n");
}

function lineageMarkdown(graph) {
  if (graph.nodes.size === 0) return "当前还没有已记录的问题脉络。";
  const children = new Map();
  const incoming = new Set();
  for (const [parent, child] of graph.durableEdges) {
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(child);
    incoming.add(child);
  }
  const roots = [...graph.nodes.keys()].filter((key) => !incoming.has(key));
  const rendered = new Set();
  const lines = [];
  function visit(key, depth, ancestry) {
    const node = graph.nodes.get(key);
    if (!node || ancestry.has(key)) return;
    const suffix = node.current ? " → 当前学习中" : node.active && !node.path ? " → 学习中" : "";
    const label = escapeMarkdown(node.label);
    const content = node.path ? `[${label}](${encodeURI(node.path)})${suffix}` : `${label}${suffix}`;
    lines.push(`${"  ".repeat(depth)}- ${content}`);
    rendered.add(key);
    const nextAncestry = new Set(ancestry).add(key);
    for (const child of children.get(key) ?? []) visit(child, depth + 1, nextAncestry);
  }
  for (const root of roots) visit(root, 0, new Set());
  for (const key of graph.nodes.keys()) if (!rendered.has(key)) visit(key, 0, new Set());
  return lines.join("\n");
}

function activePathMarkdown(graph) {
  if (graph.stack.length === 0) return "当前没有挂起的递归学习路径。";
  return graph.stack.map((frame, index) => {
    const label = escapeMarkdown(frame.question);
    return index === graph.stack.length - 1 ? `**${label}** ← 当前` : label;
  }).join("\n→ ");
}

function render(workspace) {
  mkdirSync(workspace, { recursive: true });
  const graph = buildGraph(workspace);
  const mmd = mermaid(graph);
  const markdown = `# Learning Map

> 这张图记录实际发生过的理解路径，而不是预生成课程。

## 理解图谱

\`\`\`mermaid
${mmd.trimEnd()}
\`\`\`

## 当前理解路径

${activePathMarkdown(graph)}

## 问题脉络

${lineageMarkdown(graph)}
`;
  writeFileSync(path.join(workspace, "learning-map.mmd"), mmd);
  writeFileSync(path.join(workspace, "learning-map.md"), markdown);
  process.stdout.write(`rendered: ${path.join(workspace, "learning-map.md")}\n`);
  process.stdout.write(`rendered: ${path.join(workspace, "learning-map.mmd")}\n`);
}

const workspaceArgument = process.argv[2];
if (!workspaceArgument) {
  process.stderr.write("usage: node render-learning-map.mjs <workspace>\n");
  process.exitCode = 2;
} else {
  render(path.resolve(workspaceArgument));
}
