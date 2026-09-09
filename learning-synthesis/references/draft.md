# Draft

Before drafting, read [LearningRecord](../../_shared/learning-record.md). Use [LearningSynthesisState](../../_shared/learning-synthesis-state.md) for project decisions and indexes; load the KnowledgeTicket contract only for a separate ticket operation.

Require a confirmed Map. Inventory how existing materials support its nodes, then create or update one publishable mother-document LearningRecord with `record_type: synthesis`. Organize it around the central question, not source order or a list of technologies. Keep prerequisites minimal and distinguish evidence, inference, and unresolved gaps. The mother-document artifact itself records that drafting has occurred; no separate draft/stage cache is needed.

When the user asks to revise an existing synthesis-owned mother document, revise that same LearningRecord in place under the shared revision contract. Preserve still-correct synthesis content and artifact identity; this edit stays in `draft` rather than creating a Ticket or duplicate Record.

Done when the mother document is independently readable, uses `record_type: synthesis`, follows one coherent central thread over the currently selected Map scope, uses available material for the claims it supports, and leaves unresolved gaps explicit rather than silently filling them. A revision completes at the same durable mother-document path.
