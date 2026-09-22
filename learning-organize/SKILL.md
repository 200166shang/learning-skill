---
name: learning-organize
description: "Plan, review, approve, and generate coherent Topic articles from pursued Learning Questions."
disable-model-invocation: true
---

# Learning: Organize

Questions preserve how learning happened. Topics preserve the current best way to
explain what was learned. Preserve the reasoning spine; remove conversational
redundancy.

Use a Topic Compass to separate structural judgment from article generation:

`Questions → PLAN → REVIEW → APPROVE → GENERATE`

The approved Compass is the content contract for every generated Topic. Generation may
execute that contract in small batches, but must not silently re-plan it.

## Choose the operation

- `plan`: create or revise a Topic Compass from the scoped Questions. Use this when no
  approved Compass exists, the learner wants different boundaries, or new Questions
  should change the organization.
- `approve`: freeze the reviewed Compass for generation. Clear approval such as “这个
  规划可以” is sufficient; do not ask for a second confirmation.
- `generate all`, `generate t004`, or `generate t001-t003`: generate only the requested
  Topics from an approved Compass.

If the learner invokes `$learning-organize` without naming an operation, continue the
obvious unfinished stage. Otherwise start with `plan`. Never plan and generate articles
in the same turn.

## Plan and review the Compass

Read `thread.yaml` and the full content of every scoped `questions/*.md` note. Titles
alone are insufficient. If the intended Questions are materially ambiguous, ask one
focused scope question.

When an Organization exists, also read `organized/organize.yaml`,
`organized/compass.md`, and relevant current Topics. Use this source priority:

1. the learner's current instruction;
2. original Question notes;
3. the existing Compass and Topics.

Existing Topics are a replaceable previous explanation, never a new source-of-truth
layer.

Discover Topic boundaries from explanatory coherence: one mechanism viewed from
several angles, concept-to-implementation, input-to-output, cause-to-result, an
end-to-end chain, or later learning that repairs earlier understanding. Prefer causal
reading order over Question ID or conversation chronology. Recommend the number of
Topics supported by these boundaries; do not target an arbitrary count.

Create or revise only these planning artifacts:

```text
organized/
  compass.md
  organize.yaml
```

Write `compass.md` as the learner-facing map. Show `Status: draft` or
`Status: approved`, then the proposed Topic count and main organizing rationale. For
every Topic show:

- provisional `tNNN` ID and title;
- the larger question or learning purpose;
- source Question IDs;
- content that must be included;
- content that is explicitly excluded or deferred;
- how it connects to neighboring Topics.

Write the same boundaries as the machine-readable execution plan:

```yaml
version: 1
status: draft
organization:
  title: <human-readable title>
topics:
  t001:
    title: <Topic title>
    purpose: <larger question or learning goal>
    questions:
      - q001
      - q004
    include:
      - <required mechanism or connection>
    exclude:
      - <boundary delegated elsewhere or intentionally omitted>
    file: topics/t001.md
order:
  - t001
```

Topic IDs are fresh and sequential in proposed reading order. A Question may support
multiple Topics. Important scoped Questions should normally appear at least once;
explicitly identify any omission and why it does not contribute.

Present the complete Compass in the conversation and ask the learner to review the
count, grouping, names, order, Question placement, includes, and exclusions. Stop after
planning. On feedback, update the draft Compass and execution plan only; do not create
or rewrite Topic articles.

## Approve and freeze

Approval changes `status` from `draft` to `approved` and makes `compass.md` agree with
the final plan. Treat the approved `organize.yaml` as the sole structural authority for
generation.

When approval replaces an older Organization, remove the old `organized/topics/`
articles so files from incompatible Compass boundaries cannot remain current. Report
that the approved Compass is ready and show the available generation scopes. Do not
generate a Topic unless the learner also makes a separate generation request.

## Generate from the approved Compass

Refuse to generate while `status` is not `approved`; direct the learner back to review
or approval. Resolve `all`, one ID, a range, or an explicit ID list against `order`.
Reject unknown IDs instead of inventing Topics.

Before writing, read and apply the complete [Topic quality
contract](references/topic-quality.md). For each requested Topic independently:

1. Read its `title`, `purpose`, `questions`, `include`, `exclude`, and `file` from the
   approved plan.
2. Read the full referenced Question notes. Use them as the primary source; read another
   Question only for a small bridge that is necessary to make the article coherent.
3. Write one independently readable article that covers every material `include` item
   and does not expand the `exclude` items.
4. It may briefly reference another Topic, but must not duplicate that Topic's detailed
   explanation.
5. Do not change the Compass, move Questions, alter Topic boundaries, add Topics, or
   redesign the Organization during generation. If the contract is genuinely flawed,
   stop and recommend returning to `plan`.

Write only the requested files under `organized/topics/`. Existing files generated from
the same approved Compass may remain. This makes `generate t004`, `generate t001-t003`,
and `generate all` safe, repeatable execution units suitable for a lower-reasoning
model.

## Validate

After planning or approval, confirm:

- `organize.yaml` parses and matches `compass.md`;
- every `order` entry has a complete Topic contract;
- every cited Question exists in `thread.yaml`;
- important scoped Questions are covered or their omission is explained;
- Topic boundaries have no clear merge, split, ordering, or duplication defect.

After generation, additionally confirm:

- every requested Topic file exists at the planned path;
- its required `include` items are materially covered and `exclude` items are not
  expanded;
- the article passes the Topic quality contract;
- generated Topics do not substantially duplicate one another;
- `organize.yaml`, `compass.md`, `thread.yaml`, and `questions/*.md` are semantically
  unchanged during generation.

Topics are replaceable projections, not permanent knowledge nodes. Re-planning always
returns to the durable Questions and produces one new current Compass; never create
Topic groups, meta-Topics, archives, version fields, or `organized-v2/`. Git provides
history.

Learn naturally first. Organize understanding later. Synthesize learned understanding;
do not invent a curriculum.
