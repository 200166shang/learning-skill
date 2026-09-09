# Integrate

Before integrating, read [LearningRecord](../../_shared/learning-record.md) and [LearningSynthesisState](../../_shared/learning-synthesis-state.md). Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when the LearningRecord is the result of a supplied Ticket. When the active integration needs to display an associated Record in the Map or the supplied Record contains supported knowledge-lineage relations, also read [Knowledge lineage views](knowledge-lineage.md).

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

## Learner-facing Record views

When this integration already associates the Record with an existing formal Map node, reconcile exactly one lightweight Record attachment under that node using [Knowledge lineage views](knowledge-lineage.md). The attachment is navigation only: it does not create a formal node or completion evidence and must not be added to an unrelated node merely because the topics look similar.

If the supplied Record contains one or more supported `derived-from` relations, reconcile the workspace-root `knowledge-lineage.md` from canonical Record relation metadata after the integration state is otherwise valid. Rebuild the derived graph/index from supported relations in the current topic `records/` directory; do not write reciprocal metadata into parent Records or duplicate relation edges into `learning.yaml`.

If an already integrated Record is revised and its still-supported lineage metadata changes, the producer owns that metadata change. During reconciliation, update only stale Map attachment title/path text and regenerate the derived lineage view from the Records. Do not invent a new lineage edge during integration.

Revision reconciliation does not by itself reopen or downgrade an existing Map completion. If the revised Record appears no longer sufficient to support a `map_completions` entry that references it, report that completion inconsistency for user confirmation and leave the completion state unchanged; do not silently change `[x]`, delete provenance, or create a new Ticket.

Then reconcile the stage and next action. Do not duplicate callouts, related-record entries, Map Record attachments, completion provenance, or lineage edges.

Done when the selected LearningRecord is represented by exactly one accurate mother-document callout/index entry and synthesis state is reconciled without changing the Record. When the Record is associated with an existing Map node, that node has at most one accurate lightweight attachment for the Record. When supported Record lineage exists in the workspace, `knowledge-lineage.md` accurately derives its rendered edges from child-Record metadata without becoming a second source of truth. A first Ticket-backed integration additionally leaves the Ticket `integrated` and its existing map node with `integrated-ticket` provenance when applicable. A first standalone integration leaves Ticket state untouched and changes formal Map completion only when the user explicitly accepted the Record as completion evidence for an existing confirmed node. Revision reconciliation changes only stale integrated summary/index/view metadata when necessary and otherwise leaves already-correct integration, Ticket lifecycle, and Map completion untouched.
