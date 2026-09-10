import path from "node:path";
import { readLearningJourney } from "./learning-journey.mjs";
import { readLearningRecords } from "./learning-record.mjs";
import { readLearningState } from "./learning-state.mjs";

const migrationCommand = "node ~/.codex/skills/_shared/scripts/migrate-learning-journey.mjs <workspace>";

function buildJourneyGraph(stateResult, journeyResult, recordResult) {
  const warnings = [...stateResult.warnings, ...journeyResult.warnings, ...recordResult.warnings];
  const knownNotes = new Set(recordResult.records.map((record) => record.notePath));
  const activeIds = new Set(stateResult.state.focusStack.map((frame) => frame.id));
  const currentId = stateResult.state.focusStack.at(-1)?.id || null;
  const nodes = journeyResult.journey.questions.map((question) => {
    for (const noteRef of question.noteRefs) if (!knownNotes.has(noteRef)) warnings.push(`journey note not found: ${question.id} -> ${noteRef}`);
    return { id: question.id, label: question.question, question: question.question, whyNeeded: question.whyNeeded, resumeCheckpoint: question.resumeCheckpoint, notePaths: question.noteRefs, notePath: question.noteRefs[0] || null, durable: question.noteRefs.length > 0, active: activeIds.has(question.id), current: question.id === currentId };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = journeyResult.journey.questions.flatMap((question) => question.parentId && nodeIds.has(question.parentId)
    ? [{ id: `${question.parentId}|${question.id}|journey`, source: question.parentId, target: question.id, type: "journey", active: activeIds.has(question.parentId) && activeIds.has(question.id) }]
    : []);
  const stack = stateResult.state.focusStack.map((frame, index) => {
    if (!nodeIds.has(frame.id)) warnings.push(`active frame missing from journey: ${frame.id}`);
    return { ...frame, nodeId: frame.id, depth: index + 1 };
  });
  return { nodes, edges, stack, activePath: stack.map((frame) => frame.id), current: stack.at(-1) || null, warnings };
}

export function buildLearningGraph(workspace) {
  const root = path.resolve(workspace);
  const stateResult = readLearningState(root);
  const journeyResult = readLearningJourney(root);
  const recordResult = readLearningRecords(root);
  const graph = journeyResult.exists
    ? buildJourneyGraph(stateResult, journeyResult, recordResult)
    : { nodes: [], edges: [], stack: [], activePath: [], current: null, warnings: [...stateResult.warnings, ...recordResult.warnings] };
  if (!journeyResult.exists && (stateResult.state.focusStack.length > 0 || recordResult.records.length > 0)) {
    graph.warnings.push(`migration required: .learning/journey.yaml is missing; run ${migrationCommand}`);
  }
  if (graph.nodes.length === 0 && graph.stack.length === 0) graph.warnings.push("empty workspace");
  return { ...graph, source: "journey", journey: journeyResult.journey, state: stateResult.state, records: recordResult.records, warnings: [...new Set(graph.warnings)] };
}
