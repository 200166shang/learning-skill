# Memory Target promotion and due review

Use the promotion workflow when stable understanding may be promoted for future
review. Use the due-review workflow only when the learner explicitly asks to review;
never start review in the background or during ordinary learning. Both workflows use
the workspace's single canonical `REVIEW.md`. Promotion is selective and learner-
controlled; it does not turn every note, question, or completed thread into review
material.

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

## Review due targets

Enter this workflow only through an explicit review request to the same public skill.
Resolve the queue path just as promotion does: prefer an explicitly supplied
`REVIEW.md`; otherwise use the root-level `REVIEW.md` in the current Codex workspace.
If no queue exists, say that there are no due targets and stop. If the queue owner is
ambiguous, ask which workspace root owns it before reading or writing a queue.

### Select one eligible target

Use the learner's current local calendar date. Read queue sections in their physical
file order and consider only targets that meet every condition:

- `状态` is exactly `active`;
- `下次复习` is a valid `YYYY-MM-DD` date equal to or earlier than today;
- the target is not already known to depend on stale or contradicted understanding.

Targets marked `needs-revision`, `retired`, stale, or contradicted are ineligible
until their source understanding is repaired. Do not scan source threads merely to
look for staleness during review; use the visible queue state and corrections already
known in the current context. Among eligible targets, select the oldest
`下次复习`; when dates tie, preserve file order. A request for a particular target may
override normal selection only when that target is eligible, unless the learner is
asking to repair it rather than review it.

Activate only that one target. Show its heading prompt and only context needed to
understand the question. Do not reveal `期待连接`, quote the source explanation, or
show any other answer-bearing field before the learner attempts retrieval. Wait for
the attempt before evaluating it; never batch several prompts into one turn.

If no target is eligible and due, report that plainly and include the earliest future
`下次复习` when one exists. Stop without inventing a filler question, reusing a future
target, or changing Markdown.

### Evaluate after retrieval

After the learner attempts the prompt, compare the substance of the response with
`期待连接`, not exact wording. Then reveal the expected connection as needed, give at
most one concise repair, and use exactly one of these plain-language results:

| Result | Queue update from the local result date |
|---|---|
| `未想起` | Repair the missing connection now; set `状态` to `active`, reset `阶段` to `1d`, set `下次复习` to the next local calendar day, and set `上次结果` to `<date>，未想起`. |
| `费力想起` | Keep `状态` as `active` and repeat the current `阶段`; set `下次复习` to the result date plus that stage's interval, and set `上次结果` to `<date>，费力想起`. |
| `顺利想起` | Keep `状态` as `active`, advance `阶段` one step, and set `下次复习` to the result date plus the new stage's interval; set `上次结果` to `<date>，顺利想起`. At `90d`, stay at `90d` and schedule another 90 days. |
| `需要修订` | Set `状态` to `needs-revision`, preserve `阶段`, set `下次复习` to `—`, and set `上次结果` to `<date>，需要修订`; stop reviewing this target until its source understanding is repaired. |

The only valid ladder is `1d → 3d → 7d → 14d → 30d → 90d`. Calculate dates as
local calendar dates from the day the result is recorded, never from the old due date;
overdue time adds no penalty. If the visible stage is not on this ladder or a required
field is malformed, do not guess: name the queue damage and ask the learner to repair
it before rescheduling that target.

Write the current target's `状态`, `阶段`, `下次复习`, and `上次结果` together in one
direct `REVIEW.md` edit, leaving every other target and source-thread file unchanged.
A merely forgotten connection is repaired in the review conversation and queue; it
does not reopen or edit the Learning Thread. Use the correction workflow only when
the stored prompt, expected connection, or source understanding itself is stale,
ambiguous, or contradicted.

### Suspend, repair, and re-enter

When correction finds stale, contradicted, or otherwise unstable understanding,
suspend the same canonical queue entry with `状态` set to `needs-revision` and
`下次复习` set to `—`; preserve its source links, visible `阶段`, and `上次结果`.

That target may re-enter only after the correction workflow has made its expected
connection stable, supported, and consistent with its source thread. At that
checkpoint, update the same entry—never a sidecar or duplicate—with `状态` set to
`active` and the repaired `期待连接`. Preserve its sources, stage, and last result;
set `下次复习` from the local repair date plus that preserved stage's ladder interval.
This repair checkpoint is the only correction case that replaces the suspended `—`
date; ordinary correction preserves scheduling fields. If the preserved stage is
missing or invalid, ask the learner rather than inventing hidden scheduling state.

After one result is saved, say what changed and offer to continue with the next due
target. Do not display another prompt unless the learner continues or their original
request explicitly bounded a multi-target session; even then, handle one prompt and
one response at a time. Never add reminders, background work, FSRS, scores, streaks,
ease factors, mastery claims, or another state store. All review scheduling state
remains only in the canonical `REVIEW.md`.
