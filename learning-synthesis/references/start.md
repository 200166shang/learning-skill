# Start / frame

Use [LearningSynthesisState](../../_shared/learning-synthesis-state.md) as the workflow contract for this mode.

Use for a vague topic or unconfirmed Map. Identify the learner's current question, desired understanding, and exclusions; inspect only relevant supplied materials. When the learner has not supplied a central question, propose a small candidate set and stop for confirmation.

Build the initial Map only from questions the learner asked or accepted. Existing discussion/material may be offered as completion or partial evidence. Apply marker semantics from the synthesis cross-mode contract: `[x]` requires accepted evidence plus `map_completions`; `[~]` requires an accepted covered portion plus a concrete residual gap; otherwise the confirmed unresolved node is `[ ]`.

Record the working claim, exclusions, materials, completion-evidence decisions, Map confirmation, and other durable scope decisions in `learning.yaml`. Drafting begins after the learner confirms the Goal and initial Map.

Done when Goal + initial Map are confirmed and recorded, or when one explicit confirmation request is presented with the proposed Goal/Map. Every initial `[x]` has completion provenance and every `[~]` has explainable covered+residual scope. The mother document remains unchanged in this mode.