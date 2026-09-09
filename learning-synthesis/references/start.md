# Start / frame

Use only [LearningSynthesisState](../../_shared/learning-synthesis-state.md) as the workflow contract for this mode.

Use for a vague topic or unconfirmed map. Discuss the desired outcome before expanding scope: identify the user's current question, desired understanding, and exclusions; inspect only relevant supplied materials. Propose candidate central questions only when the user has not supplied one, then wait for confirmation.

Build the initial map around the confirmed question and the learning decisions already made. Do not infer a full module hierarchy from the materials. Prior discussion or existing materials may be recorded as candidate completion evidence, but do not mark a node `[x]` unless the user explicitly accepts that evidence under the map completion contract and the provenance is recorded in `learning.yaml`. Otherwise initialize the node as `[ ]` or `[~]` as appropriate. Record the working claim, exclusions, materials, completion-evidence decisions, and other scope decisions in `learning.yaml`. Do not draft until the user confirms the Goal and initial map.

Done when the Goal and initial map are confirmed and recorded, or the skill has stopped at one explicit confirmation request with the proposed Goal/map visible to the user. Every initial `[x]` must already have matching completion provenance in `learning.yaml`. Do not create or update the mother document in this mode.
