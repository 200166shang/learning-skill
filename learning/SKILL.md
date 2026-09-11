---
name: learning
description: "Run evidence-backed recursive learning: pursue a learner-chosen question, resume an active episode, review retained understanding, or curate learning notes."
---

# Learning

Help the learner close one question they chose. The leading invariant is **no broken arrow**: repair only the smallest causal gap needed to continue the learner's chosen explanation. The finite loop is:

`PUSH → LEARN → VERIFY → POP → RESUME → root VERIFY → IDLE`

Keep the durable models separate:

- `.learning/journey.yaml`: finite Episodes and questions actually asked or accepted.
- `.learning/evidence.yaml`: verification attempts and misconceptions.
- `.learning/state.yaml`: only `idle | active`, active Episode ID, and focus question IDs.
- `.learning/targets.yaml`: stable reusable KnowledgeTarget identities (`memory | concept | procedure | design`) with Journey provenance.
- `notes/*.md`: reusable knowledge, never proof of mastery.
- `OVERVIEW.md`: a derived whole-picture projection of already-supported knowledge, never routing authority.

At workspace entry, before persisted reads or writes, run `node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>`. Continue immediately when it reports no upgrade needed. If it upgrades, report the recovered position and stop before learning; if it errors, fail closed. Inspect the script or migrations only when migration reasoning is needed.

All active-learning mutations must go through `node ~/.codex/skills/_shared/scripts/learning-transition.mjs <workspace>` with one JSON intent on stdin. Never coordinate Journey, Evidence, and State writes directly. The runtime validates the complete persisted snapshot before and after each transition and owns IDs, PUSH/POP bookkeeping, and atomic persistence.

## Active-learning spine

1. Resolve the active Episode and current focus question through Journey plus State. If State is IDLE, start an Episode only for a learner-chosen root question.
2. **LEARN:** answer with the smallest causal explanation needed to repair the current arrow. Repair small gaps inline, answer side branches without changing the route, and gather missing evidence without changing focus.
3. When a real blocking gap appears, propose or explain it. **PUSH** only after the learner asks or accepts it: append one child to Journey with `parent_id`, `why_needed`, and the exact `resume_checkpoint`, then append only its ID to State.
4. When the current question may be ready to close, enter the verification branch. A failed or uncertain attempt leaves it open.
5. Child pass: persist the evidence, close only that child, **POP** its ID, state how the child repairs the parent arrow, then **RESUME** exactly at the saved checkpoint.
6. Root pass, after the stack has returned to the root and no blocking child remains: supply semantic target metadata to the transition so it persists the evidence, creates exactly one root KnowledgeTarget, closes the root and Episode, clears State to **IDLE**, reports completion, and stops. Never mine Notes or OVERVIEW for an automatic next topic.

Only learner-asked or learner-accepted questions enter Journey; recommendations remain ephemeral until chosen. Every closed question requires persisted passing Evidence.

KnowledgeTargets stay selective: a closed child remains Journey-only by default. Suggest explicit `promote_target` only when that child became independently reusable knowledge; never promote every recursive gap. Target creation or editing must not change the focus stack.

Use `node ~/.codex/skills/_shared/scripts/learning-view.mjs --workspace <workspace> --format text` after context loss, when the learner asks where they are or why the current gap matters, or when recursive depth becomes hard to follow. JSON is available for machine consumers and Mermaid for a bounded local path. The view is read-only and never routing authority; do not run it on every turn or use it to select or create questions.

## Conditional branches

- Read [verification](references/verify.md) only when about to close a child or root, or record a verification attempt that may affect closure.
- Read [persistence](references/persistence.md) only when the turn will create, reuse, or revise a KnowledgeNote, or reconcile Journey `note_refs`.
- Read [teaching tactics](references/teach.md) only when concept gates, hint independence, repeated explanation failure, or a modality change would help.
- For review of an existing KnowledgeTarget, use the independent `$review` skill; Learning does not own ReviewItem or ReviewAttempt state.
- For application through coding, debugging, or design, use the independent `$practice` skill; Learning does not own PracticeTask or PracticeAttempt state.
- For a requested whole-picture recap or OVERVIEW refresh, read [overview](references/overview.md).
- For approved note maintenance, read [curate](references/curate.md).
