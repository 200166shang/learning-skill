import dagre from "@dagrejs/dagre";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import type { LearningView, LearningNode as LearningNodeData, Transition } from "../types";
import { LearningNode } from "./LearningNode";

const nodeTypes = { learning: LearningNode };

function layout(view: LearningView): { nodes: Node[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", ranksep: 88, nodesep: 48, marginx: 32, marginy: 32 });
  for (const node of view.graph.nodes) graph.setNode(node.id, { width: 240, height: 116 });
  for (const edge of view.graph.edges) graph.setEdge(edge.source, edge.target);
  dagre.layout(graph);
  return {
    nodes: view.graph.nodes.map((node) => { const point = graph.node(node.id); return { id: node.id, type: "learning", position: { x: point.x - 120, y: point.y - 58 }, data: node }; }),
    edges: view.graph.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, className: edge.active ? "active-edge" : "durable-edge", animated: edge.active, style: { strokeWidth: edge.active ? 3 : 1.5 } })),
  };
}

function FocusController({ currentId, transition, request }: { currentId?: string; transition?: Transition | null; request: number }) {
  const flow = useReactFlow();
  useEffect(() => { if (currentId && (transition || request)) requestAnimationFrame(() => flow.fitView({ nodes: [{ id: currentId }], duration: 650, padding: 1.8, maxZoom: 1.1 })); }, [currentId, transition?.id, request, flow]);
  return null;
}

export function LearningGraph({ view, transition, focusRequest, onNode }: { view: LearningView; transition?: Transition | null; focusRequest: number; onNode: (node: LearningNodeData) => void }) {
  const elements = useMemo(() => layout(view), [view]);
  if (!elements.nodes.length) return <div className="empty-canvas"><span>NO TRACE YET</span><p>开始一个真实问题后，学习路径会在这里生长。</p></div>;
  return <ReactFlow nodes={elements.nodes} edges={elements.edges} nodeTypes={nodeTypes} fitView minZoom={0.2} maxZoom={1.6} onNodeClick={(_, node) => onNode(node.data as unknown as LearningNodeData)} proOptions={{ hideAttribution: true }}>
    <FocusController currentId={view.current?.nodeId} transition={transition} request={focusRequest} />
    <Background gap={24} size={1} color="rgba(154,190,178,.14)" />
    <MiniMap pannable zoomable nodeColor={(node) => (node.data as unknown as LearningNodeData).current ? "#ffcf5a" : (node.data as unknown as LearningNodeData).active ? "#38d5bd" : "#43534f"} maskColor="rgba(4,12,11,.74)" />
    <Controls showInteractive={false} />
  </ReactFlow>;
}
