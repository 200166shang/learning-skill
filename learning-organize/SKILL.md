---
name: learning-organize
description: "Reorganize completed learning into coherent Topic articles after the learner approves a proposed structure."
---

# Learning Organize

Turn already-pursued questions into the current best derived reading structure. Questions preserve how learning happened; Topics preserve the current best way to explain what was learned.

Topics are replaceable projections, not permanent knowledge nodes. Re-running this Skill replaces the current `organized/` projection directly: `Q → current T`, never `Q → T → U`. Topic IDs and boundaries may be reassigned from `t001` on every approved rebuild; Git provides history.

Work in exactly two user-visible phases:

`READ → DISCOVER → PROPOSE → stop`  
`approved proposal → WRITE → VALIDATE`

## Phase 1: propose without mutation

1. Run `node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>` before persisted reads. Continue when no upgrade is needed. If it upgrades, report the recovered position and stop; if it errors, fail closed.
2. Establish the scope from the learner's request. If several Episodes exist and the intended set is materially ambiguous, ask which Episodes to organize. Otherwise use the clearly relevant Episode or Episodes.
3. Read every scoped question in `.learning/journey.yaml`, then read the full content of all referenced `notes/*.md`. Read relevant `.learning/evidence.yaml` entries when they contain corrections, demonstrated connections, or misconceptions that affect the final explanation. Titles alone are insufficient.
4. When `organized/` exists, also read its manifest and every current Topic. Use this source priority: the learner's current instruction, original Questions and their Notes, then current Topics. Current Topics are useful evidence of the previous organization, never a new source-of-truth layer.
5. Discover Topic boundaries from explanatory coherence: one mechanism viewed from several angles, concept-to-implementation, input-to-output, cause-to-result, an end-to-end chain, or later learning that repairs earlier understanding. Prefer causal reading order over question ID or conversation chronology.
6. Propose a complete replacement Organization in the conversation. When reorganizing, summarize material changes from the current Topics. For every proposed Topic include:
   - provisional `tNNN` ID and title;
   - source question IDs;
   - the larger question it answers;
   - why the material belongs together;
   - how it connects to the preceding and following Topics.
7. Ask the learner to accept or adjust the grouping, names, order, and question placement, then stop. Create or change no files in this phase.

## Phase 2: write the approved Organization

Treat clear approval and requested adjustments as authorization to write; do not request a second confirmation. Before writing any Topic, read and apply the complete [Topic quality contract](references/topic-quality.md).

Create or coherently replace only:

```text
organized/
  organize.yaml
  topics/
    t001.md
    t002.md
```

Use this manifest shape and no runtime or ontology fields:

```yaml
version: 1
organization:
  title: <human-readable title>
topics:
  t001:
    title: <Topic title>
    file: topics/t001.md
    questions:
      - q001
      - q004
order:
  - t001
```

Topic IDs are fresh and sequential in reading order. A question may support multiple Topics. Important scoped questions should normally appear at least once; explicitly report any omitted question and why it does not contribute. The manifest records provenance, not ownership, identity history, or learning state.

Write each Topic from the source understanding as a newly reconstructed, independently readable explanation:

- organize around the larger mechanism rather than headings for each source question;
- establish its overall mental model early, then explain the parts and reconnect the whole;
- preserve the reasoning spine while removing conversational redundancy;
- connect input, transformation, intermediate representation, and output when supported;
- when source code was studied, connect the mechanism to its implementation without becoming a line-by-line walkthrough;
- add only small bridges required for coherence.

Synthesize learned understanding; do not invent a curriculum. Topic count follows coherent boundaries, not a compression target. A Topic succeeds only when it adds integration value beyond concatenating or summarizing its source Questions.

Regenerate `organized/organize.yaml` and the complete `organized/topics/` set as one coherent projection. Remove obsolete Topic files that are absent from the approved replacement so `organized/` contains only the current Organization. Do not create Topic groups, meta-Topics, archives, version fields, or parallel directories such as `organized-v2/`.

## Validate

Before reporting completion, confirm all of the following:

- `organize.yaml` parses and every `order` entry and Topic file agrees;
- every cited question exists in Journey and every important scoped question is covered or its omission is explained;
- Topic articles form a coherent reading sequence, retain important reasoning, and avoid Q-by-Q concatenation;
- every Topic passes every material check in the Topic quality contract, and cross-Topic review finds no clear merge, split, ordering, prerequisite, or duplication defect;
- `.learning/journey.yaml`, `.learning/evidence.yaml`, `.learning/state.yaml`, `notes/`, and `OVERVIEW.md` are semantically unchanged.

Learn naturally first. Organize understanding later. If the learner dislikes the result or learns more, run this same Skill again and replace the projection from the durable learning sources.
