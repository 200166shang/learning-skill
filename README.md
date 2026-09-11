# Learning Skill V7

A small, evidence-backed personal learning runtime for Codex, exposed as `$learning`, `$review`, and `$practice`.

```text
learner question → Episode → PUSH / LEARN / VERIFY / POP / RESUME
                                  ↓
                         root teach-back → CLOSED → IDLE

topic + goal + sources → ORIENT → candidate roots → learner accepts and chooses
                                                        ↓
                                                     Episode
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
  targets.yaml     stable reusable KnowledgeTarget identities
  goals.yaml       optional LearningGoals, source refs, and accepted Root Intents
notes/*.md         reusable knowledge
OVERVIEW.md        optional whole-picture projection
```

Only questions the learner asks or accepts are durable. A question closes only with passing verification evidence. A root pass creates one stable KnowledgeTarget, closes the Episode, and returns the workspace to IDLE. Closed children are promoted only explicitly. OVERVIEW may describe knowledge boundaries but cannot start or route learning.

`_shared/knowledge-note.md` is the single current KnowledgeNote contract. Journey owns learning provenance, Evidence owns demonstrated understanding, and notes never prove mastery or route the next question.

V7 intentionally has no Web observer, generated learning map, database, automatic review scheduler, or numeric mastery model.

## Commands

```bash
node _shared/scripts/upgrade-learning-workspace.mjs <workspace>
node _shared/scripts/learning-status.mjs <workspace>
node _shared/scripts/learning-transition.mjs <workspace> < intent.json
node _shared/scripts/learning-goal.mjs <workspace> < intent.json
node _shared/scripts/learning-view.mjs --workspace <workspace> --format text|json|mermaid
node _shared/scripts/learning-view.mjs --workspace <workspace> --goals|--goal g001 --format text|json
node _shared/scripts/learning-view.mjs --workspace <workspace> --map [--goal g001]
node _shared/scripts/review.mjs <workspace> < intent.json
node _shared/scripts/review.mjs <workspace> due <ISO-now> [target-id]
node _shared/scripts/practice.mjs <workspace> < intent.json
npm test --prefix _shared
```

Question-first stays direct: `$learning I want to understand why PWM can control motor speed.`

Topic-first also works: `$learning I need to learn the robot LLM module from these notes, repository, and transcripts. I don't yet know what questions to ask; I need to explain the concepts, source code, and complete chain in an interview.` The skill selectively orients to the sources, proposes a few roots, persists only accepted roots, and starts only the root the learner chooses.

## Desktop Learning Companion

Install the optional desktop dependencies once, then start the read-only companion for a Learning workspace:

```bash
npm ci --prefix _shared
npm install --prefix viewer
npm run viewer -- --workspace /path/to/learning/workspace
```

Optionally select a Goal at launch with `--goal g001`. When no Goal is supplied, the companion derives it only from an active Episode; while idle it offers the available Goals without changing Learning state.

The native Tauri window shows the Goal → Root → recursive Question tree and refreshes every 750 ms. Select a node to see why it is needed, its resume checkpoint, and its POP destination. The Pin button keeps the window above Codex or other apps.

The companion is strictly a display adapter. It reads the canonical JSON projection from the existing Node runtime; all Learning mutations still happen through `$learning`, and the desktop app remains optional.
