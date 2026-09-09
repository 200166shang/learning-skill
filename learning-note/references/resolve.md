# Resolve

Use when a supplied local `concept` KnowledgeTicket still represents pending conceptual work.

Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) and use its user-owned question plus Markdown body as the complete scope and work contract. Perform only the conceptual work needed to resolve that question. Preserve project, environment, and version boundaries that affect the conclusion; verify unstable or uncertain facts from primary sources when needed.

Organize the evidence beside the claims it supports, explain the mechanism along its natural conceptual or operational path, and keep verified facts, inference, and open questions distinguishable. Write exactly one publication-ready `record_type: note` LearningRecord to the Ticket body's workspace-relative result destination.

After the Record is valid, set only that supplied Ticket's status to `resolved` and set its `result` reference. Do not edit the Learning Map, synthesis state, mother document, another Ticket, or external publication destination.

Done when exactly one contract-valid LearningRecord independently answers the supplied concept Ticket within its stated scope, exists at the Ticket destination, and that Ticket alone is `resolved` with its `result` reference set.
