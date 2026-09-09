---
name: learning-note
description: Turn rough technical observations, questions, experiments, or references into a durable Markdown learning record. Use for knowledge synthesis that does not require a source-code execution walkthrough; publishing is handled separately.
---

# Learning Note

Turn fragmented technical input into a self-contained explanation that answers the user's real question and can be reused later.

Before producing the result, read the shared [LearningRecord v2 contract](../_shared/learning-record-v2.md). Emit standard Markdown with `record_type: note` in YAML frontmatter and the reader-facing body after the closing fence.

When the input is a local KnowledgeTicket, also read [KnowledgeTicket v2](../_shared/knowledge-ticket-v2.md). Use its question and Markdown body as the scope and work contract; write the completed record to the body-stated workspace-relative destination. Then set only that ticket's status to `resolved` and its `result` reference. Do not edit the Learning Map, synthesis state, or mother document; integration belongs to `learning-synthesis`.

## Workflow

1. Identify the concrete question, observed behavior, or insight. Preserve project, environment, and version boundaries that affect the conclusion.
2. Organize the supplied evidence—commands, outputs, experiments, links, and observations—beside the claims it supports. Verify unstable or uncertain facts from primary sources when needed.
3. Explain the mechanism along its natural conceptual or operational path. Separate verified facts, inference, and open questions.
4. Write a publication-ready Markdown file: metadata in one YAML frontmatter block, followed by the reader-facing body. Use headings, lists, tables, code, or Mermaid only when they make the specific material easier to understand; do not force a fixed article template.
5. Return a valid `LearningRecord` and stop. For a KnowledgeTicket, also return its resolution identifier. If the same request explicitly asks for an external destination, the appropriate publisher consumes this completed record.

Completion criterion: the body independently explains the original question, its evidence, conclusion, and applicability; every required LearningRecord field is present.

## Boundary

A request centered on tracing real files, functions, callers, runtime state, or data through a codebase is a direct Codex source investigation, normally compiled by `learning-synthesis` as a `code` ticket. This skill produces conceptual content and does not create or update Feishu, Obsidian, GitHub, or another external store.
