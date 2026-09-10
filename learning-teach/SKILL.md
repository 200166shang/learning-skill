---
name: learning-teach
description: Teach one concrete learning question and optionally save or revise its durable KnowledgeNote. Use as the teaching worker inside a learning workflow.
---

# Learning Teach

Answer one coherent question. This skill is a worker: it explains, records evidence, and surfaces possible gaps, but it does not choose the learning path, push or pop a focus stack, or declare a topic complete.

## Inputs and result

Use the supplied question plus only relevant context: the parent question and why this answer is needed, sources or research results, and an existing note when revising.

Return:

1. a small, causal explanation that answers the question;
2. an optional saved or revised KnowledgeNote when requested or clearly useful;
3. observed prerequisite or evidence gaps, labelled with why they may matter and whether they appear blocking, inline-sized, or optional.

Observed gaps are proposals for `learning-route`; never create a question tree, mutate learning state, or automatically continue into them.

## Teaching standard

Prefer the smallest explanation that restores the causal connection the learner needs. Make the mechanism explicit, distinguish verified facts from inference and unresolved assumptions, and cite sources beside source-based claims. A brief analogy or example is useful only when it clarifies the mechanism.

An answer can be locally sufficient without being exhaustive. Do not equate a good explanation or a saved note with learner mastery.

## Workspace and KnowledgeNotes

When a workspace is supplied, read only the relevant mission, map, note, and supplied sources. The conventional layout is:

```text
MISSION.md
learning-map.md
notes/
```

Use the shared [LearningRecord contract](../_shared/learning-record.md); the reader-facing name for `record_type: note` is KnowledgeNote. New notes normally live under `notes/` and each answers one independently readable, specific question.

For a saved note:

- preserve explicit `derived-from` provenance only when the parent and learner follow-up are known;
- keep a matching reader-facing lineage section when a canonical relation exists;
- revise an existing note in place when asked, preserving correct metadata, evidence, and scope;
- update `learning-map.md` only for a learner-expressed or learner-accepted question. Never add merely suggested gaps.

Existing v2 LearningRecords with `record_type: note` remain KnowledgeNotes. Do not require or extend legacy `learning.yaml`.

## Boundaries

If source reading, an experiment, or external research is needed, state the evidence gap clearly and let the orchestrator arrange the investigation. Do not make every conceptual question a Ticket.

Do not draft a synthesis, manage map completion, ask the learner to operate workflow states, or offer a broad generated curriculum. Stop after the one explanation, its requested note operation, and any clearly labelled observations.

Done when the concrete question has a clear answer and any requested note is valid at a stable path.
