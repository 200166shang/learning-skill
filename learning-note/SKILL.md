---
name: learning-note
description: Produce or revise a durable conceptual LearningRecord when the learner wants preserved knowledge, supplies an existing conceptual Record for adjustment, or a concept/evidence Ticket routes completed work here.
---

# Learning Note

Own conceptual `record_type: note` LearningRecords. Read the shared [LearningRecord contract](../_shared/learning-record.md), choose one branch, then load only that branch reference.

| Branch | Use when | Reference |
| --- | --- | --- |
| `Resolve` | A supplied `concept` KnowledgeTicket still represents pending conceptual work. | [Resolve](references/resolve.md) |
| `Materialize` | The learning result already exists and should become durable knowledge, standalone or as the completed result of one `evidence` Ticket. | [Materialize](references/materialize.md) |
| `Revise` | An existing conceptual LearningRecord should be adjusted in place. | [Revise](references/revise.md) |

## Cross-branch boundaries

- Produce/preserve exactly one `record_type: note` artifact under the shared LearningRecord contract.
- Keep verified evidence, inference, and unresolved assumptions distinguishable.
- Create `derived-from` only from explicit/supported learner provenance; the shared Record contract owns the canonical relation and reader-facing lineage rules.
- Real file/function/caller/runtime/data-flow tracing and revision of source-backed `code-walkthrough` Records belong to direct Codex.
- External publication belongs to its destination workflow.
- Mother-document integration belongs to `learning-synthesis`.

A Ticket is required only when pending work actually exists; Materialize and Revise operate directly on already-existing knowledge/artifacts.

Done when the selected branch reaches its own completion gate and returns exactly one contract-valid conceptual LearningRecord at its ownership boundary.