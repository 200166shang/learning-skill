# KnowledgeNote

`KnowledgeNote` is a durable, independently readable unit of reusable knowledge. It is stored using the shared `LearningRecord` v2 format with `record_type: note`; the shared Record contract remains canonical for metadata, evidence, revision identity, and semantic relations.

## Meaning

```text
Journey Question = why this was pursued in one learning context
KnowledgeNote = reusable explanation of a stable concept or mechanism
```

The existence of a KnowledgeNote never proves mastery. A note may be useful, incomplete, or awaiting the learner's follow-up.

## Default layout

```text
notes/<specific-question>.md
```

The note should keep one coherent concept scope and use a causal explanation. Several Journey questions may reference it, and one Journey question may reference several notes. Learning provenance lives in [Learning Journey](learning-journey.md), not in new note relations.
