---
name: learning-flow
description: Use when the user is unsure which personal learning skill or stage should handle a question, topic, source path, LearningRecord, synthesis state, or KnowledgeTicket.
---

# Learning Flow

Act as the explicit navigation and routing entry point. Explain the current state and one next action without duplicating another skill's implementation.

## Navigate before executing

Distinguish a status question such as “what should I do?” or “where am I?” from an execution request such as “continue,” “do this,” or an explicit skill invocation. For navigation, return the current stage, recommended skill/mode, reason, required input, and one next action; do not execute it. For execution, read and follow the selected skill.

When a `learning.yaml` is supplied, use [LearningSynthesisState v1](../_shared/learning-synthesis-state-v1.md) to recover state rather than relying on conversation history. Treat formal map nodes and tickets as user-confirmed learning decisions; `candidate_questions` are recommendations only.

## Route

Choose the owner of the user's primary intent:

- A vague topic, scattered materials, a Learning Map, a mother-document draft, a user-identified or user-accepted gap, integration, or synthesis status routes to [`learning-synthesis`](../learning-synthesis/SKILL.md) in `start`, `draft`, `capture gaps`, `integrate`, or `status` mode. AI-suggested directions remain candidates until the user accepts one.
- A supplied KnowledgeTicket routes by [KnowledgeTicket v2](../_shared/knowledge-ticket-v2.md): `concept` to `learning-note`, `code` to a direct Codex source investigation under the ticket contract, `structure` to `learning-synthesis`, and `evidence` to a recorded experiment/research need without automatic execution.
- A standalone conceptual observation, question, experiment, or reference routes to [`learning-note`](../learning-note/SKILL.md).
- A standalone request about real files, callers, runtime state, execution paths, or repository data flow is handled directly with Codex source investigation. When it should become a durable learning artifact, `learning-synthesis` compiles a user-confirmed code ticket first.

If both kinds of material are present, choose the producer that owns the question being answered. Repository evidence supporting a broader conceptual note does not by itself turn the request into a code walkthrough.

## Compose completed records

Retain a producer's valid `LearningRecord` as a phase boundary. A KnowledgeTicket resolution stops at `resolved`; only `learning-synthesis` integrates it into a mother document.

- When the user explicitly asks to save, publish, sync, or update the result in Feishu, then read and follow [`learning-publish-feishu`](../learning-publish-feishu/SKILL.md) using that completed record.
- When the user explicitly asks to save, archive, publish, or update the result in local Obsidian, then read and follow [`learning-publish-obsidian`](../learning-publish-obsidian/SKILL.md) using that completed record.
- Otherwise, return the completed record locally and stop.

External publication starts only after the producer's completion criterion is satisfied. A publisher failure preserves the completed `LearningRecord` and reports the publication problem without rerunning or rewriting the producer.

`learning-synthesis` v1 never enters validation or publication automatically. Its mother document remains local until a later explicit request.

## Named flows

These names are routing shorthand, not separate implementations:

| User intent | Composition |
| --- | --- |
| Start or continue a topic-centered output | `learning-synthesis` |
| Record a user-confirmed gap without solving it | `learning-synthesis` → KnowledgeTicket → stop |
| Resolve a concept ticket | KnowledgeTicket → optional child agent → `learning-note` → `resolved` |
| Resolve a code ticket | KnowledgeTicket → optional child agent directly investigates source → `resolved` |
| Integrate a resolved ticket | KnowledgeTicket + LearningRecord → `learning-synthesis` → `integrated` |
| Record a learning note | `learning-note` |
| Explain source code | Direct Codex source investigation |
| Record and save to Feishu | `learning-note` → `learning-publish-feishu` |
| Explain code and save to Feishu | Direct Codex source investigation → `learning-publish-feishu` |
| Record and save to local Obsidian | `learning-note` → `learning-publish-obsidian` |
| Explain code and save to local Obsidian | Direct Codex source investigation → `learning-publish-obsidian` |

Completion criterion: navigation returns one unambiguous next action, or execution reaches the selected skill's completion criterion without crossing another skill's ownership boundary.
