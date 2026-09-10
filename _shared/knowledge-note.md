# KnowledgeNote

`KnowledgeNote` is the reader-facing name for one durable explanation of one concrete learning question. It is stored using the shared `LearningRecord` v2 format with `record_type: note`; the shared Record contract remains canonical for metadata, evidence, revision identity, and supported `derived-from` relations.

## Meaning

```text
KnowledgeNote = what was explained
LearningRecord (if introduced later) = what the learner has demonstrated they understand
```

The existence of a KnowledgeNote never proves mastery. A note may be useful, incomplete, or awaiting the learner's follow-up.

## Default layout

```text
notes/<specific-question>.md
```

The note should answer one question, use a causal explanation, and preserve only explicit/supported parent provenance. A child note may use the canonical `derived-from` relation defined in [LearningRecord](learning-record.md).
