export type LearningNode = { id: string; label: string; notePath: string | null; recordType: string | null; durable: boolean; active: boolean; current: boolean };
export type LearningEdge = { id: string; source: string; target: string; type: "derived-from" | "active-stack"; active: boolean };
export type StackFrame = { id: string; nodeId: string; question: string; note: string | null; whyNeeded: string | null; resume: { question: string | null; checkpoint: string | null }; depth: number };
export type LearningView = { version: number; root: { id: string | null; question: string | null }; current: null | { id: string; nodeId: string; question: string; depth: number; whyNeeded: string | null; resumeQuestion: string | null; resumeCheckpoint: string | null; notePath: string | null }; stack: StackFrame[]; graph: { nodes: LearningNode[]; edges: LearningEdge[] }; warnings: string[] };
export type Transition = { id: string; type: "DIVE" | "BACKTRACK" | "ROUTE UPDATED"; at: string; from: string | null; to: string | null };
export type ViewPayload = { view: LearningView; transitions: Transition[]; transition?: Transition | null };
