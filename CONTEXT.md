# Personal Learning

A small chat-first learning practice. The model teaches naturally; durable structure
records what the learner actually explored so later sessions and downstream workflows
can reuse it without controlling the conversation.

## Design rule

**Teach first. Record second.**

The conversation is primary. The graph is a projection of learning that already
happened. Structure records learning; structure does not control learning.

## Public workflows

- `learning-learn` owns learner-facing teaching and durable Learning Thread updates.
- `learning-review` retrieves and reconstructs saved understanding without ordinary
  mutation of the Learning Thread.
- `learning-practice` applies saved understanding in one concrete task without ordinary
  mutation of the Learning Thread.
- `learning` is a tiny explicit router that recommends one of the three workflows and
  stops; it does not invoke them automatically.

All four are user-invoked. A source-heavy Learn turn may use a temporary explorer when
the host supports it, but the main agent remains the teaching owner and no persistent
Custom Agent is part of the product.

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
A lightweight recorded connection between two pursued Questions. V6 uses only
`deepens`, `applies`, and `related`.
_Avoid_: complete ontology, prerequisite tree, learning route

**Current Question**:
The Question the learner is presently pursuing. It is a resume pointer, not an
instruction about what the learner must study next.
_Avoid_: active workflow state, mandatory frontier

**Learning Projection**:
A read-only view derived from `thread.yaml` and Learning Notes. A projection never owns
or modifies canonical learning state.
_Avoid_: second state store, routing authority

## Storage boundary

`thread.yaml` is the single source of truth for the thread title, root/current question,
question-note locations, and relations. Markdown Learning Notes contain explanations
and useful source evidence, not duplicate routing metadata.

Review and Practice consume these artifacts but do not add review/practice state to
them. Spaced repetition, viewers, reusable concept extraction, mastery models, and
other downstream features remain outside this release.
