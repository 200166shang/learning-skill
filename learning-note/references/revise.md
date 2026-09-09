# Revise

Use when the user supplies an existing `record_type: note` LearningRecord and asks to adjust its explanation, structure, depth, examples, wording, or supported conclusions.

Follow the shared [LearningRecord revision contract](../../_shared/learning-record.md#revision-contract). Revise the same file in place, preserve artifact identity, `record_type`, `created_at`, still-correct content, and still-valid evidence, and keep the user's requested change as the revision scope.

If the requested revision exposes genuinely new unresolved learning work that the current Record and supplied evidence cannot support, report that gap and stop at the revision boundary rather than silently researching, creating a Ticket, or expanding the edit. A separate synthesis action may capture that gap only after the user accepts it.

Revalidate the complete Record after editing. Do not mutate Ticket lifecycle, Learning Map completion, synthesis integration state, mother-document callouts, or external publication destinations; their owners reconcile only if the revised Record materially affects them.

Done when the same LearningRecord path contains one contract-valid revised `record_type: note` artifact satisfying the user's requested change, with no duplicate Record or unrelated work item created.
