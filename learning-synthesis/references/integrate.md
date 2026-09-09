# Integrate

Before integrating, read [LearningRecord](../../_shared/learning-record.md) and [LearningSynthesisState](../../_shared/learning-synthesis-state.md). Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when the LearningRecord is the result of a supplied Ticket.

Require a valid completed LearningRecord that the user explicitly asked or accepted to integrate into this topic workspace. Integration consumes the LearningRecord, not the Ticket that may have produced it.

For a Ticket-backed result, require the supplied KnowledgeTicket to be `resolved` and its `result` to reference the LearningRecord. For a standalone LearningRecord, the explicit integration request is sufficient acceptance; do not create a retroactive Ticket or add an `adopted` lifecycle state.

Add only the minimum explanation needed by the mother document, followed by one idempotent callout:

```markdown
> [!NOTE] 关联知识：<title>
> [<record title>](<ref>)概括解决的问题、贡献和何时值得深入阅读。
```

Do not copy the LearningRecord, expose workflow metadata in the body, or alter the record. Add or reconcile exactly one related-record index entry.

If the result is Ticket-backed, update that Ticket to `integrated`. Before marking its existing formal map node `[x]`, add or reconcile the node's `map_completions` entry with `basis: integrated-ticket` and references to the Ticket and LearningRecord.

If the LearningRecord is standalone, do not mutate any Ticket lifecycle. Only when the user explicitly identifies an existing confirmed Map node that this Record satisfies, add or reconcile `map_completions` for that node with `basis: accepted-existing-material` and the LearningRecord reference, then mark that existing node `[x]`. If the Record is only supplemental knowledge, integrate the callout and related-record index without creating, completing, or otherwise changing a Map node.

Then reconcile the stage and next action. Do not insert a second callout, duplicate related-record entry, or duplicate completion provenance for an already integrated Record.

Done when the selected LearningRecord has been minimally incorporated into the mother document, exactly one related-record callout/index entry exists, and synthesis state is reconciled without changing the record. Ticket-backed integration additionally leaves the Ticket `integrated` and its existing map node with `integrated-ticket` provenance when applicable. Standalone integration leaves Ticket state untouched and changes the Map only when the user explicitly accepted the Record as completion evidence for an existing confirmed node.
