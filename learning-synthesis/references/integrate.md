# Integrate

Before integrating, read [LearningRecord](../../_shared/learning-record.md) and [LearningSynthesisState](../../_shared/learning-synthesis-state.md). Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when the LearningRecord is the result of a supplied Ticket.

Use this mode either to integrate a valid completed LearningRecord for the first time or to reconcile a previously integrated Record after its producer revised it. Integration consumes the LearningRecord, not the Ticket that may have produced it.

Require the user to have explicitly asked or accepted the integration or reconciliation in this topic workspace. For an initial Ticket-backed integration, require the supplied KnowledgeTicket to be `resolved` and its `result` to reference the LearningRecord. When reconciling a previously integrated Ticket-backed Record, the Ticket may already be `integrated`; require only that its `result` still references this Record. For a standalone LearningRecord, the explicit integration request is sufficient acceptance; do not create a retroactive Ticket or add an `adopted` lifecycle state.

For a first integration, add only the minimum explanation needed by the mother document, followed by one idempotent callout:

```markdown
> [!NOTE] 关联知识：<title>
> [<record title>](<ref>)概括解决的问题、贡献和何时值得深入阅读。
```

For a Record that is already integrated, compare only the existing mother-document summary/callout text with the revised Record. If that summary remains accurate, leave the mother document unchanged. If it became inaccurate, update only the minimum summary text needed to match the revised Record. Never re-copy the Record or insert a second callout.

Do not expose workflow metadata in the mother-document body or alter the LearningRecord. Add or reconcile exactly one related-record index entry; preserve the existing entry and update only metadata that actually changed rather than creating a duplicate.

For an initial Ticket-backed integration, update the Ticket from `resolved` to `integrated`. Before marking its existing formal map node `[x]`, add or reconcile the node's `map_completions` entry with `basis: integrated-ticket` and references to the Ticket and LearningRecord. When reconciling a Record from an already `integrated` Ticket, leave the Ticket lifecycle unchanged.

For an initial standalone LearningRecord integration, do not mutate any Ticket lifecycle. Only when the user explicitly identifies an existing confirmed Map node that this Record satisfies, add or reconcile `map_completions` for that node with `basis: accepted-existing-material` and the LearningRecord reference, then mark that existing node `[x]`. If the Record is only supplemental knowledge, integrate the callout and related-record index without creating, completing, or otherwise changing a Map node.

Revision reconciliation does not by itself reopen or downgrade an existing Map completion. If the revised Record appears no longer sufficient to support a `map_completions` entry that references it, report that completion inconsistency for user confirmation and leave the completion state unchanged; do not silently change `[x]`, delete provenance, or create a new Ticket.

Then reconcile the stage and next action. Do not duplicate callouts, related-record entries, or completion provenance.

Done when the selected LearningRecord is represented by exactly one accurate mother-document callout/index entry and synthesis state is reconciled without changing the Record. A first Ticket-backed integration additionally leaves the Ticket `integrated` and its existing map node with `integrated-ticket` provenance when applicable. A first standalone integration leaves Ticket state untouched and changes the Map only when the user explicitly accepted the Record as completion evidence for an existing confirmed node. Revision reconciliation changes only stale integrated summary/index metadata when necessary and otherwise leaves already-correct integration, Ticket lifecycle, and Map completion untouched.
