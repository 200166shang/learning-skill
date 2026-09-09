---
name: learning-synthesis
description: Own an explicitly selected or routed topic-centered learning workflow for framing, drafting, gap capture, integration, or resume from user-confirmed questions, materials, maps, and knowledge tickets.
---

# Learning Synthesis

Own one learning project's Goal, Learning Map, mother document, KnowledgeTickets, LearningRecords, and integration state. The Learning Map is a learning-decision map: it records questions the user asked or explicitly chose to pursue, not an AI-generated curriculum.

Read [LearningSynthesisState](../_shared/learning-synthesis-state.md) before resolving or writing project state. Choose exactly one active mode, then read only that mode's reference and the shared contracts it requires.

## Resolve the workspace

Use, in order: the directory containing a supplied `learning.yaml`; the directory containing a supplied mother document; an explicit workspace. If none is available, ask where to create the topic workspace before writing. Never publish, move existing notes, or scan unrelated knowledge stores implicitly.

## Choose one mode

| Mode | Use when | Instructions |
| --- | --- | --- |
| `start` | The topic, Goal, or initial map is vague or unconfirmed. | [Start / frame](references/start.md) |
| `draft` | The map is confirmed and the synthesis-owned mother document should be created, updated, or revised in place. | [Draft](references/draft.md) |
| `capture gaps` | The user has identified, accepted, or surfaced one or more questions that must be reconciled before new learning work is formalized. | [Capture gaps](references/capture-gaps.md) |
| `integrate` | A valid LearningRecord should be incorporated, or a previously integrated Record should be minimally reconciled after producer revision. | [Integrate](references/integrate.md) |
| `status` | The project state should be reconciled or the next action should be identified without executing it. | [Status / resume](references/status.md) |

After selecting the mode, read that reference and follow it until its `Done when` condition is satisfied. Do not load another mode's reference unless the user explicitly starts a separate operation.

## Map rules

The map is the single persistent human-readable learning-decision and question-lineage view for the topic, not merely the document table of contents, a per-article question index, or a complete subject taxonomy. Formal nodes come only from a user question the user chooses to pursue or an explicit user acceptance of an AI candidate; use stable node identifiers in tickets and mark nodes as unhandled `[ ]`, partial `[~]`, complete `[x]`, or excluded `[-]`.

When a new formal question materially extends an existing confirmed question, place it under the closest relevant confirmed parent in the Map so recursive learning lineage remains visible there. Do not create a second article-specific question tree or a new persistent knowledge object merely to record where questions came from.

Use the [LearningSynthesisState](../_shared/learning-synthesis-state.md) map completion contract for every `[x]`. Never mark a node complete solely because conversation history, memory, or available materials suggest prior understanding. A prior note, external document, integrated ticket result, standalone LearningRecord, or explicit user confirmation may satisfy the node only after its completion basis is recorded in `learning.yaml` with the node id and supporting provenance. Treat an `[x]` without completion provenance as an inconsistency, not as completed work.

A LearningRecord never creates a Map node by itself. When a standalone Record is integrated as supplemental knowledge, leave the Map unchanged. Only map it to completion when the user explicitly accepts it as sufficient evidence for an existing confirmed node.

At a natural stopping point, the model may recommend at most three directly relevant candidate questions. Keep those AI recommendations outside the formal tree and tickets, for example in `learning.yaml`'s `candidate_questions`; explain why each would help. The limit does not truncate questions the user independently surfaces while reading. Reconcile every user-surfaced question before promotion, and formalize only those the user chooses to pursue. Keep important scope decisions in the map; keep machine paths and lifecycle state in YAML.

## Ownership boundaries

- A conceptual ticket is resolved by reading and following `learning-note`.
- A source execution ticket is resolved by a Codex agent directly investigating the listed repository material under its ticket contract.
- Resolving a Ticket produces exactly one LearningRecord and may mark the Ticket `resolved`; it never integrates it.
- A LearningRecord does not require a KnowledgeTicket. Already-resolved learning may be materialized directly into a durable Record and later integrated without creating a retroactive Ticket.
- The mother document is the LearningRecord produced and owned by `learning-synthesis` (`record_type: synthesis`). When the user asks to revise that mother document, stay in `draft`, edit the same artifact in place under the shared LearningRecord revision contract, preserve still-correct synthesis content, and do not create a Ticket or duplicate Record merely for the edit.
- Revision of any integrated child LearningRecord remains with that child Record's producer class. `learning-synthesis` does not rewrite integrated child Records; after producer revision, it only reconciles the topic's existing integration when the user asks.
- Integration consumes a valid LearningRecord. Ticket lifecycle is updated only when that Record came from the supplied Ticket.
- Prefer assigning a self-contained accepted ticket to a child agent when delegation is available and the work can proceed independently. For a code ticket, give that agent the ticket and its listed materials; it selects the investigation method from the question rather than following a fixed source-reading skill. The parent recovers the resulting LearningRecord and lifecycle change rather than the research transcript. Resolve inline only when delegation is unavailable or the task is too small to justify a handoff.
- Interview prompts, open gaps, material inventories, future enhancements, and next actions belong in the map, state, or tickets—not the mother-document body.
- Validation and publication are outside this workflow.

Project completion means the mother document has a coherent central thread and every required confirmed map node is excluded or has valid completion provenance; ticket lifecycle alone is not sufficient. Any individual invocation stops when its active mode's `Done when` condition is satisfied; new gaps may reopen `filling` later.
