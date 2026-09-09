# LearningSynthesisState v1

`LearningSynthesisState` is the machine-readable compass for one topic-centered learning project. It preserves workflow state across conversations; it is not reader-facing content and must never be published as part of a LearningRecord's Markdown body.

## Storage

Store it as `learning.yaml` in the topic workspace. Resolve the workspace from an existing `learning.yaml`, an existing mother document, or an explicit user path. If none is known, ask where to create the workspace before writing files. Adapt to an existing layout instead of moving user files.

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
version: 1

topic:
  id: xiaomo-mcu
  title: 小沫机器人 MCU 模块
  workspace: /absolute/path/to/topic-workspace
  status: active

goal:
  desired_outcome: []
  central_question: null
  working_claim: null
  out_of_scope: []

progress:
  stage: framing
  map_confirmed: false
  draft_created: false
  next_action: Confirm the central question and learning map.

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
    status: open

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

`related_records` indexes durable knowledge referenced by the mother document. A related record may be Ticket-backed or standalone; the presence of a related record does not by itself create a Ticket or a Learning Map node.

## Map completion contract

A Learning Map node may be marked `[x]` only when `map_completions` contains explicit completion provenance for that node. Completion may come from any of these paths:

- `integrated-ticket`: a resolved KnowledgeTicket and its LearningRecord were integrated;
- `accepted-existing-material`: an existing note, document, or standalone LearningRecord was explicitly mapped to the node and accepted as sufficient;
- `user-confirmed-prior-learning`: the user explicitly confirmed that prior learning already satisfies the node, and that decision was recorded with any available supporting references.

Conversation history, remembered prior discussion, or merely having material available can suggest possible completion evidence, but cannot by itself create `[x]`. Do not fabricate a reference when prior learning has no artifact; record the explicit user confirmation and a concise note instead.

Each `map_completions` entry must identify the stable `node_id`, the completion `basis`, supporting `refs` when available, and enough note/date context for a reader of the workspace to understand why the node is complete. A node without such an entry is not complete even if its map marker is accidentally `[x]`; treat that mismatch as an inconsistency until reconciled.

## Stages

Use exactly one topic stage:

| Stage | Meaning |
| --- | --- |
| `framing` | Goal, central question, scope, or learning map is not confirmed. |
| `drafting` | The map is confirmed and materials are being inventoried or the first draft is being written. |
| `filling` | A mother document exists and gaps are being captured or resolved. |
| `integrating` | At least one valid LearningRecord has been selected or accepted for integration, whether Ticket-backed or standalone. |
| `complete` | The selected scope is coherent and every required confirmed map node is excluded or has valid completion provenance. |

After every confirmed goal, map, draft, ticket, integration, completion-evidence decision, or next-action change owned by `learning-synthesis`, update `learning.yaml`. A ticket file is authoritative for its own lifecycle; after an independent producer marks it `resolved`, the next synthesis status or integration action reconciles the cached ticket entry in `learning.yaml`. Standalone LearningRecord integration does not create or mutate a Ticket entry. Preserve prior decisions; do not rely on conversation history as workflow state.

`candidate_questions` is optional and is not a general inbox for every question the user asks. It holds at most three directly relevant **AI-recommended** questions that the user has not accepted. Each entry records the question, the confirmed Map node that motivated the recommendation when one exists, and why it may be worth pursuing. User-surfaced questions are not truncated to three and do not need to be persisted here merely because they were asked: reconcile them against the current Map, Tickets, candidates, and Records first. If the user chooses to pursue a genuinely new question, represent that decision in the human-readable Map under the closest relevant confirmed parent and create or reuse pending work as needed. Remove or archive an AI candidate after the user accepts or rejects it.

The Learning Map is the persistent question-lineage view. Do not create a second per-Record question tree or duplicate lineage collection in `learning.yaml` unless a later observed workflow failure requires it.

## Separation

- `LearningRecord` is publishable knowledge and may exist with or without a KnowledgeTicket.
- `LearningSynthesisState` is private workflow state.
- `learning-map.md` is the human-readable map of user learning decisions and their question lineage.
- A KnowledgeTicket is a self-contained contract for resolving one accepted gap that still requires work. Code tickets carry the direct-Codex investigation scope when a child agent performs the work.

Publishers consume only completed `LearningRecord` values. They do not consume this state file.
