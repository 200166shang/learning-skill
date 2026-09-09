---
name: learning-synthesis
description: Own an explicitly selected or routed topic-centered learning workflow for framing, drafting, gap capture, integration, knowledge-lineage views, or resume from user-confirmed questions, materials, maps, and knowledge tickets.
---

# Learning Synthesis

Own one topic workspace: its Goal, Learning Map, synthesis mother document, pending-work Tickets, durable LearningRecords, and topic decisions/indexes.

Read [LearningSynthesisState](../_shared/learning-synthesis-state.md) for persisted topic memory. Choose exactly one mode, load that mode's reference plus only the shared contracts it points to, and follow its `Done when` boundary.

## Workspace

Resolve the workspace from, in order: the directory containing a supplied `learning.yaml`, the directory containing a supplied mother document, or an explicit workspace. Keep topic artifacts in that resolved workspace. If none is known, ask where the topic workspace belongs before writing.

## Modes

| Mode | Use when | Reference |
| --- | --- | --- |
| `start` | Goal or initial Map is vague/unconfirmed. | [Start / frame](references/start.md) |
| `draft` | Create/update/revise the synthesis-owned mother document. | [Draft](references/draft.md) |
| `capture gaps` | Reconcile surfaced questions or formalize accepted pending learning work. | [Capture gaps](references/capture-gaps.md) |
| `integrate` | Incorporate a valid LearningRecord or reconcile a prior integration after Record revision. | [Integrate](references/integrate.md) |
| `lineage` | Show/refresh how durable Records grew from one another. | [Knowledge lineage views](references/knowledge-lineage.md) |
| `status` | Reconcile artifacts and derive the current situation/next recommendation without executing it. | [Status / resume](references/status.md) |

`integrate` may also read the lineage reference when it needs the shared Map-attachment/derived-view rendering rules.

## Cross-mode invariants

The Learning Map is the topic's human-readable **learning-decision/question-lineage** view. Formal nodes come only from questions the user asked or explicitly chose to pursue; it is not a generated curriculum or general knowledge graph.

Map markers have stable meanings:

- `[ ]` — confirmed question with no accepted partial result;
- `[~]` — an accepted covered portion plus a concrete residual gap;
- `[x]` — complete under the [state completion contract](../_shared/learning-synthesis-state.md#map-completion-contract);
- `[-]` — explicitly excluded from the selected scope.

Every trusted `[~]` can explain both what is covered and what remains. Every `[x]` has matching `map_completions` provenance. The mode references own how questions are proposed, reconciled, promoted, completed, attached to Records, or rendered as knowledge lineage.

Use one source of truth per durable concept:

- [KnowledgeTicket](../_shared/knowledge-ticket.md) owns one accepted gap's worker contract and lifecycle;
- [LearningRecord](../_shared/learning-record.md) owns durable knowledge, evidence obligations, revision identity, and canonical Record-to-Record lineage;
- [LearningSynthesisState](../_shared/learning-synthesis-state.md) owns non-derivable topic decisions/indexes and Map completion provenance;
- `knowledge-lineage.md` and Map Record links are derived learner-facing views under the [lineage reference](references/knowledge-lineage.md).

## Ownership and phase boundaries

Synthesis owns topic structure, accepted-gap capture, mother-document drafting, integration, and derived topic views. It stops before producer work: conceptual Ticket execution belongs to `learning-note`; code Ticket execution belongs to direct Codex under the Ticket contract. A producer's valid LearningRecord is the handoff back into synthesis integration.

The synthesis mother document is itself `record_type: synthesis`; its create/revise behavior is co-located in `draft`. Child LearningRecords remain owned by their producer class; synthesis only consumes/reconciles them through `integrate` and derived views.

One invocation completes one selected mode and stops at that mode's `Done when` boundary. Validation and external publication are separate workflows.

The selected topic scope is complete when the mother document is coherent and every required confirmed Map node is either excluded or has valid completion provenance. Ticket lifecycle, Record count, or lineage rendering alone never establishes topic completion.
