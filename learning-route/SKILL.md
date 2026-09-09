---
name: learning-route
description: Use when the user is unsure which personal learning skill or stage should handle a question, topic, source path, LearningRecord, synthesis state, or KnowledgeTicket.
---

# Learning Route

You are a router; own no learning work. Determine the current learning state, choose the owner of the user's primary intent, and either return navigation or hand off execution. Do not duplicate another skill's implementation.

## Navigate or execute

Distinguish a navigation request such as “what should I do?” or “where am I?” from an execution request such as “continue,” “do this,” or an explicit skill invocation.

For navigation, return the current stage, recommended skill/mode, reason, required input, and exactly one next action; do not execute it. For execution, read and follow the selected owner until that owner's completion criterion is satisfied, then stop at the next ownership boundary.

When a `learning.yaml` is supplied, read [LearningSynthesisState](../_shared/learning-synthesis-state.md) to recover state rather than relying on conversation history. Treat formal map nodes and tickets as user-confirmed learning decisions; `candidate_questions` remain recommendations until the user accepts one.

## Route

Use this as the authoritative intent-to-owner mapping:

| Primary intent | Owner |
| --- | --- |
| Start, draft, resume, integrate, or evolve one topic-centered learning document; organize scattered materials; capture a user-confirmed gap | [`learning-synthesis`](../learning-synthesis/SKILL.md) in `start`, `draft`, `capture gaps`, `integrate`, or `status` mode |
| Resolve a supplied `concept` KnowledgeTicket | [`learning-note`](../learning-note/SKILL.md) under the [KnowledgeTicket](../_shared/knowledge-ticket.md) contract |
| Resolve a supplied `code` KnowledgeTicket | Direct Codex source investigation under the [KnowledgeTicket](../_shared/knowledge-ticket.md) contract |
| Handle a supplied `evidence` KnowledgeTicket | Record the experiment/research need under the [KnowledgeTicket](../_shared/knowledge-ticket.md) contract and stop; do not execute it automatically |
| Turn a standalone conceptual observation, question, experiment, or reference into durable learning content | [`learning-note`](../learning-note/SKILL.md) |
| Revise an existing LearningRecord | Route back to the producer class that owns its content and evidence: conceptual `note` → [`learning-note`](../learning-note/SKILL.md) `Revise`; source-backed or `code-walkthrough` → direct Codex under the [LearningRecord](../_shared/learning-record.md) revision contract |
| Explain real files, callers, runtime state, execution paths, or repository data flow | Direct Codex source investigation |

If conceptual and repository material are mixed, choose the owner by the question being answered. Repository evidence supporting a broader conceptual explanation does not by itself make the request a code walkthrough. When source investigation should become part of the topic-centered durable workflow, `learning-synthesis` first compiles a user-confirmed code ticket.

Structure-oriented work on the Learning Map, mother-document organization, or synthesis flow belongs directly to `learning-synthesis`; it is not routed through a separate KnowledgeTicket type.

## Handoffs

Treat a producer's valid `LearningRecord` as a phase boundary. Resolving a KnowledgeTicket stops at `resolved`; only `learning-synthesis` integrates a resolved result into a mother document. Revision also stops at the producer boundary; if an already-integrated Record later needs its mother-document summary reconciled, that synchronization belongs to `learning-synthesis` `integrate` mode.

A chat-only direct Codex source investigation may return an explanation without creating a durable record. When the user asks to save, export, publish, sync, archive, or otherwise preserve the result, first materialize a valid completed [LearningRecord](../_shared/learning-record.md). Do not cross a persistence or publication boundary with only an in-chat explanation.

This repository currently installs no external publisher skills. Do not invoke or claim Feishu, Obsidian, or another external publication path. If the user requests an unavailable external destination, finish and preserve the completed `LearningRecord`, return it locally, and report that external publication is outside the installed workflow. A later publisher can consume that completed record without rerunning or rewriting the producer.

`learning-synthesis` never enters validation or publication automatically.

Completion criterion: navigation returns one unambiguous next action, or execution reaches the selected owner's completion criterion without crossing another ownership boundary.
