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

Target kind is guidance, not a gate: `memory` often suits recall, `concept` explanation/transfer, `procedure` steps/transfer, and `design` trade-off transfer. There is no scheduler, due queue, or numeric mastery score in this version.

## Selective flashcards

A flashcard is one ReviewItem representation, not a synonym for Review. Create one only on explicit learner choice, with one retrievable idea on `front` and a concise reference answer on `back`; never generate cards automatically for every Target, Question, or Note. Use `create_card`, `update_card`, and `archive_card` intents through the review runtime. Exact duplicate creates are idempotent. Editing or archiving preserves the ReviewItem ID and all ReviewAttempt history; archived cards are hidden from the default listing. Review a card through the same `record_attempt` pipeline: show only the front first, then evaluate and reveal the back.
