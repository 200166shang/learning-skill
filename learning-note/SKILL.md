---
name: learning-note
description: Produce a durable, reusable conceptual LearningRecord when the user explicitly wants preserved learning content or when a concept KnowledgeTicket routes work here.
---

# Learning Note

Turn conceptual learning into a self-contained explanation that can be reused later. A LearningRecord may come from unresolved work that this skill resolves or from learning the user already completed elsewhere; do not require a KnowledgeTicket merely to justify an existing result.

Before producing the result, read the shared [LearningRecord contract](../_shared/learning-record.md). Emit standard Markdown with `record_type: note` in YAML frontmatter and the reader-facing body after the closing fence.

## Choose one branch

### Resolve

Use when a local `concept` KnowledgeTicket supplies work that is still pending. Read [KnowledgeTicket](../_shared/knowledge-ticket.md) and use its question and Markdown body as the scope and work contract. Perform the conceptual work needed to resolve the question, write exactly one completed LearningRecord to the body-stated workspace-relative destination, then set only that ticket's status to `resolved` and its `result` reference. Do not edit the Learning Map, synthesis state, or mother document; integration belongs to `learning-synthesis`.

### Materialize

Use when the user supplies an already-resolved learning result—such as a completed chat discussion, existing notes, or ad-hoc research—and explicitly wants it preserved as durable knowledge. Treat the supplied understanding as the result to organize, not as a new question to solve. Do not create a KnowledgeTicket, reopen the learning work, expand its scope, or start new research unless the user explicitly asks. If the supplied result is not sufficient to support a valid self-contained LearningRecord, report what is missing instead of silently researching or inventing it.

## Workflow

1. Identify the concrete question, observed behavior, or insight and preserve project, environment, and version boundaries that affect the conclusion.
2. Organize the supplied evidence—commands, outputs, experiments, links, observations, or prior explanation—beside the claims it supports. In `Resolve`, verify unstable or uncertain facts from primary sources when needed. In `Materialize`, preserve the supplied result and its evidence boundaries unless the user explicitly requests further research.
3. Explain the mechanism along its natural conceptual or operational path. Separate verified facts, inference, and open questions.
4. Write a publication-ready Markdown file: metadata in one YAML frontmatter block, followed by the reader-facing body. Use headings, lists, tables, code, or Mermaid only when they make the specific material easier to understand; do not force a fixed article template.
5. Return a valid LearningRecord and stop. In `Resolve`, also return the KnowledgeTicket resolution identifier. In `Materialize`, do not mutate ticket lifecycle because no Ticket is required.

Completion criterion: the body independently explains the supplied learning result, its evidence, conclusion, and applicability; every required LearningRecord field is present. `Resolve` additionally completes exactly one supplied concept Ticket; `Materialize` produces the durable record without creating or resolving a Ticket.

## Boundary

A request centered on tracing real files, functions, callers, runtime state, or data through a codebase is a direct Codex source investigation, normally compiled by `learning-synthesis` as a `code` ticket when work is still pending. This skill produces conceptual content and does not create or update Feishu, Obsidian, GitHub, or another external store.
