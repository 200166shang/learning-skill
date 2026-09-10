import { buildLearningGraph } from "./learning-graph.mjs";

export function buildLearningView(workspace) {
  const model = buildLearningGraph(workspace);
  const current = model.current;
  return {
    version: 1,
    root: { id: model.state.rootQuestion.id, question: model.state.rootQuestion.question },
    current: current ? { id: current.id, nodeId: current.nodeId, question: current.question, depth: current.depth, whyNeeded: current.whyNeeded, resumeQuestion: current.resume.question, resumeCheckpoint: current.resume.checkpoint, notePath: model.nodes.find((node) => node.id === current.nodeId)?.notePath || null } : null,
    stack: model.stack,
    graph: { nodes: model.nodes, edges: model.edges },
    warnings: model.warnings,
  };
}
