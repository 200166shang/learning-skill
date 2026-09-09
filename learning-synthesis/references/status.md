# Status / resume

Use [LearningSynthesisState](../../_shared/learning-synthesis-state.md) and inspect referenced ticket files directly. Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when contract semantics are needed to validate or reconcile lifecycle state. Read [LearningRecord](../../_shared/learning-record.md) only when status requires inspecting a referenced result.

Read `learning.yaml`, the map, and referenced tickets. Treat each ticket file as authoritative for its lifecycle and reconcile the state index when it changed independently. Report the Goal, current stage, completed work, open/resolved/deferred tickets, inconsistencies, and one recommended next action. A status question is navigation only; execute the next action only when the user asks.

Done when authoritative ticket state and `learning.yaml` are reconciled, the current stage and inconsistencies are reported, and exactly one recommended next action is returned without executing it.
