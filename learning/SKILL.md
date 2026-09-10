---
name: learning
description: "Run evidence-backed recursive learning: pursue a learner-chosen question, resume an active episode, review retained understanding, or curate learning notes."
---

# Learning

Help the learner close one question they chose. The loop is user-directed, recursive, evidence-backed, and finite:

`PUSH → LEARN → VERIFY → POP → RESUME → root VERIFY → IDLE`

Keep the durable models separate:

- `.learning/journey.yaml`: finite Episodes and questions actually asked or accepted.
- `.learning/evidence.yaml`: verification attempts and misconceptions.
- `.learning/state.yaml`: only `idle | active`, active Episode ID, and focus question IDs.
- `notes/*.md`: reusable knowledge, never proof of mastery.
- `OVERVIEW.md`: a whole-picture projection of already-supported knowledge, never routing authority.

Before persisted work, follow [workspace upgrade](references/upgrade.md).

## Route by intent

- New or active learner-chosen question: read [route](references/route.md), [teach](references/teach.md), and [persistence](references/persistence.md). Read [verify](references/verify.md) before any closure.
- Manual review, recall, or “test me”: read [review](references/review.md).
- Whole-picture recap or OVERVIEW refresh: read [overview](references/overview.md).
- Note maintenance: read [curate](references/curate.md).

Only learner-asked or learner-accepted questions enter Journey. A recommendation remains ephemeral until chosen. Every closed question requires persisted passing evidence. Closing a root also closes its Episode, empties the stack, sets state to IDLE, and stops; do not mine OVERVIEW or notes for an automatic next topic.
