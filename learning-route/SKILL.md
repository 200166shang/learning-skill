---
name: learning-route
description: Ask what to do next in the personal learning workflow.
disable-model-invocation: true
---

# Learning Route

You do not need to remember every learning Skill. Ask.

This Skill is an advisor, not a worker. Read enough supplied workspace state to understand the learner's situation, choose the next path internally, and explain that choice in ordinary learning language.

## Advice

For a normal request, communicate three things without forcing a fixed template:

- the recommended top-level Skill/path the learner should use next;
- why that fits the current learning situation;
- one self-contained prompt they can copy into the next turn that explicitly invokes that same top-level Skill/path.

Keep top-level routing visible to the learner: `learning-note`, `learning-synthesis`, direct Codex source investigation, or direct chat when no learning Skill is needed. The copyable prompt should name that destination explicitly, then describe the intended work in ordinary learning language with the concrete context that matters—question, Record name/path, source provenance, or scope.

Keep branch/mode/lifecycle vocabulary inside the destination Skill by default. Names such as `Materialize`, `Resolve`, `Revise`, `Integrate`, `capture gaps`, lifecycle values, completion bases, and state fields appear only when the learner explicitly asks how the workflow works or why a route was chosen. Keep diagnostic answers scoped to the question.

When `learning.yaml` is supplied, use [LearningSynthesisState](../_shared/learning-synthesis-state.md) as the topic-memory contract instead of reconstructing decisions from chat history.

## Decision map

Route by the work the learner actually wants:

- **Topic work** — Goal, Learning Map, mother document, surfaced/accepted topic questions, integration, resume/status, or knowledge-lineage views → [`learning-synthesis`](../learning-synthesis/SKILL.md).
- **Durable conceptual knowledge** — resolve a supplied conceptual Ticket, preserve an already-completed conceptual result, or revise a conceptual LearningRecord → [`learning-note`](../learning-note/SKILL.md).
- **Repository evidence** — real files, callers, runtime state, execution/data paths, or a supplied code Ticket → direct Codex source investigation; when it must become durable topic work, synthesis first owns the accepted gap/Ticket boundary.
- **Pending external evidence** — an unresolved experiment/research need remains pending work until its result is supplied; the completed result can then be preserved through the conceptual producer path.
- **Transient standalone concept** — a brand-new conceptual question with no preservation/topic-work request → direct chat.
- **Workflow mechanics** — explicit questions about status internals, ownership, Tickets, modes, or contracts → diagnostic explanation only.

A question that surfaced while reading inside an existing topic stays inside that topic first: reconcile it against the current Map, Tickets, AI candidates, and Records before recommending new work. A missing explanation can point back to Record revision; an already-known question reuses its existing path; only a genuinely new learning objective needs new formal work.

## Advice boundary

Stop at the recommendation. This Skill never performs the downstream synthesis, note production, source investigation, integration, or publication step it recommends.

The next-turn prompt must explicitly invoke the recommended top-level Skill/path and be sufficient for that next owner to infer the intended internal work without the learner naming branches such as `Materialize`, `Integrate`, or `capture gaps`.

Done when the learner knows which top-level Skill/path to use, understands why it fits, and has one copyable prompt that explicitly invokes it; or, for an explicit diagnostic request, when the requested internal mechanic is explained without downstream execution.
