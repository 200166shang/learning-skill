# LearningRecord v2

`LearningRecord` is a directly readable Markdown document and the handoff contract between learning producers and publishers. Its YAML frontmatter carries metadata; its Markdown body begins after the closing frontmatter fence. A reader can open the file in Obsidian or another Markdown viewer without a consumer extracting a `body` field.

## File format

```markdown
---
version: 2
title: UART 如何连接底盘控制与 MCU
record_type: code-walkthrough
created_at: 2026-09-09
tags:
  - UART
  - STM32
status: resolved
sources:
  - type: repository
    ref: src/base_control/src/base_control.cpp
---

# UART 如何连接底盘控制与 MCU

完整、可独立阅读的 Markdown 正文。
```

## Required frontmatter

| Field | Contract |
| --- | --- |
| `version` | Integer `2`. |
| `title` | A specific title describing the question or understanding. |
| `record_type` | Stable producer-defined classification, such as `note` or `code-walkthrough`. It never controls the body format. |
| `created_at` | Record creation date in `YYYY-MM-DD`. |

The Markdown body after the frontmatter is required. It must be complete and publication-ready; it is never stored as a frontmatter field.

## Optional frontmatter

| Field | Contract |
| --- | --- |
| `tags` | Short, stable retrieval terms. Omit when no useful tags are known. |
| `status` | Producer's understanding state. Prefer `open`, `in-progress`, or `resolved`; preserve another explicit user value. |
| `sources` | Evidence references. Each entry has a `type` and `ref`; it may include `note` when the reference needs qualification. |

Common `sources[].type` values are `repository`, `url`, `document`, `experiment`, and `conversation`. They are an open vocabulary, not an exhaustive enum.

## Producer obligations

- Write standard Markdown: one YAML frontmatter block followed by the reader-facing body.
- Keep evidence, inference, and unresolved assumptions distinguishable in the body.
- Include only metadata supported by the work.
- Finish the body before handing the file to a publisher or integrator.
- For `record_type: code-walkthrough`, pair every source-based conclusion with a nearby minimal code excerpt and its source location. A location link alone is navigation, not an explanation.

## Revision contract

When the user asks to adjust an existing LearningRecord, revise that durable artifact in place instead of creating a duplicate Record or a KnowledgeTicket merely for the edit.

- Preserve the Record's existing file/path, `version`, producer-defined `record_type`, and `created_at` unless the user explicitly requests a semantic replacement rather than a revision.
- Use the user's requested change as the revision scope. Preserve still-correct content and evidence; do not broaden the edit into unrelated learning or research.
- The producer class that owns the Record's content and evidence revises it. A source-backed `code-walkthrough` remains subject to the code-evidence obligation above after every revision.
- If the requested change requires evidence or understanding that the current Record does not support, report the missing or newly exposed learning work instead of silently inventing it. Do not create a Ticket unless that gap is separately accepted into the learning workflow.
- Revalidate the complete Record after editing: all required frontmatter remains valid, the body remains self-contained, and every producer-specific evidence obligation still holds.

Revision alone does not mutate KnowledgeTicket lifecycle, Learning Map completion, or synthesis integration state. Those states are reconciled by their owning workflow only when the revised Record materially affects them.

## Consumer obligations

- Validate the required frontmatter and confirm that a non-empty Markdown body follows the closing fence.
- Treat the body as opaque completed Markdown: preserve its meaning and structure.
- Map metadata to the destination without inventing producer-specific rules.
- Return destination identifiers or links separately; they are publication results, not mutations to the source record.

## Migration from v1

v1 stored the body under a frontmatter `body: |` value. v2 removes that field and moves its de-indented value after the closing frontmatter fence. This is a semantic format change, so new records use `version: 2`. A consumer that supports legacy v1 may migrate it explicitly; it must not silently treat a v1 file as directly readable Markdown.
