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
| `record_type` | Stable producer-defined classification. Canonical producer types in this workflow are conceptual `note`, direct source-investigation `code-walkthrough`, and synthesis-owned mother-document `synthesis`. It never controls the body format. |
| `created_at` | Record creation date in `YYYY-MM-DD`. |

The Markdown body after the frontmatter is required. It must be complete and publication-ready; it is never stored as a frontmatter field.

## Optional frontmatter

| Field | Contract |
| --- | --- |
| `tags` | Short, stable retrieval terms. Omit when no useful tags are known. |
| `status` | Producer's understanding state. Prefer `open`, `in-progress`, or `resolved`; preserve another explicit user value. |
| `sources` | Evidence references. Each entry has a `type` and `ref`; it may include `note` when the reference needs qualification. |
| `relations` | Supported durable knowledge-lineage edges from this Record to another LearningRecord. Omit when no supported lineage is known. |

Common `sources[].type` values are `repository`, `url`, `document`, `experiment`, and `conversation`. They are an open vocabulary, not an exhaustive enum.

## Knowledge lineage relation

`relations` preserves why the current durable knowledge grew from prior durable knowledge. It is distinct from workflow provenance such as Ticket lifecycle or Map completion evidence.

The first supported relation type is deliberately narrow:

```yaml
relations:
  - type: derived-from
    ref: records/Tensor基础.md
    question: 一个图片是如何被转换成一个 Tensor 的？
```

For `type: derived-from`:

- `ref` is required and identifies the prior LearningRecord from which the current Record grew. Prefer a stable workspace-relative Record path when the relation is local to the topic workspace.
- `question` is required and records the learner question that caused the new Record to be pursued from that prior Record.
- Store the edge only on the child/current Record. Do not require or synthesize a reciprocal `extended-by` entry on the parent Record.
- Add the relation only when the lineage is explicitly supplied by the learner/workflow context or otherwise directly supported by the learning history being materialized. Do not infer `derived-from` merely because two Records are semantically related.
- Do not invent additional relation types until a separate observed workflow need defines their semantics.

The frontmatter relation is the canonical relation fact. When `derived-from` is present, the Markdown body must also render a concise reader-facing `来源脉络` section that names/links the parent Record and shows the `question`. That section is a presentation of the metadata, not a second independently maintained relation source.

Example reader-facing rendering:

```markdown
## 来源脉络

[Tensor基础](Tensor基础.md)
→ 阅读时产生问题：“一个图片是如何被转换成一个 Tensor 的？”
→ 当前记录继续回答这个问题。
```

## Producer obligations

- Write standard Markdown: one YAML frontmatter block followed by the reader-facing body.
- Keep evidence, inference, and unresolved assumptions distinguishable in the body.
- Include only metadata supported by the work.
- If a supported `derived-from` relation is present, keep its reader-facing `来源脉络` rendering consistent with the canonical frontmatter edge.
- Finish the body before handing the file to a publisher or integrator.

### `code-walkthrough` evidence contract

For every source-based conclusion in a `record_type: code-walkthrough` Record, use this sequence:

`source location → minimal excerpt → explanation`

The excerpt must be the smallest code needed to show the relevant control flow, data access, or configuration. A file path or line number alone is navigation, not evidence. Keep verified source facts, inference, and unconfirmed items distinguishable.

This obligation belongs to the durable LearningRecord, regardless of whether the Record came from a KnowledgeTicket, a standalone direct Codex investigation, or a later revision.

## Revision contract

When the user asks to adjust an existing LearningRecord, revise that durable artifact in place instead of creating a duplicate Record or a KnowledgeTicket merely for the edit.

- Preserve the Record's existing file/path, `version`, producer-defined `record_type`, and `created_at` unless the user explicitly requests a semantic replacement rather than a revision.
- Use the user's requested change as the revision scope. Preserve still-correct content and evidence; do not broaden the edit into unrelated learning or research.
- Preserve still-supported `relations` and their reader-facing lineage rendering. Change or remove a relation only when the user explicitly corrects the lineage or the supplied evidence/context no longer supports it; do not infer a replacement relation from topic similarity.
- The producer class that owns the Record's content and evidence revises it. A source-backed `code-walkthrough` remains subject to the code-walkthrough evidence contract above after every revision.
- If the requested change requires evidence or understanding that the current Record does not support, report the missing or newly exposed learning work instead of silently inventing it. Do not create a Ticket unless that gap is separately accepted into the learning workflow.
- Revalidate the complete Record after editing: all required frontmatter remains valid, the body remains self-contained, supported relation renderings remain consistent, and every producer-specific evidence obligation still holds.

Revision alone does not mutate KnowledgeTicket lifecycle, Learning Map completion, or synthesis integration state. Those states are reconciled by their owning workflow only when the revised Record materially affects them.

## Consumer obligations

- Validate the required frontmatter and confirm that a non-empty Markdown body follows the closing fence.
- Validate any supported `relations` and treat their frontmatter entries as canonical lineage facts.
- Treat the body as opaque completed Markdown: preserve its meaning and structure.
- Map metadata to the destination without inventing producer-specific rules.
- Return destination identifiers or links separately; they are publication results, not mutations to the source record.

## Migration from v1

v1 stored the body under a frontmatter `body: |` value. v2 removes that field and moves its de-indented value after the closing frontmatter fence. This is a semantic format change, so new records use `version: 2`. A consumer that supports legacy v1 may migrate it explicitly; it must not silently treat a v1 file as directly readable Markdown.
