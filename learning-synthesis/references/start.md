# Start / frame

Use only [LearningSynthesisState](../../_shared/learning-synthesis-state.md) as the workflow contract for this mode.

Use for a vague topic or unconfirmed map. Discuss the desired outcome before expanding scope: identify the user's current question, desired understanding, and exclusions; inspect only relevant supplied materials. Propose candidate central questions only when the user has not supplied one, then wait for confirmation.

Build the initial map around the confirmed question and the learning decisions already made. Keep the initial structure to questions the user asked or accepted rather than inferring a full module hierarchy from materials. Prior discussion or existing material may be offered as completion/partial evidence. Mark `[x]` only after the user accepts sufficient evidence and `map_completions` records that decision. Mark `[~]` only when the user accepts a named covered portion and a concrete residual gap remains; make both parts understandable from the Map/context. Historical discussion by itself stays `[ ]` until such acceptance. Record the working claim, exclusions, materials, completion-evidence decisions, and other durable scope decisions in `learning.yaml`. Drafting starts only after the user confirms the Goal and initial Map.

Done when the Goal and initial map are confirmed and recorded, or the skill has stopped at one explicit confirmation request with the proposed Goal/map visible to the user. Every initial `[x]` already has matching completion provenance, and every initial `[~]` has an explainable covered portion plus residual gap. The mother document is untouched in this mode.
