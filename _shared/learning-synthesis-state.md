# LearningSynthesisState v2

`learning.yaml` is machine-readable topic memory. Persist only decisions/indexes future sessions cannot cheaply derive from current artifacts; derive transient workflow situation on demand.

## Storage and schema

Keep it in the topic workspace and adapt to the existing layout.

```yaml
version: 2

topic:
  id: xiaomo-mcu
  title: 小沫机器人 MCU 模块
  workspace: /absolute/path/to/topic-workspace

goal:
  desired_outcome: []
  central_question: null
  working_claim: null
  out_of_scope: []

progress:
  map_confirmed: false

artifacts:
  map: learning-map.md
  mother_document: null
  tickets_directory: tickets
  records_directory: records

materials: []
tickets: []
related_records: []
map_completions: []
candidate_questions: []
decisions: []
```

Collection roles:

- `materials`: stable references relevant to this topic.
- `tickets`: Ticket id/path index; each Ticket file owns its lifecycle.
- `related_records`: durable Records represented by the topic workflow.
- `map_completions`: canonical completion provenance for formal Map nodes.
- `candidate_questions`: at most three currently relevant **AI-recommended** questions awaiting user acceptance.
- `decisions`: durable scope/workflow choices future sessions still need and cannot infer from artifacts.

`progress.map_confirmed` is persisted because Map confirmation is a user decision rather than a file-existence fact.

## Derived situation

Derive the current situation from artifacts instead of storing `stage`, `draft_created`, `next_action`, topic lifecycle, or cached Ticket status:

- unconfirmed Map → framing work remains;
- confirmed Map + no mother document → drafting work remains;
- confirmed unresolved questions/pending Tickets → filling work remains;
- a valid selected Record + explicit integration request → integration is available;
- coherent mother document + every required confirmed Map node excluded or complete → selected scope is complete.

The current request plus these facts determines the next recommendation.

## Map completion contract

A node marked `[x]` must have a matching `map_completions` entry with stable `node_id`, completion `basis`, available supporting `refs`, and enough date/note context to audit the decision.

Supported bases:

- `integrated-ticket` — the Ticket result was integrated;
- `accepted-existing-material` — an existing note/document/standalone Record was explicitly accepted as sufficient;
- `user-confirmed-prior-learning` — the user explicitly confirmed prior learning satisfies the node.

Conversation history or available material may suggest evidence; completion begins only with explicit acceptance recorded here. An unsupported `[x]` is an inconsistency and does not count as complete.

## Candidates and decisions

User-surfaced questions are reconciled against the current Map, Tickets, AI candidates, and Records before persistence. `candidate_questions` is only for AI recommendations and never truncates the learner's own questions. Accepted new learning objectives move into the human-readable Map and, when still unresolved, pending work.

`decisions` is not an execution log. Persist only choices that future sessions still need and cannot infer from the current Map, Records, Tickets, completion provenance, or other artifacts. Transient next steps, implementation history, and one-off execution notes stay out.

## Writes and authority

When synthesis changes a durable goal/scope decision, Map confirmation, material/index reference, completion evidence, AI candidate, or durable decision, update `learning.yaml`. Read Ticket lifecycle from the Ticket and Record content/lineage from the Record. Publishable knowledge belongs in LearningRecords.

## Migration from v1

A v1 workspace remains readable. On the next synthesis-owned write, preserve topic identity, goal, `map_confirmed`, artifact paths, material/Ticket/Record indexes, completion provenance, candidates, and durable decisions; write `version: 2`; omit legacy caches `topic.status`, `progress.stage`, `progress.draft_created`, `progress.next_action`, and `tickets[].status`.

Migration changes storage shape only.

## Separation

- LearningRecord = durable publishable knowledge.
- `learning.yaml` = non-derivable topic memory/indexes.
- `learning-map.md` = user learning decisions and question lineage.
- KnowledgeTicket = one accepted pending-work contract and lifecycle.

Publishers consume completed LearningRecords, not `learning.yaml`.