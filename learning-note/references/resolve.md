# Resolve

Use when a supplied local `concept` KnowledgeTicket still represents pending conceptual work.

Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) and use its user-owned question plus Markdown body as the complete scope and work contract. Perform only the conceptual work needed to resolve that question. Preserve project, environment, version, evidence, and explicitly supplied knowledge-lineage boundaries that affect the conclusion; verify unstable or uncertain facts from primary sources when needed.

If the accepted work is explicitly described as growing from a concrete prior LearningRecord through a learner question, preserve one supported `derived-from` relation under the shared LearningRecord contract. Use the supplied prior Record as `ref`, preserve the learner question as the relation's `question`, render the reader-facing `来源脉络`, and do not mutate the parent Record. Do not infer lineage from subject similarity or from the Ticket's integration target alone.

Organize the evidence beside the claims it supports, explain the mechanism along its natural conceptual or operational path, and keep verified facts, inference, and open questions distinguishable. Write exactly one publication-ready `record_type: note` LearningRecord to the Ticket body's workspace-relative result destination.

After the Record is valid, set only that supplied Ticket's status to `resolved` and set its `result` reference. Do not edit the Learning Map, synthesis state, mother document, parent lineage Record, another Ticket, or external publication destination.

Done when exactly one contract-valid LearningRecord independently answers the supplied concept Ticket within its stated scope, exists at the Ticket destination, and that Ticket alone is `resolved` with its `result` reference set. When supported lineage was supplied, the Record also contains the canonical `derived-from` edge and matching reader-facing lineage rendering.
