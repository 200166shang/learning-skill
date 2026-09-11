# Persistence

Follow the canonical [KnowledgeNote contract](../../_shared/knowledge-note.md).

The [document lifecycle](documents.md) owns when and where to write. This reference owns KnowledgeNote format and persistence invariants.

Questions and notes are many-to-many. `note_refs: []` is valid. After writing the document, maintain Question and KnowledgeTarget refs through deterministic runtime operations rather than direct YAML edits. Notes describe knowledge; they never close questions or Episodes. Learning history belongs in Journey and demonstrated understanding in Evidence.
