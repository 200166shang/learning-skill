---
name: learning-note
description: Compatibility entry point for creating or revising a durable conceptual KnowledgeNote. Prefer learning-teach for new learning conversations.
---

# Learning Note (compatibility)

This entry point is retained so existing prompts keep working. For ordinary learning, continue through [Learning Teach](../learning-teach/SKILL.md): teach one concrete question, save one KnowledgeNote, and follow the learner's next question.

When the user explicitly supplies an existing note and asks to revise or save a completed explanation, perform that single operation using the shared [KnowledgeNote contract](../_shared/knowledge-note.md) and [LearningRecord contract](../_shared/learning-record.md). Do not create a Ticket, update a mother document, or expose internal workflow modes unless explicitly requested.

Done when one KnowledgeNote is created or revised at one stable path, or when the learner has received the requested explanation without file persistence.
