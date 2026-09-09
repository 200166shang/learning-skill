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

candidate_questions:
  - question: 编码器脉冲如何转换成轮速？
    from_node: control-loop
    reason: 当前闭环已出现编码器反馈，但尚未展开单位换算。

decisions:
  - date: 2026-09-09
    decision: Keep interview questions out of the mother document.
    reason: Workflow state is not reader-facing knowledge.
```

## Stages

Use exactly one topic stage:

| Stage | Meaning |
| --- | --- |
| `framing` | Goal, central question, scope, or learning map is not confirmed. |
| `drafting` | The map is confirmed and materials are being inventoried or the first draft is being written. |
| `filling` | A mother document exists and gaps are being captured or resolved. |
| `integrating` | At least one resolved ticket is ready to be integrated. |
| `complete` | The selected scope is coherent and every selected ticket is integrated, deferred, or cancelled. |

After every confirmed goal, map, draft, ticket, integration, or next-action change owned by `learning-synthesis`, update `learning.yaml`. A ticket file is authoritative for its own lifecycle; after an independent producer marks it `resolved`, the next synthesis status or integration action reconciles the cached ticket entry in `learning.yaml`. Preserve prior decisions; do not rely on conversation history as workflow state.

`candidate_questions` is optional and is not a ticket index. It holds at most three directly relevant AI recommendations that the user has not accepted. Each entry records the question, the node that surfaced it, and why it may be worth pursuing. A candidate becomes a formal map node and may create a ticket only after explicit user acceptance; remove or archive it after that decision.

## Separation

- `LearningRecord` is publishable knowledge.
- `LearningSynthesisState` is private workflow state.
- `learning-map.md` is the human-readable map of user learning decisions.
- A KnowledgeTicket is a self-contained contract for resolving one accepted gap. Code tickets carry the direct-Codex investigation scope when a child agent performs the work.

Publishers consume only completed `LearningRecord` values. They do not consume this state file.
