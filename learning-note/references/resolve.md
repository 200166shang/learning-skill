# Resolve

Use when a supplied local `concept` KnowledgeTicket still represents pending conceptual work.

Read [KnowledgeTicket](../../_shared/knowledge-ticket.md). Its user-owned question and Markdown body are the complete scope/work contract. Perform only the conceptual work needed to resolve that question, preserving environment/version/evidence boundaries and verifying unstable facts from primary sources when needed.

Apply the shared [LearningRecord contract](../../_shared/learning-record.md) for artifact shape, evidence/inference separation, and any explicitly supported `derived-from` lineage. Write exactly one publication-ready `record_type: note` LearningRecord to the Ticket's stated workspace-relative destination.

After the Record is valid, update only the supplied Ticket to `resolved` and set its `result` reference. Map/state/mother-document integration and external publication remain with their owners.

Done when exactly one contract-valid LearningRecord independently answers the supplied Ticket within scope at its stated destination, and that Ticket alone is `resolved` with `result` set.