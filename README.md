# Learning Skill V7

A small, evidence-backed recursive learning system for Codex, exposed as `$learning`.

```text
learner question → Episode → PUSH / LEARN / VERIFY / POP / RESUME
                                  ↓
                         root teach-back → CLOSED → IDLE
```

## Install or update

```bash
./install.sh
```

## Workspace

```text
.learning/
  workspace.yaml   schema version
  journey.yaml     finite Episodes and pursued questions
  evidence.yaml    verification and misconception evidence
  state.yaml       active Episode and focus ID stack, or IDLE
notes/*.md         reusable knowledge
OVERVIEW.md        optional whole-picture projection
```

Only questions the learner asks or accepts are durable. A question closes only with passing verification evidence. A root pass closes the Episode and returns the workspace to IDLE. OVERVIEW may describe knowledge boundaries but cannot start or route learning.

`_shared/knowledge-note.md` is the single current KnowledgeNote contract. Journey owns learning provenance, Evidence owns demonstrated understanding, and notes never prove mastery or route the next question.

V7 intentionally has no Web observer, generated learning map, database, automatic review scheduler, or numeric mastery model.

## Commands

```bash
node _shared/scripts/upgrade-learning-workspace.mjs <workspace>
node _shared/scripts/learning-status.mjs <workspace>
node _shared/scripts/learning-transition.mjs <workspace> < intent.json
npm test --prefix _shared
```
