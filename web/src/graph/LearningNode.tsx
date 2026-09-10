import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LearningNode as LearningNodeData } from "../types";

export function LearningNode({ data }: NodeProps) {
  const node = data as unknown as LearningNodeData;
  return <div className={`learning-node ${node.current ? "is-current" : node.active ? "is-active" : ""} ${!node.durable ? "is-runtime" : ""}`}>
    <Handle type="target" position={Position.Left} />
    <div className="node-kicker">{node.current ? "CURRENT" : node.durable ? node.active ? "ACTIVE PATH" : "KNOWLEDGE NOTE" : "LEARNING"}</div>
    <div className="node-title">{node.label}</div>
    <div className="node-meta">{node.durable ? "saved" : "not saved yet"}</div>
    <Handle type="source" position={Position.Right} />
  </div>;
}
