# Learning topic memory (legacy compatibility)

New work should be understandable from three small, human-readable artifacts:

```text
MISSION.md       # why the learner is studying the topic
learning-map.md  # questions the learner chose to understand
notes/           # KnowledgeNotes that explain those questions
```

Older workspaces may still contain `learning.yaml`. Read it when supplied so existing notes and topic identity are not lost, but do not require it for ordinary teaching and do not extend its workflow-state collections for a new question.

## Compatibility guidance

- Preserve existing `topic`, `goal`, material paths, Ticket paths, and Record indexes when an older workspace is edited.
- Treat `progress.stage`, `draft_created`, `next_action`, `candidate_questions`, `map_completions`, and integration lifecycle as legacy metadata, not as user-facing commands.
- Derive the current situation from `MISSION.md`, `learning-map.md`, note files, and any supplied Ticket/Record artifacts.
- Do not mark a topic complete merely because a note exists. A KnowledgeNote records an explanation; it does not prove learner mastery.
- Do not invent Map nodes from general knowledge. Add a question only when the learner asked it or accepted it.

## Optional legacy schema

If a legacy `learning.yaml` must be updated, preserve its identity and existing artifact paths. Keep writes minimal and do not add a stage cache or a new lifecycle field. New durable knowledge belongs in a `record_type: note` LearningRecord/KnowledgeNote; whole-topic synthesis belongs in the synthesis document.

## Ownership

- `learning-teach` owns the recursive teaching loop, note creation/revision, and explicit follow-up provenance.
- `learning-synthesis` owns only the whole-picture explanation assembled from existing notes.
- `KnowledgeTicket` owns only an explicitly created independent delegation task.
