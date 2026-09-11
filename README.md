# Learning Skill Suite

A small, evidence-backed personal learning runtime for Codex with a discoverable skill surface.

## Public skills

### User-invoked

These are deliberate learning phase choices. The learner enters them explicitly; `Learning: Ask` is the one router to remember when unsure.

```text
$learning-ask       I do not know which learning mode to use or what to do next.
$learning-learn     I want to understand a question or broad topic.
$learning-review    I want to retrieve and verify something I learned before.
$learning-practice  I want to apply learned knowledge through coding/debugging/design.
```

### Model-invoked (also directly user-reachable)

```text
$learning-view      Open/focus/pin the native desktop Learning Companion.
```

`Learning: View` may be reached automatically from natural requests such as “open the learning window” because it is a read-only UI action rather than a learning phase decision.

The learner does **not** operate internal state-machine phases directly. `Learning: Ask` may perform a read-only source survey and recommend candidate starting questions; accepted-question persistence, recursive prerequisite descent, verification, return-to-parent, and runtime transitions stay inside `Learning: Learn`.

## User workflow

When you are unsure, start with:

```text
$learning-ask I have notes and a repository but I do not know where to start.
```

For a fresh idle workspace, this inspects the supplied material without creating learning state, offers one to three candidate root questions, and waits for a choice. Continue with the exact accepted candidate in `Learning: Learn`; only then does it become visible as the root in the Learning Map.

For a concrete question:

```text
$learning-learn I want to understand why PWM can control motor speed.
```

For a broad topic plus sources:

```text
$learning-learn I need to learn the robot LLM module from these notes, repository, and transcripts. I do not yet know what questions to ask; I need to explain the concepts, source code, and complete chain in an interview.
```

For a document-first learning flow:

```text
$learning-learn First build a complete source-grounded knowledge map in my learning workspace. Then teach and verify me against that document.
```

This creates or updates the written artifact before teach-back questions. The document supports learning but does not count as mastery evidence or close the active question.

After a learning question is closed, Review and Practice are explicit phase boundaries rather than hidden automatic mode switches:

```text
$learning-review Test whether I still understand the MCU/Linux control boundary.
$learning-practice Give me a debugging task that applies this KnowledgeTarget.
```

For the native learning map, natural language is enough when model invocation is available:

```text
Open the learning window for this workspace and keep it on top.
```

Direct `$learning-view` invocation remains available too.

## Learning runtime

`Learning: Learn` keeps the durable models separate:

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

Internally the finite learning loop is:

```text
PUSH → LEARN → VERIFY → POP → RESUME → root VERIFY → IDLE
```

Those terms are implementation vocabulary for the agent/runtime, not commands the learner must remember.

## Install or update

```bash
./install.sh
```

The installer places the five public skills under `~/.codex/skills`, installs the shared deterministic runtime, and builds a packaged Desktop Learning Companion at `~/.codex/skills/_learning-viewer/Learning Companion.app`. Compilation happens during updates; normal launches reuse the prebuilt app and wait for its first successful projection.

## Desktop Learning Companion

The native Tauri window shows Goal → Root → recursive Question relationships and refreshes from the canonical read-only JSON projection. Select a node to see why it is needed, its resume checkpoint, and its return destination. The Pin control keeps the window above Codex or other apps.

`Learning: View` is only an adapter for opening/focusing/pinning this application. The viewer never becomes routing authority and never mutates Learning state.

Manual development launch from this repository remains available:

```bash
npm ci --prefix _shared
npm install --prefix viewer
npm run viewer -- --workspace /path/to/learning/workspace
```

Optionally select a Goal at launch with `--goal g001`.

## Internal runtime commands

These are for implementation/debugging, not the normal learner interface:

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

`_shared/knowledge-note.md` is the current KnowledgeNote contract. Journey owns learning provenance, Evidence owns demonstrated understanding, and notes never prove mastery or route the next question.
