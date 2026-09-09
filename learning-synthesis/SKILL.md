---
name: learning-synthesis
description: Own an explicitly selected or routed topic-centered learning workflow for framing, drafting, gap capture, integration, or resume from user-confirmed questions, materials, maps, and knowledge tickets.
---

# Learning Synthesis

Own one learning project's Goal, Learning Map, mother document, KnowledgeTickets, and integration state. The Learning Map is a learning-decision map: it records questions the user asked or explicitly chose to pursue, not an AI-generated curriculum.

Read [LearningSynthesisState](../_shared/learning-synthesis-state.md) before resolving or writing project state. Choose exactly one active mode, then read only that mode's reference and the shared contracts it requires.

## Resolve the workspace

Use, in order: the directory containing a supplied `learning.yaml`; the directory containing a supplied mother document; an explicit workspace. If none is available, ask where to create the topic workspace before writing. Never publish, move existing notes, or scan unrelated knowledge stores implicitly.

## Choose one mode

| Mode | Use when | Instructions |
| --- | --- | --- |
| `start` | The topic, Goal, or initial map is vague or unconfirmed. | [Start / frame](references/start.md) |
| `draft` | The map is confirmed and the mother document should be created or updated. | [Draft](references/draft.md) |
| `capture gaps` | The user has identified or accepted a gap that should become a reusable record or ticket. | [Capture gaps](references/capture-gaps.md) |
| `integrate` | A resolved ticket result should be minimally incorporated into the mother document. | [Integrate](references/integrate.md) |
| `status` | The project state should be reconciled or the next action should be identified without executing it. | [Status / resume](references/status.md) |

After selecting the mode, read that reference and follow it until its `Done when` condition is satisfied. Do not load another mode's reference unless the user explicitly starts a separate operation.

## Map rules

The map is a human-readable learning-decision tree, not merely the document table of contents or a complete subject taxonomy. Formal nodes come only from a user question or an explicit user acceptance of a candidate; use stable node identifiers in tickets and mark nodes as unhandled `[ ]`, partial `[~]`, complete `[x]`, or excluded `[-]`.

Use the [LearningSynthesisState](../_shared/learning-synthesis-state.md) map completion contract for every `[x]`. Never mark a node complete solely because conversation history, memory, or available materials suggest prior understanding. A prior note, external document, integrated ticket result, or explicit user confirmation may satisfy the node only after its completion basis is recorded in `learning.yaml` with the node id and supporting provenance. Treat an `[x]` without completion provenance as an inconsistency, not as completed work.

At a natural stopping point, recommend at most three directly relevant candidate questions. Keep them outside the formal tree and tickets, for example in `learning.yaml`'s `candidate_questions`; explain why each would help. Promote one only after the user chooses it. Keep important scope decisions in the map; keep machine paths and lifecycle state in YAML.

## Ownership boundaries

- A conceptual ticket is resolved by reading and following `learning-note`.
- A source execution ticket is resolved by a Codex agent directly investigating the listed repository material under its ticket contract.
- Resolving a ticket produces one LearningRecord and may mark the ticket `resolved`; it never integrates it.
- Prefer assigning a self-contained accepted ticket to a child agent when delegation is available and the work can proceed independently. For a code ticket, give that agent the ticket and its listed materials; it selects the investigation method from the question rather than following a fixed source-reading skill. The parent recovers the resulting LearningRecord and lifecycle change rather than the research transcript. Resolve inline only when delegation is unavailable or the task is too small to justify a handoff.
- Interview prompts, open gaps, material inventories, future enhancements, and next actions belong in the map, state, or tickets—not the mother-document body.
- Validation and publication are outside this workflow.

Project completion means the mother document has a coherent central thread and every required confirmed map node is excluded or has valid completion provenance; ticket lifecycle alone is not sufficient. Any individual invocation stops when its active mode's `Done when` condition is satisfied; new gaps may reopen `filling` later.
