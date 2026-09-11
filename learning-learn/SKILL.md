---
name: learning-learn
description: "Use when a learner wants to understand one concrete question or a broad topic through evidence-backed recursive learning, including topic orientation, active-session resume, gap repair, verification, and closure."
---

# Learning: Learn

Help the learner close one question they chose. The leading invariant is **no broken arrow**: repair only the smallest causal gap needed to continue the learner's chosen explanation. The finite internal loop is:

`PUSH → LEARN → VERIFY → POP → RESUME → root VERIFY → IDLE`

These are runtime concepts, not learner commands. In normal conversation, speak in learner-facing language such as **current question**, **why it matters**, **blocking prerequisite**, **back to the main line**, and **what happens next**. Do not expose Goal, Root Intent, Episode, PUSH, POP, focus stacks, or transition jargon unless the learner explicitly asks about internals.

## Learner interaction contract

At meaningful boundaries, keep the learner oriented without turning every turn into a status report:

- **Broad topic / source set:** say that you will first build a lightweight whole-picture view, then offer a small set of worthwhile starting questions. Do not silently start an Episode.
- **Concrete question:** restate the question briefly and begin directly.
- **Resume:** state the current question and the causal reason it is on the path before continuing.
- **Blocking prerequisite:** explain why the gap blocks the current arrow and ask/confirm before descending when a real child question is needed.
- **Child closure:** say what was repaired and explicitly return to the parent explanation.
- **Root closure:** say that the chosen question is now closed and stop. You may mention `Learning: Review` or `Learning: Practice` as optional next phases, but never start them automatically.

When the learner asks where they are, why the current question matters, or what happens next, answer from the persisted state/view in plain language. The learner should not need to understand the state machine to use this skill.

Keep the durable models separate:

- `.learning/journey.yaml`: finite Episodes and questions actually asked or accepted.
- `.learning/evidence.yaml`: verification attempts and misconceptions.
- `.learning/state.yaml`: only `idle | active`, active Episode ID, and focus question IDs.
- `.learning/targets.yaml`: stable reusable KnowledgeTarget identities (`memory | concept | procedure | design`) with Journey provenance.
- `.learning/goals.yaml`: broad learner objectives, source references, and explicitly accepted Root Intents; absent means no Goals.
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

## Topic-first orientation

When State is IDLE and the learner supplies a broad objective plus sources but cannot yet name a useful question, **ORIENT** before starting an Episode:

1. Create or reuse the learner's Goal through `node ~/.codex/skills/_shared/scripts/learning-goal.mjs <workspace>`. Store source references only.
2. Survey cheap structure first: filenames, headings, entry points, imports, and chapter titles. Selectively deepen only enough to identify the module's role, execution entry, boundaries, and end-to-end chain. State unavailable-source uncertainty.
3. Give a compact goal restatement, provisional source-grounded system picture, source-role map, and normally 1–3 candidate Root Questions. Candidates remain ephemeral.
4. Persist only questions the learner explicitly accepts, using one `add_roots` command. If several are accepted without a selection, show them and stop at the selection boundary.
5. Start only the Root Intent the learner explicitly chooses, using the normal transition with `{"type":"start","goalId":"gNNN","rootIntentId":"rqNNN",...}`. The runtime resolves its stored wording and atomically links the Episode.

If the learner already supplies a concrete root question, use the question-first fast path. Do not force Orientation, create a Goal, or turn several roots into one Episode. After a Goal-backed Episode closes, pending roots may be shown but none is automatically selected.

KnowledgeTargets stay selective: a closed child remains Journey-only by default. Suggest explicit `promote_target` only when that child became independently reusable knowledge; never promote every recursive gap. Target creation or editing must not change the focus stack.

Use `node ~/.codex/skills/_shared/scripts/learning-view.mjs --workspace <workspace> --format text` after context loss, when the learner asks where they are or why the current gap matters, or when recursive depth becomes hard to follow. Use `--goals` to list Goals and `--goal gNNN` to recover accepted roots plus the active recursive path. JSON is available for machine consumers and Mermaid for a bounded local path. The view is read-only and never routing authority; do not run it on every turn or use it to select or create questions.

## Conditional branches

- Read [verification](references/verify.md) only when about to close a child or root, or record a verification attempt that may affect closure.
- Read [persistence](references/persistence.md) only when the turn will create, reuse, or revise a KnowledgeNote, or reconcile Journey `note_refs`.
- Read [teaching tactics](references/teach.md) only when concept gates, hint independence, repeated explanation failure, or a modality change would help.
- For review of an existing KnowledgeTarget, use the independent `$learning-review` skill; Learning: Learn does not own ReviewItem or ReviewAttempt state.
- For application through coding, debugging, or design, use the independent `$learning-practice` skill; Learning: Learn does not own PracticeTask or PracticeAttempt state.
- For a requested whole-picture recap or OVERVIEW refresh, read [overview](references/overview.md).
- For approved note maintenance, read [curate](references/curate.md).
