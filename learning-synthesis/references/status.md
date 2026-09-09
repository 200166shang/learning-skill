# Status / resume

Use [LearningSynthesisState](../../_shared/learning-synthesis-state.md) and inspect referenced ticket files directly. Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when contract semantics are needed to validate or reconcile lifecycle state. Read [LearningRecord](../../_shared/learning-record.md) only when status requires inspecting a referenced result.

Read `learning.yaml`, the map, and referenced tickets. Treat each ticket file as authoritative for its lifecycle and reconcile the state index when it changed independently. Validate every map node marked `[x]` against `learning.yaml` completion provenance. An `[x]` without a matching `map_completions` entry is an inconsistency and must not count toward `stage: complete`; report it explicitly and do not invent evidence from conversation history. If existing material or prior learning may satisfy the node, recommend explicit evidence acceptance as the next action rather than silently completing it.

Report the Goal, current stage, completed work with its completion basis, open/resolved/deferred tickets, inconsistencies, and one recommended next action. A status question is navigation only; execute the next action only when the user asks.

Done when authoritative ticket state, map completion provenance, and `learning.yaml` are reconciled, no unsupported `[x]` is counted as complete, the current stage and inconsistencies are reported, and exactly one recommended next action is returned without executing it.
