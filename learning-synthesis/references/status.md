# Status / resume

Use [LearningSynthesisState](../../_shared/learning-synthesis-state.md) and inspect referenced ticket files directly. Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) only when contract semantics are needed to validate a ticket; read [LearningRecord](../../_shared/learning-record.md) only when a referenced result must be inspected.

Read `learning.yaml`, the Map, mother-document path, and referenced tickets/Records needed for the question. Treat each ticket file as authoritative for lifecycle. Validate every Map node marked `[x]` against `map_completions`; an unsupported `[x]` is an inconsistency and does not count toward project completion. Validate every `[~]` as a real partial state: a covered portion has been accepted and a concrete residual gap is identifiable. If either side is missing, report the marker as ambiguous and recommend clarifying the node rather than treating historical discussion as partial completion.

Derive the current situation from artifacts under the state contract rather than reading or synchronizing a stored stage. Report the Goal, what is complete, what confirmed/partial work remains, relevant inconsistencies, and exactly one recommended next action in plain language. A status request is navigation; stop before executing that recommendation.

Done when the current situation is explainable from authoritative artifacts, ticket/index drift relevant to the request is reconciled, every counted `[x]` has valid completion provenance, every trusted `[~]` has an explainable covered portion plus residual gap, and one recommended next action is returned without persisting a stage or next-action cache.
