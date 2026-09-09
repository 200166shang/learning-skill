---
name: learning-note
description: Produce or revise a durable, reusable conceptual LearningRecord when the user explicitly wants preserved learning content, supplies an existing conceptual Record for adjustment, or a concept/evidence KnowledgeTicket routes completed work here.
---

# Learning Note

Own conceptual `record_type: note` LearningRecords. This skill may resolve a pending concept Ticket, materialize learning that is already complete, or revise an existing conceptual Record. Do not require a KnowledgeTicket merely to justify an existing result or revision.

Before producing or revising a result, read the shared [LearningRecord contract](../_shared/learning-record.md). Choose exactly one branch, then read only that branch reference and the shared contracts it requires.

## Choose one branch

| Branch | Use when | Instructions |
| --- | --- | --- |
| `Resolve` | A supplied `concept` KnowledgeTicket still represents pending conceptual work. | [Resolve](references/resolve.md) |
| `Materialize` | The learning result is already complete and should be preserved, either standalone or as the completed external result of one existing unresolved `evidence` Ticket. | [Materialize](references/materialize.md) |
| `Revise` | An existing `record_type: note` LearningRecord should be adjusted in place. | [Revise](references/revise.md) |

After selecting the branch, follow only that reference until its `Done when` condition is satisfied. Do not load another branch reference unless the user explicitly starts a separate operation.

## Common ownership boundaries

- Emit or preserve `record_type: note`; branch selection never changes the body into a fixed template.
- Keep verified evidence, inference, and unresolved assumptions distinguishable.
- A request centered on tracing real files, functions, callers, runtime state, or repository data flow belongs to direct Codex source investigation, not this skill.
- Revision of a source-backed or `code-walkthrough` Record also belongs to direct Codex under the shared LearningRecord revision contract.
- Do not create or update Feishu, Obsidian, GitHub, or another external store.
- Do not integrate a produced Record into a mother document; integration belongs to `learning-synthesis`.

Completion criterion: the selected branch reaches its own `Done when` condition and returns exactly one contract-valid conceptual LearningRecord without crossing another ownership boundary.
