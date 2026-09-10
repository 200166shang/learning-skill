# KnowledgeNote

`KnowledgeNote` is a durable, independently readable unit of reusable knowledge under `notes/`. This file is its canonical contract.

## Meaning

```text
Journey Question = why this was pursued in one learning context
KnowledgeNote = reusable explanation of a stable concept or mechanism
```

The existence of a KnowledgeNote never proves mastery. A note may be useful, incomplete, or awaiting the learner's follow-up.

## Contract

A note is Markdown with YAML frontmatter:

```markdown
---
title: PWM 如何控制电机平均电压
tags: [PWM, motor]
sources:
  - type: repository
    ref: src/pwm.c
relations:
  - type: requires
    ref: notes/duty-cycle.md
---

# PWM 如何控制电机平均电压

完整、可独立阅读的解释。
```

`title` and a non-empty body are required. `tags`, `sources`, and semantic `relations` are optional. Supported current relations are `requires`, `part-of`, and `contrasts-with`; each relation requires a workspace-relative note `ref`. `record_type` and `created_at` are tolerated legacy metadata, not required current identity.

`derived-from` is legacy traversal provenance. Only legacy migration may interpret it; new notes never write it because Journey owns learning provenance.

## Storage and ownership

```text
notes/<specific-question>.md
```

The note should keep one coherent concept scope and use a causal explanation. Several Journey questions may reference it, and one Journey question may reference several notes. Learning provenance lives in [Learning Journey](learning-journey.md), not in new note relations.

Evidence sources may support note content, but learner verification, reviews, and expressed misconceptions live only in `.learning/evidence.yaml`. Note creation or revision never closes a question or routes learning.
