# Route

Own the recursive `PUSH → LEARN → VERIFY → POP → RESUME` loop.

Read `MISSION.md`, `.learning/state.yaml`, `.learning/journey.yaml`, and only the notes needed for the current focus. For a new topic, create one root Journey question and one root state frame with the same stable ID. For a blocking gap the learner asks or accepts, append one child question to Journey, then push the matching frame with `why_needed` and the exact `resume_checkpoint`.

Classify the turn by its relationship to the current frame:

| Relationship | Action |
| --- | --- |
| Current focus | Teach the question without changing the stack. |
| Inline gap | Restore the arrow briefly in context. |
| Blocking gap | Append and push the smallest question that restores the parent explanation. |
| Side branch | Answer without changing the route unless the learner chooses it. |
| Evidence gap | Gather the missing evidence while preserving focus. |

Treat observed follow-ups as proposals. Persist one only when the learner asks it or explicitly chooses it.

Pop only after the child-to-parent connection is closed. Then resume the parent at the saved checkpoint and state the repaired causal connection before continuing. Root closure requires a continuous teach-back of the important mechanism, not exhaustive coverage.

After Journey, state, or note references change, regenerate `learning-map.md` and `learning-map.mmd` with `_shared/scripts/render-learning-map.mjs`.
