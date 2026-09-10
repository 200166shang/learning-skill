---
name: learning-route
description: "Orchestrate recursive learning: identify real understanding gaps, descend only when needed, then return and reconnect the parent question."
---

# Recursive Learning Orchestrator

Help the learner build a continuous explanation of a chosen question. The objective is **no broken arrow** in the target causal chain: each important transition can be explained, rather than merely naming many concepts or collecting notes.

Own the learning loop. `learning-teach`, `learning-verify`, research, and `learning-synthesis` are workers; they do not own the focus stack.

## Core loop

```text
frame root question → explain current focus → detect a real gap
                                             ↓
                          inline answer ← tiny gap
                                             ↓
                         push blocking gap → learn → verify local connection
                                                        ↓
                                              pop → resume and reconnect parent
                                                        ↓
                                     root teach-back → synthesize when continuous
```

Do not pre-generate a curriculum or problem tree. `learning-map.md` records questions the learner actually pursued; it is the result of learning, not its script.

## State and workspace

When a topic workspace is available, read its relevant `MISSION.md`, `learning-map.md`, current note, and `.learning/state.yaml`. Use [the state contract](../_shared/learning-state.md) for a new or revised state file. It stores only the root question and the reason each active child must return to its parent.

If no active topic exists, establish the learner's concrete root question and push it as the initial focus. Do not create workspace files without permission when no workspace was supplied; explain in chat and ask before creating a new workspace.

The conventional layout is:

```text
MISSION.md
learning-map.md
notes/
.learning/state.yaml
SYNTHESIS.md
```

## Classify every learning turn

Compare the request to the top of `focus_stack`.

| Relationship | Response | Stack / map effect |
| --- | --- | --- |
| Current focus | Delegate one concrete question to `learning-teach`. | No push. |
| Inline gap | Answer briefly in context, then continue the current explanation. | No note, map node, or push. |
| Blocking gap | Formulate the smallest question needed to restore the parent explanation. Record why it blocks and the precise resume checkpoint; then delegate it to `learning-teach`. | Push one child. Add to map only after the learner asked for or accepted the question. |
| Side branch | Answer without disturbing the current focus. Identify it as non-blocking. | Do not push or add it to the map unless the learner explicitly chooses to pursue it. |
| Evidence gap | Collect the needed source, experiment, or code evidence, optionally through an independent worker. Then return the evidence to `learning-teach`. | Preserve focus stack; workers never own it. |
| Synthesis request | Check for blocking gaps and root continuity. If they are materially open, explain the missing connection; otherwise delegate to `learning-synthesis`. | No hidden capture workflow. |

A blocking gap is necessary only when the learner cannot explain an important arrow in the current question without it. Prefer an inline answer when one to three short paragraphs restore that arrow. Do not turn AI-suggested extensions into nodes automatically.

## Dive, close, and backtrack

For a blocking gap, push a frame before teaching it. Include `parent`, `why_needed`, and a `resume.checkpoint` that states the exact parent connection to revisit.

After `learning-teach`, inspect its observed gaps. Treat them as proposals, not automatic stack mutations. Ask or infer the smallest necessary next gap only when it clearly blocks the current explanation.

Do not pop because a note exists or because the learner says they have seen the material. A child is locally closed only when it is sufficient to answer **why its parent depends on it**. Use `learning-verify` for that local connection check when it would materially reduce uncertainty.

When the connection is closed:

1. Save or revise the child note when appropriate and update the map only for learner-confirmed questions.
2. Pop the child frame.
3. Explicitly resume the parent at its saved checkpoint.
4. Re-explain the child-to-parent causal connection before continuing.

Never end a resolved child with an open-ended “what next?” while its parent is suspended.

## Root closure and synthesis

When the root appears substantially explained, use `learning-verify` for a root teach-back: let the learner reconstruct the main causal chain. Locate any “then it…” jump and treat it as a possible gap. The root is closed when the learner can continuously explain the important mechanism and no blocking unknown remains—not when every possible related topic is covered.

Only then offer or run `learning-synthesis`. Synthesis turns DFS learning order into a readable dependency/causal order; it does not erase unresolved gaps.

## User-facing response

Describe the current question, whether a real gap was opened or a parent was resumed, and the concrete connection that was restored. Keep stack bookkeeping internal unless the learner asks for diagnostics. If the request is only “what should I do next?”, recommend exactly one concrete next action.

Done when the learner's expressed intent has been handled, the active focus has been correctly preserved or resumed, and any requested durable artifact has been updated.
