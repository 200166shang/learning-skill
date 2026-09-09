# LearningRecord v2

`LearningRecord` is the directly readable Markdown handoff between learning producers and later consumers. YAML frontmatter carries metadata; the reader-facing Markdown body follows the closing fence.

## Format

```markdown
---
version: 2
title: UART 如何连接底盘控制与 MCU
record_type: code-walkthrough
created_at: 2026-09-09
tags: [UART, STM32]
sources:
  - type: repository
    ref: src/base_control/src/base_control.cpp
---

# UART 如何连接底盘控制与 MCU

完整、可独立阅读的正文。
```

Required frontmatter:

| Field | Contract |
| --- | --- |
| `version` | Integer `2`. |
| `title` | Specific question/understanding title. |
| `record_type` | Producer classification: commonly `note`, `code-walkthrough`, or `synthesis`; it does not dictate body shape. |
| `created_at` | `YYYY-MM-DD`. |

The body is required, self-contained, and publication-ready.

Optional metadata:

| Field | Contract |
| --- | --- |
| `tags` | Stable retrieval terms. |
| `sources` | Evidence references with `type` + `ref`, optionally `note`. |
| `relations` | Supported durable Record-to-Record lineage. |

Legacy v2 `status` is tolerated as inert compatibility metadata. New Records omit it; producer completion plus this contract determines readiness. Revision preserves an existing legacy value unless metadata cleanup is explicitly requested.

## Knowledge lineage

The currently supported durable relation is:

```yaml
relations:
  - type: derived-from
    ref: records/Tensor基础.md
    question: 一个图片是如何被转换成一个 Tensor 的？
```

For `derived-from`, `ref` identifies the prior LearningRecord and `question` preserves the learner question that caused the child Record to grow. Create this edge only from explicit/supported learning provenance. The child/current Record owns the canonical edge; the parent remains unchanged.

When a supported edge exists, render the same fact for readers in a concise `## 来源脉络` section, for example:

```markdown
## 来源脉络

[Tensor基础](Tensor基础.md)
→ 阅读时产生问题：“一个图片是如何被转换成一个 Tensor 的？”
→ 当前记录继续回答这个问题。
```

The frontmatter edge is canonical; the Markdown section is its presentation. Additional relation types require a separately observed workflow need.

## Producer obligations

- Write one standard frontmatter block plus a complete Markdown body.
- Keep evidence, inference, and unresolved assumptions distinguishable.
- Include only supported metadata.
- Keep reader-facing lineage synchronized with any canonical relation.
- Hand off only after the producer branch's completion criterion and this contract are satisfied.

### `code-walkthrough` evidence contract

Every source-based conclusion in `record_type: code-walkthrough` follows:

`source location → minimal excerpt → explanation`

Use the smallest excerpt that demonstrates the relevant control flow, data access, or configuration. A path/line number alone is navigation, not evidence. Keep verified source facts, inference, and unconfirmed items distinguishable.

This evidence rule belongs here regardless of whether the Record came from a Ticket, direct Codex work, or later revision.

## Revision contract

Revise an existing LearningRecord in place when the user asks to adjust it.

- Preserve file/path, `version`, `record_type`, `created_at`, still-correct content/evidence, supported relations, and any legacy `status` unless the requested change says otherwise.
- Let the user's requested change define revision scope.
- Keep source-backed `code-walkthrough` Records compliant with the evidence contract.
- Keep canonical lineage and its reader-facing rendering consistent; relation changes require explicit/supported provenance correction.
- When the requested edit exposes unsupported new learning work, report that gap at the revision boundary; a later user-confirmed synthesis action may formalize it.
- Revalidate the whole Record before handoff.

Revision changes only the Record. Ticket lifecycle, Map completion, synthesis integration, and derived views remain with their owning workflows until reconciled there.

## Consumer obligations

Validate required frontmatter, non-empty body, producer-specific evidence obligations, and any supported relation. Treat the body as completed Markdown and canonical lineage as producer-owned fact. Legacy `status` never gates readiness.

## Migration from v1

v1 stored Markdown in frontmatter `body: |`. v2 moves that body after the closing frontmatter fence. Legacy v1 may be explicitly migrated; new Records use v2.