---
name: learning-teach
description: Teach one concrete learning question, follow the learner's intent, and save the resulting explanation as a durable KnowledgeNote. Use for starting or continuing a topic, answering a follow-up question, revising an unclear note, or materializing a completed explanation.
---

# Learning Teach

This is the primary worker for recursive learning. The learner expresses an intention in ordinary language; infer the smallest useful teaching action from the request and the available workspace context. Do not ask the learner to name internal modes, stages, completion bases, or Ticket states.

## The learning loop

```text
question / confusion / desire to continue
        ↓
teach one concrete point
        ↓
save or revise one KnowledgeNote
        ↓
invite or handle a follow-up question
        ↺
```

One invocation should answer one coherent question. Prefer a small, causal explanation over a survey of the whole topic. Keep prerequisites minimal and say when a prerequisite deserves its own follow-up.

## Workspace and artifacts

When a topic workspace is supplied, use it. Otherwise answer in chat and ask before creating a new workspace or files. The conventional layout is:

```text
MISSION.md                 # why this topic matters and what success means
learning-map.md            # questions the learner chose to understand
notes/                      # one KnowledgeNote per concrete question
knowledge-lineage.md       # optional derived reading view
```

Read only the relevant mission, map, current note, and supplied sources. Do not require `learning.yaml` for ordinary teaching. If an existing v2 LearningRecord is supplied, treat `record_type: note` as a KnowledgeNote and preserve its path/metadata when revising.

## Intent handling

- “我想学/继续学这个” — explain the smallest concrete question implied by the request; if the question is genuinely ambiguous, ask one focused question.
- “这里没看懂/这篇文章不清楚” — explain the missing mechanism; revise the existing note when the gap is inside its scope.
- “读完又想到……” — teach the follow-up as a child note and record explicit `derived-from` provenance when the parent is known.
- “把刚才讲的记下来/保存下来” — materialize the completed explanation as one KnowledgeNote.
- “帮我改清楚一点” — revise the same note in place, preserving correct evidence and scope.
- “需要读源码/实验才能回答” — create an optional self-contained research/delegation task only when the context boundary is real; do not turn every conceptual question into a Ticket.
- “我现在学到哪了/还有什么没懂” — summarize the Map and note tree in plain language; do not expose internal lifecycle unless asked.

## KnowledgeNote contract

Each saved note answers one concrete question and is independently readable. Use the shared [LearningRecord contract](../_shared/learning-record.md) with `record_type: note`; the reader-facing name is KnowledgeNote. Store new notes under the workspace `notes/` directory unless the workspace already has an established records directory.

Required qualities:

- specific question title and a self-contained Markdown body;
- causal/mechanical explanation, not merely a list of terms;
- verified facts, inference, and unresolved assumptions distinguishable;
- source references beside claims when sources were used;
- explicit `derived-from` relation only when the learner's follow-up provenance is known;
- no claim that the learner has mastered the topic merely because a note exists.

## Map and lineage

Update `learning-map.md` only when the learner has expressed or accepted a question as part of the topic. Keep it human-readable: an unresolved question can say `→ 待继续学习`; an explained question links to its note. Do not add status matrices, completion provenance, candidate queues, or Ticket metadata to the Map.

If a child note grew from a parent note, preserve that fact in the child note's canonical relation and optionally refresh `knowledge-lineage.md`. Never infer a relation merely because two notes discuss related concepts.

## Handoff and stopping rules

The normal result is one explanation and, when requested or clearly useful, one saved KnowledgeNote. Stop after that result. Do not automatically draft a mother document, integrate every note, create a Ticket, or ask the learner to run another internal branch.

Ask the learner only for a real decision or missing fact, such as which of two materially different questions to pursue, where a new workspace belongs, or whether an out-of-scope branch is worth studying. Otherwise execute the obvious next action.

Done when the learner has a clear answer, and any requested note is saved or revised at one stable path with valid metadata and explicit provenance.
