---
name: learning-learn
description: "Understand one learner-chosen question or broad topic through recursive, evidence-backed learning and verification."
disable-model-invocation: true
---

# Learning: Learn

Help the learner close one question they chose. The invariant is **no broken arrow**: repair only the smallest causal gap needed to continue the learner's chosen explanation.

The finite internal loop is `PUSH → LEARN → VERIFY → POP → RESUME → root VERIFY → IDLE`. These are runtime concepts, not learner commands. Speak instead about the **current question**, **why it matters**, a **blocking prerequisite**, returning to the **main line**, and **what happens next**.

## Learner interaction contract

Keep the learner oriented at meaningful boundaries without turning every turn into a status report:

- **Broad topic / source set:** say you will first build a lightweight whole-picture view and offer a few worthwhile starting questions. Read [orientation](references/orient.md) before creating or starting anything for this branch.
- **Document-first request:** when the learner wants a complete written map before discussion or verification, read [document-first workflow](references/document-first.md). Produce the artifact first, then teach and verify against it while preserving the active question.
- **Concrete question:** restate it briefly and begin directly; do not force orientation.
- **Resume:** state the current question and the causal reason it is on the path before continuing.
- At a meaningful transition, explain the current question, why it matters, and what happens next in learner-facing language.

When the learner asks where they are, why the current question matters, or what happens next, answer from persisted read-only state in plain language.

## Execution spine

Read [runtime mechanics](references/runtime.md) before the first persisted read or write in a workspace. Runtime mechanics own schema recovery, state inspection, mutation commands, IDs, atomic persistence, and read-only projections.

1. Resolve the active question. If the workspace is idle, start only a learner-chosen concrete root or a root selected through the orientation branch.
2. **LEARN:** give the smallest causal explanation that repairs the current arrow. Repair tiny gaps inline and answer side branches without changing focus.
3. When a real blocking gap appears, explain why it blocks the current arrow and propose it. **PUSH** only after the learner asks or accepts that child question, persisting one child with `parent_id`, `why_needed`, and the exact `resume_checkpoint`.
4. When the current question may be ready to close, read [verification](references/verify.md). Failed or uncertain verification leaves the question open.
5. On child pass, persist passing Evidence, close only that child, **POP**, explain what was repaired, and **RESUME** its parent at the saved checkpoint. A closed child remains Journey-only by default; promote it only when it became independently reusable knowledge.
6. On root pass, only after focus has returned to the root and no blocking child remains, persist passing Evidence, create exactly one root KnowledgeTarget, close the root and Episode, return State to **IDLE**, report that the chosen question is closed, and stop. Review and Practice are optional later phases, never automatic continuation.

Only learner-asked or learner-accepted questions enter Journey; recommendations remain ephemeral until chosen. Every closed question requires persisted passing Evidence.

Do not mine Notes or OVERVIEW for an automatic next topic after completion.

## Conditional references

- **Topic-first orientation:** read [orientation](references/orient.md) only when the learner has a broad objective/source set but no useful concrete question yet.
- **Document-first workflow:** read [document-first workflow](references/document-first.md) when the learner asks for a knowledge map, study guide, architecture document, or written source synthesis before questioning.
- **Runtime/state operations:** read [runtime mechanics](references/runtime.md) at the first persisted read/write, after context loss, or when state recovery/inspection is needed.
- **Verification:** read [verification](references/verify.md) only when a child/root may close or a verification attempt must be recorded.
- **KnowledgeNote work:** read [persistence](references/persistence.md) only when creating, reusing, revising, or reconciling a KnowledgeNote.
- **Teaching adaptation:** read [teaching tactics](references/teach.md) only for concept gates, hint independence, repeated explanation failure, or a modality change.
- **Whole-picture recap:** read [overview](references/overview.md) only when the learner requests a recap/OVERVIEW refresh.
- **Approved note maintenance:** read [curate](references/curate.md) only for explicit curation work.

For retained-knowledge review, direct the learner to `Learning: Review` (`/learning-review`). For coding/debugging/design application, direct them to `Learning: Practice` (`/learning-practice`). Those skills own their own state.
