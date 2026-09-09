# Materialize

Use when the learning work is already complete and the user wants the result preserved as durable conceptual knowledge. Typical inputs are a completed chat discussion, existing notes, ad-hoc research, a completed experiment/research result, or the completed external result for one already-existing unresolved `evidence` KnowledgeTicket.

Treat the supplied understanding as the result to organize, not as a new question to solve. Preserve its project, environment, version, evidence, and explicitly supplied knowledge-lineage boundaries. Do not reopen the learning work, broaden its scope, or start new research unless the user explicitly asks. If the supplied material cannot support a valid self-contained LearningRecord, report what is missing instead of inventing or researching it silently.

If the user/workflow explicitly identifies a concrete prior LearningRecord and says the completed result arose from a learner question while reading or extending that Record, preserve one supported `derived-from` relation under the shared LearningRecord contract. Carry the supplied learner question as the relation's `question`, render the Record's reader-facing `来源脉络`, and do not edit the parent Record to add a reciprocal backlink. Do not infer lineage merely because the new result is conceptually related to an older Record.

For standalone Materialize, write exactly one publication-ready `record_type: note` LearningRecord and do not create or mutate any Ticket merely to justify it.

If one unresolved `evidence` KnowledgeTicket is supplied and the user provides the completed external result that Ticket was waiting for, read [KnowledgeTicket](../../_shared/knowledge-ticket.md). Use its user-owned question and body only to preserve accepted scope and the body-stated result destination; do not execute the experiment/research itself. Materialize exactly one completed LearningRecord at that destination, then set only that supplied Ticket's status to `resolved` and its `result` reference.

In either branch, organize supplied evidence beside the claims it supports and keep verified facts, inference, and unresolved assumptions distinguishable. Do not mutate the Learning Map, synthesis state, mother document, unrelated Tickets, parent lineage Record, or an external publication destination.

Done when standalone Materialize leaves exactly one contract-valid durable Record without creating or resolving a Ticket, or evidence-backed Materialize leaves exactly one contract-valid Record at the supplied Ticket destination and resolves only that existing evidence Ticket with its `result` reference set. When supported lineage was supplied, that same Record contains the canonical `derived-from` edge and matching reader-facing lineage rendering.
