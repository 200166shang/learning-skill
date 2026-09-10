import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { normalizeNotePath, readLearningRecords } from "./learning-record.mjs";
import { readLearningState } from "./learning-state.mjs";

const stableNoteId = (notePath) => `note:${createHash("sha1").update(notePath).digest("hex").slice(0, 12)}`;
const comparable = (value) => String(value ?? "").trim().replace(/[？?。.!！]+$/u, "");

function relationPath(workspace, record, ref) {
  const fromWorkspace = path.resolve(workspace, ref);
  const absolute = existsSync(fromWorkspace) ? fromWorkspace : path.resolve(path.dirname(record.absolutePath), ref);
  return normalizeNotePath(workspace, absolute);
}

function cycleExists(nodeIds, edges) {
  const children = new Map();
  for (const edge of edges) children.set(edge.source, [...(children.get(edge.source) || []), edge.target]);
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if ((children.get(id) || []).some(visit)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return [...nodeIds].some(visit);
}

export function buildLearningGraph(workspace) {
  const root = path.resolve(workspace);
  const stateResult = readLearningState(root);
  const recordResult = readLearningRecords(root);
  const warnings = [...stateResult.warnings, ...recordResult.warnings];
  const nodesById = new Map();
  const noteIdByPath = new Map();
  const titleIds = new Map();
  for (const record of recordResult.records) {
    const id = stableNoteId(record.notePath);
    noteIdByPath.set(record.notePath, id);
    titleIds.set(comparable(record.title), [...(titleIds.get(comparable(record.title)) || []), id]);
    nodesById.set(id, { id, label: record.title, notePath: record.notePath, recordType: record.recordType, durable: true, active: false, current: false });
  }

  const edges = [];
  const edgeKeys = new Set();
  for (const record of recordResult.records) {
    const target = noteIdByPath.get(record.notePath);
    for (const relation of record.relations) {
      if (!relation || typeof relation !== "object") { warnings.push(`malformed relation: ${record.notePath}`); continue; }
      if (relation.type !== "derived-from") continue;
      if (!relation.ref || typeof relation.ref !== "string") { warnings.push(`invalid derived-from relation skipped: ${record.notePath}`); continue; }
      const source = noteIdByPath.get(relationPath(root, record, relation.ref));
      if (!source) { warnings.push(`derived-from target not found: ${relation.ref}`); continue; }
      const key = `${source}|${target}|derived-from`;
      if (edgeKeys.has(key)) { warnings.push(`duplicate relation: ${record.notePath} -> ${relation.ref}`); continue; }
      edgeKeys.add(key);
      edges.push({ id: key, source, target, type: "derived-from", active: false });
    }
  }

  const stack = [];
  for (const [index, frame] of stateResult.state.focusStack.entries()) {
    let nodeId = frame.note ? noteIdByPath.get(normalizeNotePath(root, path.resolve(root, frame.note))) : null;
    if (frame.note && !nodeId) warnings.push(`stack note path not found: ${frame.note}`);
    if (!nodeId) {
      const matching = titleIds.get(comparable(frame.question)) || [];
      if (matching.length === 1) nodeId = matching[0];
    }
    if (!nodeId) {
      nodeId = `active:${frame.id}`;
      nodesById.set(nodeId, { id: nodeId, label: frame.question, notePath: null, recordType: null, durable: false, active: true, current: false });
      warnings.push(`active frame has no KnowledgeNote: ${frame.question}`);
    }
    const node = nodesById.get(nodeId);
    node.active = true;
    node.current = index === stateResult.state.focusStack.length - 1;
    if (node.durable && comparable(node.label) !== comparable(frame.question)) warnings.push(`stack question differs from note title: ${frame.question}`);
    stack.push({ ...frame, nodeId, depth: index + 1 });
  }
  for (let index = 1; index < stack.length; index += 1) {
    const source = stack[index - 1].nodeId;
    const target = stack[index].nodeId;
    const existing = edges.find((edge) => edge.source === source && edge.target === target);
    if (existing) existing.active = true;
    else edges.push({ id: `${source}|${target}|active-stack`, source, target, type: "active-stack", active: true });
  }
  if (cycleExists(nodesById.keys(), edges.filter((edge) => edge.type === "derived-from"))) warnings.push("derived-from relation cycle detected; rendering finite graph");
  if (nodesById.size === 0 && stack.length === 0) warnings.push("empty workspace");
  return { nodes: [...nodesById.values()], edges, stack, activePath: stack.map((frame) => frame.nodeId), current: stack.at(-1) || null, state: stateResult.state, records: recordResult.records, warnings: [...new Set(warnings)] };
}
