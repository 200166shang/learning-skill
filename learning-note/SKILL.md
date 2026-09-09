---
name: learning-note
description: Produce or revise a durable, reusable conceptual LearningRecord when the user explicitly wants preserved learning content, supplies an existing conceptual Record for adjustment, or a concept KnowledgeTicket routes work here.
---

# Learning Note

Turn conceptual learning into a self-contained explanation that can be reused later. A LearningRecord may come from unresolved work that this skill resolves, from learning the user already completed elsewhere, or from an existing conceptual Record the user wants revised. Do not require a KnowledgeTicket merely to justify an existing result or revision.

Before producing or revising the result, read the shared [LearningRecord contract](../_shared/learning-record.md). Emit standard Markdown with `record_type: note` in YAML frontmatter and the reader-facing body after the closing fence.

## Choose one branch

### Resolve

Use when a local `concept` KnowledgeTicket supplies work that is still pending. Read [KnowledgeTicket](../_shared/knowledge-ticket.md) and use its question and Markdown body as the scope and work contract. Perform the conceptual work needed to resolve the question, write exactly one completed LearningRecord to the body-stated workspace-relative destination, then set only that ticket's status to `resolved` and its `result` reference. Do not edit the Learning Map, synthesis state, or mother document; integration belongs to `learning-synthesis`.

### Materialize

Use when the user supplies an already-resolved learning result—such as a completed chat discussion, existing notes, or ad-hoc research—and explicitly wants it preserved as durable knowledge. Treat the supplied understanding as the result to organize, not as a new question to solve. Do not create a KnowledgeTicket, reopen the learning work, expand its scope, or start new research unless the user explicitly asks. If the supplied result is not sufficient to support a valid self-contained LearningRecord, report what is missing instead of silently researching or inventing it.

### Revise

Use when the user supplies an existing `record_type: note` LearningRecord and asks to adjust its explanation, structure, depth, examples, wording, or supported conclusions. Follow the shared LearningRecord `Revision contract`: revise the same file in place, preserve artifact identity and still-correct content, and keep the user's requested change as scope. Do not create a new Ticket or duplicate Record merely because the user requested a revision.

If the requested revision exposes genuinely new unresolved learning work that the current Record and supplied evidence cannot support, report that gap and stop at the revision boundary rather than silently expanding into new research or creating a Ticket. A separate synthesis action may capture the gap only after the user accepts it.

## Workflow

1. Identify the concrete question, observed behavior, insight, or revision request and preserve project, environment, and version boundaries that affect the conclusion.
2. Organize the supplied evidence—commands, outputs, experiments, links, observations, prior explanation, or the existing Record—beside the claims it supports. In `Resolve`, verify unstable or uncertain facts from primary sources when needed. In `Materialize`, preserve the supplied result and its evidence boundaries unless the user explicitly requests further research. In `Revise`, preserve still-valid evidence and change only what the requested revision requires.
3. Explain or revise the mechanism along its natural conceptual or operational path. Separate verified facts, inference, and open questions.
4. Write a publication-ready Markdown file: metadata in one YAML frontmatter block, followed by the reader-facing body. In `Revise`, update the existing file rather than creating a replacement artifact. Use headings, lists, tables, code, or Mermaid only when they make the specific material easier to understand; do not force a fixed article template.
5. Return a valid LearningRecord and stop. In `Resolve`, also return the KnowledgeTicket resolution identifier. In `Materialize`, do not mutate ticket lifecycle because no Ticket is required. In `Revise`, do not mutate Ticket, Map, or synthesis integration state; those owners reconcile only if the changed Record materially affects them.

Completion criterion: the body independently explains the supplied learning result, its evidence, conclusion, and applicability; every required LearningRecord field is present. `Resolve` additionally completes exactly one supplied concept Ticket; `Materialize` produces the durable record without creating or resolving a Ticket; `Revise` leaves one contract-valid updated Record at the same path without creating a duplicate or unrelated work item.

## Boundary

A request centered on tracing real files, functions, callers, runtime state, or data through a codebase is a direct Codex source investigation, normally compiled by `learning-synthesis` as a `code` ticket when work is still pending. Revision of a source-backed or `code-walkthrough` LearningRecord also stays with direct Codex under the shared LearningRecord revision contract. This skill produces conceptual content and does not create or update Feishu, Obsidian, GitHub, or another external store.
