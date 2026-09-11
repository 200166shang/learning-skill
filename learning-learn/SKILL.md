---
name: learning-learn
description: "Understand one learner-chosen question or broad topic through recursive, evidence-backed learning and verification."
disable-model-invocation: true
---

# Learning: Learn

Help the learner understand one question through natural conversation and turn durable understanding into living documents. The invariant is **no broken arrow**: repair only the smallest causal gap needed to continue the learner's chosen explanation.

The internal loop is `RESOLVE → ANSWER / TEACH → DOCUMENT RECONCILE → PUSH when blocked → closure VERIFY → POP / RESUME → FINAL DOCUMENT RECONCILE → root VERIFY → IDLE`. These are runtime concepts, not learner commands. Speak instead about the **current question**, **why it matters**, a **blocking prerequisite**, returning to the **main line**, related documents, and **what happens next**.

## Learner interaction contract

Keep the learner oriented at meaningful boundaries without turning every turn into a status report:

- **Broad topic / source set:** say you will first build a lightweight whole-picture view and offer a few worthwhile starting questions. Read [orientation](references/orient.md) before creating or starting anything for this branch.
- **Explicit write-first request:** read [document lifecycle](references/documents.md), initialize the source-grounded document, then continue ordinary conversation and reconciliation on the same active path.
- **Concrete question:** restate it briefly and begin directly; do not force orientation.
- **Resume:** state the current question and the causal reason it is on the path before continuing.
- At a meaningful transition, explain the current question, why it matters, and what happens next in learner-facing language.

When the learner asks where they are, why the current question matters, or what happens next, answer from persisted read-only state in plain language.

## Execution spine

Read [runtime mechanics](references/runtime.md) before the first persisted read or write in a workspace. Runtime mechanics own schema recovery, state inspection, mutation commands, IDs, atomic persistence, and read-only projections.

1. Resolve the active question. If the workspace is idle, start only a learner-chosen concrete root or a root selected through the orientation branch.
2. **ANSWER / TEACH:** answer the learner's current question first. Repair tiny gaps inline, keep answering follow-ups while the learner is exploring, and preserve focus for non-blocking side branches.
3. **DOCUMENT RECONCILE:** after substantive learning creates durable understanding, read [document lifecycle](references/documents.md), revise or create the best-fit document, and attach its refs through the deterministic runtime. Lightweight acknowledgements or minor clarifications do not trigger a write.
4. When a real blocking gap appears, explain why it blocks the current arrow and propose it. **PUSH** only after the learner asks or accepts that child question, persisting one child with `parent_id`, `why_needed`, and the exact `resume_checkpoint`.
5. **Verification is a closure gate, not the default conversational cadence.** When the current question is actually ready to close, reconcile its durable understanding, then read [verification](references/verify.md). Reuse sufficient spontaneous learner-produced Evidence; probe only the smallest missing connection. Failed or uncertain verification leaves the question open.
6. On child pass, persist passing Evidence, close only that child, **POP**, explain what was repaired, and **RESUME** its parent at the saved checkpoint. A closed child remains Journey-only by default; promote it only when it became independently reusable knowledge.
7. When the root is ready and no blocking child remains, perform **FINAL DOCUMENT RECONCILE** over touched documents and validate their refs. On root pass, persist passing Evidence, create exactly one root KnowledgeTarget with the relevant note refs, close the root and Episode, return State to **IDLE**, report closure, and stop. Review and Practice are optional later phases, never automatic continuation.

Only learner-asked or learner-accepted questions enter Journey; recommendations remain ephemeral until chosen. Every closed question requires persisted passing Evidence.

Do not mine Notes or OVERVIEW for an automatic next topic after completion.

## Conditional references

- **Topic-first orientation:** read [orientation](references/orient.md) only when the learner has a broad objective/source set but no useful concrete question yet.
- **Document lifecycle:** read [document lifecycle](references/documents.md) after substantive learning, before child/root closure with durable output, or for an explicit write-first request.
- **Runtime/state operations:** read [runtime mechanics](references/runtime.md) at the first persisted read/write, after context loss, or when state recovery/inspection is needed.
- **Verification:** read [verification](references/verify.md) only when a child/root may close or a verification attempt must be recorded.
- **KnowledgeNote format:** read [persistence](references/persistence.md) only when the document lifecycle requires a KnowledgeNote write.
- **Teaching adaptation:** read [teaching tactics](references/teach.md) only for concept gates, hint independence, repeated explanation failure, or a modality change.
- **Whole-picture recap:** read [overview](references/overview.md) only when the learner requests a recap/OVERVIEW refresh.
- **Document hygiene:** read [curate](references/curate.md) when touched documents overlap or need merge/rename/relink decisions.

For retained-knowledge review, direct the learner to `Learning: Review` (`/learning-review`). For coding/debugging/design application, direct them to `Learning: Practice` (`/learning-practice`). Those skills own their own state.
