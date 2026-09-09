# Integrate

Before integrating, read [KnowledgeTicket](../../_shared/knowledge-ticket.md) and [LearningRecord](../../_shared/learning-record.md).

Require a `resolved` ticket and its result. Add only the minimum explanation needed by the mother document, followed by one idempotent callout:

```markdown
> [!NOTE] 关联知识：<title>
> [<record title>](<ref>)概括解决的问题、贡献和何时值得深入阅读。
```

Do not copy the child record, expose workflow metadata in the body, or alter the child record. Update the map, related-record index, ticket to `integrated`, stage, and next action. Do not insert a second callout for an already integrated ticket.

Done when the resolved result has been minimally incorporated into the mother document, exactly one related-record callout exists for that ticket, the ticket lifecycle is `integrated`, and synthesis state/map indexes are reconciled without changing the child record.
