---
name: learning-organize
description: "Reorganize pursued Learning Questions into coherent Topic articles after the learner approves a proposed structure."
disable-model-invocation: true
---

# Learning: Organize

Questions preserve how learning happened. Topics preserve the current best way to
explain what was learned.

Turn Question notes from a V6 Learning Thread into a coherent current reading
structure. Topics are replaceable explanatory projections, not permanent knowledge
nodes: `Questions → current Topics`, never `Questions → Topics → another semantic
layer`. A later reorganization replaces `organized/`; Git provides history.

Work in exactly two user-visible phases:

`READ → DISCOVER → PROPOSE → stop`

`approved proposal → WRITE → VALIDATE`

## Phase 1: propose without mutation

1. Establish the scope from the learner's request. Read `thread.yaml` and the full
   content of every scoped `questions/*.md` note. Titles alone are insufficient. If the
   intended Questions are materially ambiguous, ask one focused scope question.
2. When `organized/` exists, also read `organized/organize.yaml` and every current Topic.
   Use this source priority: the learner's current instruction, original Question notes,
   then current Topics. Existing Topics are a useful previous explanation, never a new
   source-of-truth layer.
3. Discover Topic boundaries from explanatory coherence: one mechanism viewed from
   several angles, concept-to-implementation, input-to-output, cause-to-result, an
   end-to-end chain, or later learning that repairs earlier understanding. Prefer causal
   reading order over Question ID or conversation chronology.
4. Propose a complete replacement Organization in the conversation. When reorganizing,
   summarize material changes from the current Topics. For every proposed Topic include:
   - provisional `tNNN` ID and title;
   - source Question IDs;
   - the larger question it answers;
   - why the material belongs together;
   - how it connects to the preceding and following Topics.
5. Ask the learner to accept or adjust the grouping, names, order, and Question
   placement, then stop. Create or change no files in this phase.

## Phase 2: write the approved Organization

Treat clear approval and requested adjustments as authorization to write; do not ask
again. Before writing, read and apply the complete [Topic quality
contract](references/topic-quality.md).

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

Topic IDs are fresh and sequential in reading order. A Question may support multiple
Topics. Important scoped Questions should normally appear at least once; explicitly
report any omitted Question and why it does not contribute. The manifest records
provenance, not ownership, identity history, or learning state.

Write each Topic as a newly reconstructed, independently readable explanation:

- organize around the larger mechanism rather than headings for each Question;
- establish the overall mental model early, explain the parts, then reconnect the whole;
- preserve the reasoning spine while removing conversational redundancy;
- connect input, transformation, intermediate representation, and output when supported;
- connect concepts to implementation when source code matters, without becoming a
  line-by-line walkthrough;
- add only small bridges required for coherence.

Synthesize learned understanding; do not invent a curriculum. Topic count follows
coherent boundaries, not a compression target. A Topic succeeds only when it adds
integration value beyond concatenating or summarizing its source Questions.

Regenerate `organized/organize.yaml` and the complete `organized/topics/` set as one
projection. Remove obsolete Topic files absent from the approved replacement. Do not
create Topic groups, meta-Topics, archives, version fields, or parallel directories
such as `organized-v2/`.

## Validate

Before reporting completion, confirm:

- `organize.yaml` parses and every `order` entry and Topic file agrees;
- every cited Question exists in `thread.yaml`, and every important scoped Question is
  covered or its omission is explained;
- Topic articles form a coherent reading sequence, retain important reasoning, and
  avoid Question-by-Question concatenation;
- every Topic passes the material checks in the Topic quality contract, and cross-Topic
  review finds no clear merge, split, ordering, prerequisite, or duplication defect;
- `thread.yaml` and `questions/*.md` are semantically unchanged.

Learn naturally first. Organize understanding later. If the learner dislikes the
result or learns more, run this Skill again and replace the projection from the durable
Question notes.
