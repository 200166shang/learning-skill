---
name: learning-route
description: Ask what to do next in the personal learning workflow.
disable-model-invocation: true
---

# Learning Route

This is the thin learning intent layer. The learner should be able to say what they want in ordinary language. Read relevant workspace artifacts, infer the next owner, and carry out the obvious action when the destination contract is available. Do not make the learner operate a state machine.

## Intent dispatch

| Learner intent | Handle with |
| --- | --- |
| “我想学这个 / 继续深入 / 这里没看懂” | `learning-teach`: explain one concrete question and save/revise a note when appropriate |
| “把刚才讲的保存下来” | `learning-teach`: materialize one KnowledgeNote |
| “这篇笔记改清楚一点” | `learning-teach`: revise that same note |
| “我想把这些知识串起来 / 形成完整理解” | `learning-synthesis`: synthesize existing notes |
| “我现在学到哪了 / 还有什么没懂” | summarize Mission, Map, and note tree in plain language |
| “需要读源码、跑实验或查外部资料” | direct source/research work, optionally using a self-contained delegation task for a real context boundary |
| explicit workflow/debug question | explain internal mechanics only; do not execute unrelated learning work |

## Dispatch rules

1. Prefer the smallest concrete question over a broad curriculum.
2. Reuse an existing note when the learner is asking about its scope; revise it if the explanation is unclear.
3. A follow-up question becomes a child KnowledgeNote when the learner pursues it. Preserve `derived-from` only when the parent is explicit or directly supported.
4. A Ticket is exceptional infrastructure for independent investigation across a context boundary, not a prerequisite for conceptual learning.
5. A KnowledgeNote is evidence that an explanation exists, not proof that the learner has mastered it.
6. Ask one focused question only when a real learner decision is missing. Never ask the learner to specify `stage`, `mode`, lifecycle, completion basis, or integration operation.

## User-facing response

Describe what was done in learning language: the question answered, the note created/revised, its relationship to the current topic, and one natural follow-up if useful. Keep internal routing, state reconciliation, and artifact bookkeeping out of the response unless the learner asks for diagnostics.

If the request is only “what should I do next?”, recommend exactly one concrete action and provide a copyable prompt naming the destination Skill. Otherwise continue into the destination work in the same turn.

Done when the learner's expressed intent has been handled by one clear teaching, synthesis, or investigation action, or when one focused decision is required.
