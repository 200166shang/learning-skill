# KnowledgeTicket v2

A `KnowledgeTicket` is a self-contained contract for one user-confirmed learning gap that still requires work. Creating one records pending work; it does not start work or authorize changes outside its stated scope. Do not create a Ticket retroactively merely to justify learning that has already been resolved and materialized as a LearningRecord.

Store each ticket as Markdown with YAML frontmatter under the topic workspace's configured tickets directory. Frontmatter is an index: identity, lifecycle, topic mapping, gap type, and final result reference. The Markdown body is the worker-facing contract. `question` is user-owned; the remaining execution detail is compiled by `learning-synthesis` from the confirmed question, existing learning state, supplied materials, and—only for a code ticket—a lightweight reconnaissance.

## Code evidence rule

For every source-based conclusion in a `code` ticket result, use this sequence:

`source location → minimal excerpt → explanation`

The excerpt must be the smallest code needed to show the relevant control flow, data access, or configuration. A file path or line number alone is navigation, not evidence. Keep verified source facts, inference, and unconfirmed items distinguishable.

## Schema

```yaml
---
version: 2
id: K-003
title: 理解 PID 如何根据编码器反馈调整 PWM
status: open

topic:
  id: xiaomo-mcu
  map_node: control.pid

question: >
  PID 中 P、I、D 分别解决什么问题，它如何根据目标脉冲和实际脉冲得到 PWM？

why_needed: >
  母文档需要解释 Linux 如何形成电机闭环，但当前只能看到公式。

gap_type: code

result: null
---

# K-003 — 理解 PID 如何根据编码器反馈调整 PWM

## 要做什么

解释 PID 在两个连续控制周期中的状态变化，并对应当前仓库中的目标脉冲、编码器反馈和 PWM。

## 范围

- 只追踪目标脉冲、实际脉冲与 PWM 之间的实际数据路径。

不展开通用 PID 参数整定理论，也不修改当前实现。

## 可用材料

- `/absolute/path/to/pid.cpp`

## 需要追踪

- 目标值如何进入控制器。
- 反馈值如何进入误差计算。

## 需要回答

- P、I、D 在当前实现中的状态和输出如何变化？

## 证据要求

- 遵守 `Code evidence rule`。
- 每个关键结论指向真实文件、符号或代码路径。

## 交付与验收

直接用 Codex 调查源码；适合独立执行时优先委派子 agent。产出 `code-walkthrough` LearningRecord 到 `records/PID源码导览.md`，独立说明实际调用链、状态变化与结论边界。

- 回答本 Ticket 的问题，并覆盖范围、追踪路径和需要回答项。
- 结果满足证据要求。

## 后续整合

由 `learning-synthesis` 在母文档的“Linux 根据编码器反馈计算 PWM”处以 `summary-and-callout` 方式整合。
```

## Required fields

All YAML fields shown above are required. The body must contain, in natural Markdown, the work to perform, scope, materials, evidence standard, delivery location, acceptance, and integration target. For `gap_type: code`, it also names the execution paths to trace and the questions to answer. Resolve the body-stated result destination relative to the topic workspace and keep it inside that workspace.

Use one `gap_type`: `concept`, `code`, or `evidence`.

`question` records the user's confirmed learning decision. The body defines execution boundaries; it must clarify that question rather than silently add a separate learning objective.

## Compile a code ticket

Before issuing a code ticket, `learning-synthesis` may perform a lightweight reconnaissance to identify real entry files, direct dependencies, key symbols, and evidence paths. It must stop at task location rather than answer the code question. Use the result to make the ticket independently executable:

- list only the files and direct dependencies needed to answer the question;
- name the execution paths that must be traced;
- turn the user's stated concern into answerable checks;
- state adjacent work that belongs outside the ticket;
- require code-backed conclusions under the `Code evidence rule`.

Do not add attractive but separate questions merely because they are related. Offer them later as candidate questions if needed.

## Lifecycle and execution

```text
open → in-progress → resolved → integrated
                   ↘ deferred
                   ↘ cancelled
```

- `concept` tickets are resolved with `learning-note`.
- `code` tickets are resolved by a Codex agent directly reading the repository under this contract. A child agent is preferred when it can work independently; give it the ticket and listed materials, not a prescribed source-reading skill.
- `evidence` records an experiment or research need and is not automatically executed.

Structure-oriented work on the Learning Map, mother-document organization, or synthesis flow remains owned directly by `learning-synthesis`; do not encode it as a separate KnowledgeTicket type.

Every Ticket that reaches `resolved` must reference exactly one completed LearningRecord. Resolving never edits the mother document; integration is a separate `learning-synthesis` action. A LearningRecord may also exist without any Ticket when the learning work was already completed outside this workflow.
