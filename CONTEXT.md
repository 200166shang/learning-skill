# Personal Learning

A small chat-first learning practice. The model teaches naturally; durable structure
records what the learner actually explored so later sessions and downstream workflows
can reuse it without controlling the conversation.

## Design rule

**Teach first. Record second.**

The conversation is primary. The graph is a projection of learning that already
happened. Structure records learning; structure does not control learning.

## Public workflows

- `learning-learn` owns learner-facing teaching and durable Learning Workspace updates.
- `learning-review` retrieves and reconstructs saved understanding without ordinary
  mutation of the Learning Workspace.
- `learning-practice` applies saved understanding in one concrete task without ordinary
  mutation of the Learning Workspace.
- `learning-resources` curates a small verified set of external materials worth
  inspecting without writing research reports or changing the Learning Workspace.
- `learning-organize` derives replaceable Topic articles from pursued Questions after
  the learner approves a proposed structure.
- `learning` is a tiny explicit router that recommends one of the five workflows and
  stops; it does not invoke them automatically.

All six are user-invoked. A source-heavy Learn turn may use a temporary explorer when
the host supports it, but the main agent remains the teaching owner and no persistent
Custom Agent is part of the product.

## Language

**Learning Workspace**:
A durable collection of Root views, their recursive Questions, and downstream Topics.
_Avoid_: course, curriculum, workflow state machine

**Root Compass**:
A small set of broad candidate questions that offer distinct ways into an unfamiliar
module. A candidate creates no Question data until activated.
_Avoid_: generated syllabus, exhaustive question list

**Root**:
One exploration view with its own recursive Question graph and local numbering. Roots
isolate learning context; switching Roots never deletes another exploration.
_Avoid_: Topic owner, permanent knowledge category

**Question**:
A question the learner actually pursued and received a useful explanation for.
_Avoid_: generated prerequisite, planned curriculum item, synthetic gap

Questions retain this one meaning before and after Topic organization. Their visible
number restarts in each Root, while stable IDs are Root-qualified. Similar Questions
may coexist across Roots; there is no separate Topic-local Question type.

**Learning Note**:
The independently readable Markdown explanation saved for a Question. It preserves the
useful substance of the conversational answer rather than reducing it to a canonical
summary.
_Avoid_: transcript, graph state, terse knowledge record

**Parent**:
The immediate Question from which a pursued follow-up arose inside one Root. It records
navigation, not prerequisite or mastery.
_Avoid_: complete ontology, cross-Root canonical identity

**Current Question**:
The Question the learner is presently pursuing. It is a resume pointer, not an
instruction about what the learner must study next.
_Avoid_: active workflow state, mandatory frontier

**Learning Projection**:
A read-only view derived from Root-local threads and Learning Notes. A projection never owns
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
The per-Root Question frontier considered by one Compass revision. New Questions remain
in their Root graphs until an explicit refresh proposes the smallest affected Topic
change.
_Avoid_: frozen Learning Workspace, automatic Topic mutation, second Question graph

## Storage boundary

`root-compass.yaml` is the source of truth for Root status and paths. Each activated
Root's `thread.yaml` owns its current Question, note locations, and parent links.
Markdown Learning Notes contain explanations and useful source evidence, not duplicate
navigation metadata.

Review, Practice, Resources, and Organize consume these artifacts without adding
workflow state to them. Only Learn updates the canonical Question graph. Spaced
repetition, viewers, reusable concept extraction, mastery models, and other downstream
features remain outside this release.
