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
- `learning-resources` curates a small verified set of external materials worth
  inspecting without writing research reports or changing the Learning Thread.
- `learning-organize` derives replaceable Topic articles from pursued Questions after
  the learner approves a proposed structure.
- `learning` is a tiny explicit router that recommends one of the five workflows and
  stops; it does not invoke them automatically.

All six are user-invoked. A source-heavy Learn turn may use a temporary explorer when
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

Questions retain this one meaning before and after Topic organization. Root Questions
may grow through unbounded follow-up exploration; there is no separate Topic-local
Question type.

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

**Organized Topic**:
A replaceable long-form explanation derived from pursued Question notes. Topics preserve
the current best way to explain learned material; Questions remain the durable history.
_Avoid_: permanent knowledge node, Topic-of-Topics hierarchy, second canonical store

**Topic Compass**:
The learner-reviewed and approved plan that fixes each Topic's purpose, source Questions,
required content, exclusions, and reading order before article generation. Generation
executes the Compass and never silently replans it.
_Avoid_: title-only outline, hidden temporary grouping, generated curriculum

**Compass Snapshot**:
The set of Question IDs considered by one Compass revision. New Questions remain in the
canonical Learning Thread until an explicit refresh proposes the smallest affected
Topic change.
_Avoid_: frozen Learning Thread, automatic Topic mutation, second Question graph

## Storage boundary

`thread.yaml` is the single source of truth for the thread title, root/current question,
question-note locations, and relations. Markdown Learning Notes contain explanations
and useful source evidence, not duplicate routing metadata.

Review, Practice, Resources, and Organize consume these artifacts without adding
workflow state to them. Only Learn updates the canonical Question graph. Spaced
repetition, viewers, reusable concept extraction, mastery models, and other downstream
features remain outside this release.
