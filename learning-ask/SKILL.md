---
name: learning-ask
description: "Route the learner to the right Learning Suite skill and explain current status or next step without changing learning state."
---

# Learning: Ask

Be the read-only router for the Learning Suite. The learner should not need to remember every skill or understand the internal learning state machine.

## Contract

- Explain what the Learning Suite can do in learner-facing language.
- When a workspace is available and current-schema state can be read safely, inspect only read-only projections such as `learning-view.mjs` / status outputs to recover the current learning position, available Goals, and existing KnowledgeTargets.
- Recommend **one primary next action** when the evidence is clear, with concise alternatives when useful.
- Name the public skill to use next: `$learning-learn`, `$learning-review`, `$learning-practice`, or `$learning-view`.
- Explain the recommendation in terms of the learner's intent: understand something new, retrieve retained knowledge, apply knowledge, or see the desktop learning map.
- Before asserting detailed prerequisites, side effects, or exact behavior of another public skill beyond this routing summary, read that skill's current `SKILL.md`; do not infer its contract from memory.

## Read-only boundary

Never create, update, close, promote, schedule, or otherwise mutate Goal, Root Intent, Episode, Question, Evidence, KnowledgeTarget, ReviewItem, PracticeTask, Notes, or Learning State. Do not run workspace upgrade/migration from this router because migration can mutate persisted state. If the workspace schema is incompatible with a safe read, say that Learning: Learn should recover/upgrade it before routing from persisted state.

Do not invoke another public skill automatically. Routing is a recommendation boundary: tell the learner exactly which skill fits and why, then stop unless the learner explicitly asks you to continue another way.

## User-facing vocabulary

Prefer: **learning goal**, **current question**, **why it matters**, **already learned**, **review**, **practice**, **learning window**, **next step**.

Avoid exposing: Goal IDs, Root Intent IDs, Episode IDs, PUSH/POP, focus stacks, transition intents, and persisted filenames unless the learner asks about internals.
