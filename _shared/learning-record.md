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

## Consumer obligations

- Validate the required frontmatter and confirm that a non-empty Markdown body follows the closing fence.
- Treat the body as opaque completed Markdown: preserve its meaning and structure.
- Map metadata to the destination without inventing producer-specific rules.
- Return destination identifiers or links separately; they are publication results, not mutations to the source record.

## Migration from v1

v1 stored the body under a frontmatter `body: |` value. v2 removes that field and moves its de-indented value after the closing frontmatter fence. This is a semantic format change, so new records use `version: 2`. A consumer that supports legacy v1 may migrate it explicitly; it must not silently treat a v1 file as directly readable Markdown.
