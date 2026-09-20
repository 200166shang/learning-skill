# Learning Skills V7

A small, evidence-backed recursive learning system for Codex, exposed as `$learning`, with explicit `$learning-research` and `$learning-organize` companion workflows.

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
research/*.md      optional external-source research notes
organized/         optional replaceable Topic projection
```

Only questions the learner asks or accepts are durable. A question closes only with passing verification evidence. A root pass closes the Episode and returns the workspace to IDLE. OVERVIEW may describe knowledge boundaries but cannot start or route learning.

`_shared/knowledge-note.md` is the single current KnowledgeNote contract. Journey owns learning provenance, Evidence owns demonstrated understanding, and notes never prove mastery or route the next question.

V7 intentionally has no Web observer, generated learning map, database, automatic review scheduler, or numeric mastery model.

## Research from current understanding

Invoke `$learning-research` with the current Question, selected Question IDs, or an Organized Topic. It finds a small set of high-value external sources, explains what to inspect and why it matters now, and identifies potential learning gaps. In a durable workspace it saves a reusable `research/rNNN.md` unless asked not to.

Research suggestions are not Questions. They enter Journey only if the learner later chooses to pursue them through `$learning`; research never changes State, Evidence, Notes, or Organized Topics.

## Organize completed learning

Invoke `$learning-organize` when many pursued questions should be merged, reordered, and rewritten as a few coherent long-form Topics. It first proposes the Topic structure and writes `organized/` only after learner approval.

Journey questions record the durable exploration. Organized Topics are the replaceable current explanation; they do not replace questions, Notes, Evidence, or runtime State. If the current Topics are unsatisfactory, run `$learning-organize` again: it rereads the learning sources and current Topics, proposes a complete replacement, and overwrites the projection after approval rather than creating another layer or version directory.

Each Topic must answer one larger question, show its overall mental model early, preserve the causal reasoning spine, connect concepts to implementation when relevant, and remain understandable without the original Question history.

The public workflows are:

```text
$learning           learn, resume, review, or curate
$learning-research  find external sources and potential gaps
$learning-organize  rebuild the current long-form Topic explanation
```

## Commands

```bash
node _shared/scripts/upgrade-learning-workspace.mjs <workspace>
node _shared/scripts/learning-status.mjs <workspace>
npm test --prefix _shared
```
