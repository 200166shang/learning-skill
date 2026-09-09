# Integrate

Read [LearningRecord](../../_shared/learning-record.md) and [LearningSynthesisState](../../_shared/learning-synthesis-state.md). Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only for a Ticket-backed Record. Read [Knowledge lineage views](knowledge-lineage.md) only when this integration needs Map Record attachments or lineage rendering.

Use this mode for first integration of a valid completed LearningRecord or minimal reconciliation after an already-integrated Record was revised. Integration consumes the Record.

## Acceptance and provenance

The learner must have explicitly asked for/accepted integration in this topic.

- **First Ticket-backed integration:** Ticket is `resolved` and `result` references the Record.
- **Reconciliation of prior Ticket-backed integration:** Ticket may already be `integrated`; `result` still references the Record.
- **Standalone Record:** the explicit integration request is sufficient; no retroactive Ticket is needed.

## Mother document and indexes

For first integration, add only the minimum reader-facing explanation needed by the mother document plus one idempotent callout:

```markdown
> [!NOTE] 关联知识：<title>
> [<record title>](<ref>)概括解决的问题、贡献和何时值得深入阅读。
```

Workflow metadata stays in state/Tickets rather than the mother-document body. Maintain exactly one related-record index entry for the Record.

For an already-integrated revised Record, compare only the existing summary/callout/index/view metadata. Keep accurate content unchanged; update only stale text/metadata. The child Record remains producer-owned.

## Map completion

For first Ticket-backed integration, move that Ticket `resolved → integrated`. When its existing formal Map node is completed by this result, reconcile `map_completions` with `basis: integrated-ticket` and Ticket+Record refs before marking `[x]`.

For standalone integration, Ticket lifecycle stays unchanged. If the learner explicitly accepts the Record as sufficient for an existing confirmed Map node, reconcile `map_completions` with `basis: accepted-existing-material` and the Record ref before marking `[x]`. Supplemental Records integrate without changing formal Map completion.

Revision reconciliation preserves existing completion provenance unless the revised Record appears insufficient. In that case, surface the inconsistency for learner confirmation; the existing completion remains unchanged until that decision is made.

## Learner-facing Record views

When the integration already associates a Record with a formal Map node, reconcile one lightweight Record attachment using [Knowledge lineage views](knowledge-lineage.md).

When supported `derived-from` relations exist, regenerate `knowledge-lineage.md` from canonical child-Record metadata under that same reference. The producer owns relation changes; integration only refreshes derived views.

## Idempotency boundary

Reconcile only synthesis-owned artifacts affected by this integration: mother-document summary/callout, related-record index, applicable Ticket transition, completion provenance, Map attachment, and derived lineage view. Keep one canonical instance of each. Current situation/next recommendation remains derived rather than persisted.

Done when the Record has one accurate mother-document representation/index entry; applicable Map attachment/lineage view is current; applicable first-time Ticket transition/completion provenance is correct; and repeated reconciliation would make no further changes.