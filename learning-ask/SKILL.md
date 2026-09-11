---
name: learning-ask
description: "Route the learner to the right Learning Suite skill and explain current status or next step without changing learning state."
disable-model-invocation: true
---

# Learning: Ask

Be the read-only router for the Learning Suite. The learner should not need to remember every skill or understand the internal learning state machine.

## Contract

- Explain what the Learning Suite can do in learner-facing language.
- When a workspace is available and current-schema state can be read safely, inspect only read-only projections such as `learning-view.mjs` / status outputs to recover the current learning position, available Goals, and existing KnowledgeTargets.
- Recommend **one primary next action** when the evidence is clear, with concise alternatives when useful.
- For a fresh idle workspace and a broad objective with supplied sources, perform the read-only orientation below before recommending `Learning: Learn`.
- Route by learner intent: understand something new with `$learning-learn`, retrieve retained knowledge with `$learning-review`, apply knowledge with `$learning-practice`, or open the desktop learning map with `$learning-view`.
- Before asserting detailed prerequisites, side effects, or exact behavior of another public skill beyond this routing summary, read that skill's current `SKILL.md`; do not infer its contract from memory.

## Read-only boundary

Never create, update, close, promote, schedule, or otherwise mutate Goal, Root Intent, Episode, Question, Evidence, KnowledgeTarget, ReviewItem, PracticeTask, Notes, or Learning State. Do not run workspace upgrade/migration from this router because migration can mutate persisted state. If the workspace schema is incompatible with a safe read, say that Learning: Learn should recover/upgrade it before routing from persisted state.

Do not invoke another public skill automatically. Routing is a recommendation boundary: tell the learner exactly which skill fits and why, then stop unless the learner explicitly asks you to continue another way.

## Fresh broad-topic orientation

Use this branch only when the workspace is empty or safely known to be IDLE, the learner supplied sources, and they cannot yet name a useful concrete question.

1. Survey source structure without writing learning state: filenames, headings, entry points, imports, and chapter titles. Selectively deepen only enough to identify the subject's role, boundaries, and end-to-end chain. State unavailable-source uncertainty.
2. Give a compact objective restatement, provisional source-grounded picture, source-role map, and normally 1–3 candidate root questions. Candidates are ephemeral: do not create a Goal, Root Intent, Episode, or Question while presenting them.
3. Ask the learner to accept or choose a candidate. If they choose one, route that exact accepted wording and the source context to `$learning-learn`; do not start it from this router. If they accept several without choosing which to start, show the accepted set and ask them to select one, without persisting it.

For an active workspace, recommend resuming the persisted current question instead of replacing it with fresh candidates. For an idle workspace that already has accepted pending roots, show those before proposing new candidates.

## User-facing vocabulary

Prefer: **learning goal**, **current question**, **why it matters**, **already learned**, **review**, **practice**, **learning window**, **next step**.

Avoid exposing: Goal IDs, Root Intent IDs, Episode IDs, PUSH/POP, focus stacks, transition intents, and persisted filenames unless the learner asks about internals.
