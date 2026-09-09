# KnowledgeTicket v2

A `KnowledgeTicket` is the self-contained worker contract for one user-confirmed learning gap that still requires work. Creating it records pending work. Already-resolved learning goes directly to a LearningRecord rather than receiving a retroactive Ticket.

Store each Ticket as Markdown in the topic workspace's configured tickets directory. YAML carries identity/routing/lifecycle; the Markdown body carries the executable work contract. The user owns `question`; `learning-synthesis` compiles the remaining scope from the confirmed question, current topic state, supplied materials, and—only for `code`—lightweight reconnaissance.

## Required shape

```yaml
---
version: 2
id: K-003
title: 理解 PID 如何根据编码器反馈调整 PWM
status: open
topic:
  id: xiaomo-mcu
  map_node: control.pid
question: PID 如何根据目标脉冲和实际脉冲得到 PWM？
why_needed: 母文档需要解释 Linux 如何形成电机闭环。
gap_type: code
result: null
---
```

All fields above are required. Use one `gap_type`: `concept`, `code`, or `evidence`.

The Markdown body must make the Ticket independently executable by stating:

- work to perform and explicit scope/exclusions;
- available materials;
- evidence/trace requirements appropriate to the question;
- a concrete workspace-relative LearningRecord destination;
- acceptance criteria;
- mother-document integration target.

`question` remains the accepted learning objective. Execution detail clarifies that question rather than adding another objective.

## Code tickets

A `code` Ticket produces `record_type: code-walkthrough` and delegates evidence semantics to the canonical [LearningRecord code-walkthrough contract](learning-record.md#code-walkthrough-evidence-contract).

Before capture, synthesis may locate real entry files, direct dependencies, key symbols, and evidence paths. **Reconnaissance stops at task location.** Use it to make the Ticket self-contained: list only relevant files/paths, convert the learner's concern into answerable checks, and state adjacent work as out of scope. Separately valuable questions remain candidates rather than hidden Ticket requirements.

## Lifecycle and execution

```text
open → in-progress → resolved → integrated
                   ↘ deferred
                   ↘ cancelled
```

- `concept` → `learning-note` resolves the Ticket.
- `code` → direct Codex investigates the listed repository material; prefer a child agent when the Ticket is independently executable.
- `evidence` → records an external experiment/research need; execution happens outside this workflow, then the completed result can be materialized.

Learning Map structure and mother-document organization stay with `learning-synthesis`, not a Ticket type.

A Ticket reaches `resolved` only after exactly one completed LearningRecord exists at its stated destination and `result` references it. Resolution stops there; `learning-synthesis` owns later integration. A LearningRecord may also exist without any Ticket when the learning result was already complete.