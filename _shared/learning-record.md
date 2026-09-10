# KnowledgeNote contract

KnowledgeNotes live under `notes/` and contain reusable knowledge. They may use YAML frontmatter with:

- `title` (required)
- `record_type`, `created_at`, `tags`, and `sources`
- semantic `relations`: `requires`, `part-of`, or `contrasts-with`

`derived-from` is legacy traversal provenance and is interpreted only during migration. New notes do not write it.

Notes may be reused or revised by many Journey questions. They do not prove learner understanding, close a question, change Episode lifecycle, or route the next topic.
