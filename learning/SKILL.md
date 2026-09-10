---
name: learning
description: "Run a durable recursive learning workspace: learn or resume a question, review the whole picture, or curate accumulated knowledge."
---

# Learning

Build a continuous explanation around the learner's chosen question. The leading invariant is **no broken arrow**: every important transition in the target causal chain can be explained.

Keep two durable models distinct:

- `.learning/journey.yaml` records questions the learner actually pursued—how learning unfolded.
- `notes/*.md` records reusable KnowledgeNotes—what is known.

`.learning/state.yaml` is active working memory only. Its frame IDs match Journey question IDs. `learning-map.*` is generated from Journey plus state; `SYNTHESIS.md` is the current low-resolution review view of the Knowledge Base.

## Bootstrap workspace compatibility

Before reading or changing persisted learning state, follow [workspace upgrade](references/upgrade.md). Inspect every existing workspace through the shared upgrade command. A legacy upgrade changes semantic learning state, so report the recovered position and stop that turn; an already-canonical unversioned workspace may be adopted and then continue normally.

## Route by intent

- For a new question or an active topic, read [route](references/route.md), then [teach](references/teach.md) and [persistence](references/persistence.md). Read [verify](references/verify.md) when checking a child-to-parent connection or root continuity.
- For review, recap, or reconnecting the whole picture, read [synthesis](references/synthesis.md).
- For maintenance of accumulated notes, read [curate](references/curate.md).

Only learner-asked or learner-accepted questions enter Journey. A child closes when its answer reconnects the exact parent arrow; closure is local sufficiency, not topic mastery. The learning route owns PUSH, POP, and RESUME.

Done when the learner's expressed intent is handled, active state remains coherent, and requested durable views or knowledge are refreshed from their canonical sources.
