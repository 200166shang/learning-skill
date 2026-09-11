---
name: review
description: "Use when a learner wants to retrieve, explain, or transfer a previously learned KnowledgeTarget, including manual review and recording review outcomes."
---

# Review

Review tests retained knowledge independently from active learning. It is retrieval-first and may run whether Learning State is IDLE or active.

1. Resolve an existing `kNNN` KnowledgeTarget; never create a curriculum or select a new topic automatically.
2. Create a selective ReviewItem in `recall`, `explain`, or `transfer` mode through `node ~/.codex/skills/_shared/scripts/review.mjs <workspace>` with one JSON intent on stdin.
3. Ask the prompt before showing Notes or reference content.
4. Judge only the learner's demonstrated answer, then record one `pass | uncertain | fail` attempt with `unaided | light_hint | strong_hint` independence through the same command.
5. The deterministic runtime appends ReviewAttempt history and shared `kind: review` Evidence linked to the target.

Never edit review YAML or Evidence directly. Review cannot write Journey, State, Episode/Question status, or the focus stack. A failure is new factual Evidence; it never reopens historical learning. You may suggest a new `$learning` Episode, but start one only if the learner chooses it.

Target kind is guidance, not a gate: `memory` often suits recall, `concept` explanation/transfer, `procedure` steps/transfer, and `design` trade-off transfer. There is no scheduler, due queue, flashcard behavior, or numeric mastery score in this version.
