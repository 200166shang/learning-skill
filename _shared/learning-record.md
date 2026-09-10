# LearningRecord v2 / KnowledgeNote storage contract

`LearningRecord` is the storage contract for durable Markdown knowledge. For the ordinary learning loop, a `record_type: note` Record is called a `KnowledgeNote`; it is an explanation, not proof that the learner has mastered the subject. YAML frontmatter carries metadata; the reader-facing Markdown body follows the closing fence.

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
| `relations` | Supported semantic relationships between KnowledgeNotes. |

`sources[].type` is open vocabulary; common values are `repository`, `url`, `document`, `experiment`, and `conversation`.

## Knowledge relations

New records use a small semantic vocabulary:

```yaml
relations:
  - type: requires
    ref: notes/pwm-basics.md
  - type: part-of
    ref: notes/mcu-control-loop.md
  - type: contrasts-with
    ref: notes/open-loop-control.md
```

`requires` identifies an explanation dependency. `part-of` identifies the larger mechanism containing the current note. `contrasts-with` is semantically symmetric, although only one canonical edge needs storage. Create a relation from explicit content evidence or an approved curation proposal.

Relation targets use workspace-relative note paths. Shared titles, tags, or Journey parents alone are not evidence of a semantic relation.

## Producer obligations

- Write one standard frontmatter block plus a complete Markdown body.
- Keep evidence, inference, and unresolved assumptions distinguishable.
- Include only supported metadata.
- Keep semantic relations supported by the note's content.
- Hand off only after the producer branch's completion criterion and this contract are satisfied.

### `code-walkthrough` evidence contract

Every source-based conclusion in `record_type: code-walkthrough` follows:

`source location → minimal excerpt → explanation`

Use the smallest excerpt that demonstrates the relevant control flow, data access, or configuration. A path/line number alone is navigation, not evidence. Keep verified source facts, inference, and unconfirmed items distinguishable.

This evidence rule belongs here regardless of whether the Record came from a Ticket, direct Codex work, or later revision.

## Revision contract

Revise an existing LearningRecord in place when the user asks to adjust it.

- Preserve file/path, `version`, `record_type`, `created_at`, still-correct content/evidence, and supported relations unless the requested change says otherwise.
- Let the user's requested change define revision scope.
- Keep source-backed `code-walkthrough` Records compliant with the evidence contract.
- Keep supported semantic relations intact unless the requested revision changes their factual basis.
- When the requested edit exposes unsupported new learning work, report that gap at the revision boundary; a later user-confirmed synthesis action may formalize it.
- Revalidate the whole Record before handoff.

Revision changes only the Record. Ticket lifecycle, Map completion, synthesis integration, and derived views remain with their owning workflows until reconciled there.

## Consumer obligations

- Validate required frontmatter, non-empty body, producer-specific evidence obligations, and supported relations.
- Preserve the completed body's meaning/structure and treat canonical lineage as producer-owned fact.
- Map metadata to a destination without inventing producer-specific semantics; return destination identifiers/links as publication results rather than source mutations.

## Legacy migration boundary

The reader tolerates old `status` metadata and `derived-from` relations only so `migrate-learning-journey.mjs` can safely inspect legacy workspaces. The migration may preserve that inert metadata, but normal V6 producers do not write it and runtime graph construction does not consume it.

## Migration from v1

v1 stored Markdown in frontmatter `body: |`. v2 moves that body after the closing frontmatter fence. Legacy v1 may be explicitly migrated; new Records use v2.
