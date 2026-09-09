# LearningSynthesisState v2

`LearningSynthesisState` is the machine-readable memory for one topic-centered learning project. Persist decisions and indexes that future sessions cannot cheaply derive from the workspace; derive transient workflow situation from the current artifacts when needed.

## Storage

Store it as `learning.yaml` in the topic workspace. Resolve the workspace from an existing `learning.yaml`, an existing mother document, or an explicit user path. Adapt to the existing layout.

The usual layout is:

```text
topic-workspace/
├── learning.yaml
├── learning-map.md
├── <mother-document>.md
├── tickets/
└── records/
```

## Schema

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

Optional collections use these shapes:

```yaml
materials:
  - id: material-001
    type: repository
    ref: /absolute/or/stable/reference
    role: implementation-evidence

tickets:
  - id: K-001
    path: tickets/K-001-example.md

related_records:
  - title: PID 源码导览
    path: records/PID源码导览.md
    role: code-walkthrough

map_completions:
  - node_id: control.pid
    basis: integrated-ticket
    refs:
      - tickets/K-003.md
      - records/PID源码导览.md
    accepted_at: 2026-09-09
    note: K-003 was resolved and integrated.

candidate_questions:
  - question: 编码器脉冲如何转换成轮速？
    from_node: control-loop
    reason: 当前闭环已出现编码器反馈，但尚未展开单位换算。

decisions:
  - date: 2026-09-09
    decision: Keep interview questions out of the mother document.
    reason: Workflow state is not reader-facing knowledge.
```

`progress.map_confirmed` is persisted because confirmation is a user decision that file existence cannot prove. A ticket file is authoritative for its own lifecycle; `tickets` only indexes its stable id/path. `related_records` indexes durable knowledge represented by the topic workflow without creating a Ticket or Map node by itself.

## Derived situation

Compute workflow situation on demand from canonical artifacts instead of persisting a stage or next-action cache:

- `map_confirmed: false` means framing/Map confirmation work remains;
- a confirmed Map with no mother document means drafting work remains;
- confirmed questions without sufficient results/completion evidence, or pending ticket files, mean filling work remains;
- a selected valid LearningRecord can be integrated when the user asks;
- the selected scope is complete when the mother document is coherent and every required confirmed Map node is excluded or has valid completion provenance.

Artifact existence answers whether the mother document was created. The current user request plus workspace facts determine the next recommendation. These derived facts are not persisted as `stage`, `draft_created`, `next_action`, or topic lifecycle status.

## Map completion contract

A Learning Map node is complete only when `map_completions` contains explicit completion provenance for that stable node id. Supported completion bases are:

- `integrated-ticket`: a resolved KnowledgeTicket and its LearningRecord were integrated;
- `accepted-existing-material`: an existing note, document, or standalone LearningRecord was explicitly mapped to the node and accepted as sufficient;
- `user-confirmed-prior-learning`: the user explicitly confirmed prior learning satisfies the node, with available references and a concise note.

Conversation history or merely available material can suggest evidence but cannot establish completion. Each entry records the node id, basis, supporting refs when available, and enough note/date context to audit the decision. A Map `[x]` without matching provenance is an inconsistency and does not count as complete.

## Candidates and decisions

`candidate_questions` holds at most three directly relevant **AI-recommended** questions that the user has not accepted. User-surfaced questions are reconciled against the current Map, Tickets, candidates, and Records rather than being stored here automatically. Once the user accepts a genuinely new question, represent that learning decision in the human-readable Map and create or reuse pending work as needed.

`decisions` stores durable scope/workflow choices that future sessions still need and cannot infer from current artifacts. It is not an execution history or next-action log.

## Writes and authority

When `learning-synthesis` changes a goal/scope decision, Map confirmation, material/index reference, completion evidence, AI candidate, or durable decision, update `learning.yaml`. Read ticket lifecycle from the ticket file and Record content/lineage from the Record itself. Keep publishable knowledge out of this machine state.

## Migration from v1

A v1 workspace remains readable. On the next synthesis-owned state write:

- carry forward `topic.id/title/workspace`, `goal`, `progress.map_confirmed`, artifact paths, materials, ticket id/path indexes, related records, completion provenance, candidates, and durable decisions;
- write `version: 2`;
- omit legacy cache fields `topic.status`, `progress.stage`, `progress.draft_created`, `progress.next_action`, and cached `tickets[].status`.

Migration changes storage shape only; it does not alter Map decisions, Ticket lifecycle, LearningRecord content/lineage, or completion provenance.

## Separation

- `LearningRecord` is publishable knowledge and may exist with or without a KnowledgeTicket.
- `learning.yaml` preserves non-derivable topic decisions and indexes.
- `learning-map.md` is the human-readable map of user learning decisions and question lineage.
- a KnowledgeTicket is the authoritative pending-work/lifecycle contract for one accepted gap.

Publishers consume completed LearningRecords, not `learning.yaml`.
