# Document-first workflow

Use this branch when the learner wants a complete, navigable knowledge document before conversational teaching or verification. The document is a source-grounded learning artifact, not Evidence.

1. Preserve the current route. If an active question exists, keep that question and Episode open; inspect persisted state through the runtime reference when needed. Document creation never starts, replaces, closes, or verifies a question.
2. Survey the learner-provided sources deeply enough to write the whole picture. Trace primary source code and use supporting notes or transcripts to explain intent and terminology. Mark source gaps and inferences explicitly.
3. Choose one stable workspace artifact. Prefer `OVERVIEW.md` for a whole-topic map and linked `notes/*.md` only when a concept is independently reusable. Read [persistence](persistence.md) before creating or revising KnowledgeNotes, and [overview](overview.md) before changing `OVERVIEW.md`.
4. Write a complete, navigable knowledge document covering the applicable module boundaries, overall architecture, end-to-end sequence and data flow, key classes/functions and call chain, protocols and data formats, memory/input/output integrations, concurrency and error handling, design tradeoffs, and interview explanations or follow-up questions. Link exact source files and distinguish observed implementation from interpretation.
5. Write or update the document before beginning teach-back questions. Show the learner the artifact path and a compact reading route, then continue the active question from the document when the learner is ready.

The document may be revised as understanding improves. Its existence does not prove mastery: only learner-produced passing Evidence can close a question or Episode, and verification remains a separate later step.

**Completion criterion:** the requested artifact exists in the learning workspace, is independently readable, covers every applicable section above with traceable sources, and the persisted active question is unchanged.
