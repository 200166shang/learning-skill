# Materialize

Use when the learning result is already complete and the learner wants durable conceptual knowledge. Inputs may be a completed discussion/note/research result or the completed external result for one unresolved `evidence` Ticket.

Treat supplied understanding as the result to organize. Preserve its environment/version/evidence boundaries and keep the existing scope; missing support is reported rather than silently replaced by new research.

Apply the shared [LearningRecord contract](../../_shared/learning-record.md) for metadata, evidence, and any explicitly supported `derived-from` lineage.

## Standalone result

Write exactly one publication-ready `record_type: note` LearningRecord. No Ticket is needed to justify already-completed learning.

## Completed evidence Ticket

When one unresolved `evidence` Ticket is supplied with the external result it was waiting for, read [KnowledgeTicket](../../_shared/knowledge-ticket.md), preserve its accepted scope/result destination, write exactly one LearningRecord there, then set that Ticket alone to `resolved` with `result` referencing the Record.

This branch owns the Record (and, for the evidence-backed case, that one Ticket transition). Map/state/mother-document integration and external publication remain with their owners.

Done when one contract-valid durable Record exists; standalone Materialize leaves Ticket state unchanged, while evidence-backed Materialize resolves only the supplied Ticket. Supported lineage is preserved through the canonical LearningRecord contract.