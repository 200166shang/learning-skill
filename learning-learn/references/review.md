# Memory Target promotion

Follow this workflow only when stable understanding may be promoted for future
review. Promotion is selective and learner-controlled; it does not turn every note,
question, or completed thread into review material.

## Find the promotion checkpoint

Propose a Memory Target only after its expected connection is already source-supported,
stable, and integrated into the Living Learning Document. A repaired Blocking Gap is
eligible only after its result has been visibly reconnected at its Return Point. Root
closure is also a promotion checkpoint. Do not propose from an active unresolved gap,
an unaccepted orientation candidate, chat-only explanation, or historical notes merely
because they exist.

At one checkpoint, inspect only the integrated connections relevant to the current
turn or the learner's requested scope. Do not scan a workspace to bulk-promote old
notes. A proposal must pass all five tests:

1. **Durable value:** retrieving it later would materially improve reasoning or
   action, beyond a fact that is cheaper to look up.
2. **Forgetting risk:** the learner could plausibly forget or confuse the connection.
3. **Atomic retrieval:** one short prompt checks one causal link, distinction,
   constraint, or procedure in about two minutes or less.
4. **Stable supported answer:** its expected connection is supported and already
   integrated; unresolved, stale, or materially conflicting claims fail this test.
5. **Independent context:** its prompt makes sense outside the original conversation
   without hidden thread context.

Do not promote an entire article or Root Question as one target, a long multi-step
explanation, temporary project detail, wording trivia, or every child merely because
it was pursued. If nothing qualifies, say so briefly and make no Markdown change.

## Propose a small choice

Offer at most three qualifying proposals at one checkpoint. Prefer fewer. Each
proposal contains:

- `提示`: one independently understandable retrieval prompt;
- `目标类型`: `mechanism`, `distinction`, or `application`;
- `应能回忆`: the stable expected connection, not an essay or verbatim answer;
- `来源解释`: a relative link to the precise section in the Living Learning Document;
- `推荐理由`: the durable value and plausible forgetting risk that make it worth
  reviewing.

Show the proposals in the conversation before writing the Review Queue. Ask the
learner to accept, edit, or reject them. Do not infer acceptance from interest or from
the existence of stable notes. When the learner explicitly delegates promotion, make
the same eligibility decisions and state which proposals were accepted on their
behalf.

## Apply the learner's decision

Rejecting a proposal creates no queue entry. When the learner edits a proposal, keep
their prompt and expected-connection wording exactly when it still passes the five
tests. If an edit becomes broad, unsupported, or context-dependent, name the failed
test and ask for a narrower edit instead of silently rewriting it.

On acceptance, resolve the queue path in this order: use an explicitly supplied
`REVIEW.md`; otherwise use `REVIEW.md` at the current Codex workspace root containing
the Living Learning Document. When the document is outside that root or more than one
workspace root is plausible, ask which root owns it before writing. Then look only at
that resolved root-level path:

- If it does not exist, create that one file lazily. Start with `# Review Queue` and
  add the accepted targets; a rejected-only decision never creates it.
- If it exists, update it in place. Do not create a dated, nested, topic-specific, or
  second queue.

Before adding an entry, compare its prompt and expected connection with existing
targets. Two targets are equivalent when correctly answering either prompt necessarily
reconstructs the same one causal link, distinction, constraint, or action without an
extra reasoning step. Shared words or a partially overlapping explanation are not
enough. Equivalent wording is one target even when it came from another thread:

- merge it into the existing section instead of adding another heading;
- preserve every distinct source-thread link in `来源线程`;
- preserve its status, interval stage, next date, and last result;
- when the learner explicitly edited the equivalent prompt or expected connection,
  use that wording while preserving the existing sources and schedule.

For every accepted target, also add or update one concise ordinary Markdown link in
the source Living Learning Document's `记忆目标` section. Compute its destination
relative to that document's directory and the resolved root-level `REVIEW.md`; never
assume `./REVIEW.md` unless the two files are actually siblings. The link lets the
correction workflow find the canonical queue entry without duplicating its mutable
fields. A merged target gets one such link in each distinct source thread; never add a
thread-side link for a rejected proposal. Keep the queue's `来源线程` link and each
thread-side link consistent in the same acceptance checkpoint.

Apply all decisions from one learner reply in one direct `REVIEW.md` edit and one
integrated edit to each source thread whose accepted-target references changed. Report
which targets were added, merged, edited, or rejected and list every changed Markdown
path.

## Keep the queue readable

Use the prompt itself as the level-two heading and target identity. Introduce no
opaque ID, YAML record, sidecar file, database, or hidden scheduling value. A new
accepted target has exactly these visible fields:

```markdown
# Review Queue

## <prompt>
- 状态：active
- 来源线程：[<thread title>](./<thread-path>#<integrated-section>)
- 目标类型：mechanism
- 期待连接：<the supported connection the learner should reconstruct>
- 阶段：1d
- 下次复习：<the next local calendar date, YYYY-MM-DD>
- 上次结果：尚未复习
```

Use this compact source-thread link shape, appending to an existing `记忆目标` section
when present and omitting the section when it would be empty:

```markdown
## 记忆目标

- [<prompt>](<relative-path-to-workspace-REVIEW.md>#<prompt-heading>)
```

Compute the new target's next date as the calendar day after acceptance in the
learner's local timezone. This initial `1d` state is visible queue data. Do not select
due items, evaluate review answers, change stages after outcomes, send reminders, or
add FSRS, scores, streaks, ease factors, and other scheduling behavior in this
promotion workflow.
