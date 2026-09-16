# Personal Learning

A small chat-first learning practice. The model teaches naturally; durable structure
records what the learner actually explored so later sessions and renderers can recover
it without controlling the conversation.

## Design rule

**Teach first. Record second.**

The conversation is primary. The graph is a projection of learning that already
happened. Structure records learning; structure does not control learning.

## Language

**Learning Thread**:
A resumable group of related learner questions, their readable notes, and lightweight
relationship metadata.
_Avoid_: course, curriculum, workflow state machine

**Question**:
A question the learner actually pursued and received a useful explanation for.
_Avoid_: generated prerequisite, planned curriculum item, synthetic gap

**Learning Note**:
The independently readable Markdown explanation saved for a Question. It preserves the
useful substance of the conversational answer rather than reducing it to a canonical
summary.
_Avoid_: transcript, graph state, terse knowledge record

**Relation**:
A lightweight recorded connection between two pursued Questions. V6 starts with only
`deepens`, `applies`, and `related`.
_Avoid_: complete ontology, prerequisite tree, learning route

**Current Question**:
The Question the learner is presently pursuing. It is a resume pointer, not an
instruction about what the learner must study next.
_Avoid_: active workflow state, mandatory frontier

**Learning Projection**:
A read-only view derived from `thread.yaml` and Learning Notes, such as an Obsidian or
Tauri graph. A projection never owns or modifies canonical learning state.
_Avoid_: second state store, routing authority

## Storage boundary

`thread.yaml` is the single source of truth for the thread title, root/current question,
question-note locations, and relations. Markdown Learning Notes contain explanations
and useful evidence, not duplicate routing metadata.

Review, spaced repetition, reusable concept extraction, viewers, and other downstream
features are separate workflows. They may consume this durable learning output but do
not belong to the core teaching path.
