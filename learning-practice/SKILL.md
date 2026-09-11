---
name: learning-practice
description: "Use when a learner wants to apply an existing KnowledgeTarget through a coding, debugging, or design task and record observable results."
---

# Learning: Practice

Practice applies selected knowledge in artifacts; it is independent from Learning recursion and Review scheduling.

1. Resolve the learner-selected `kNNN` target. Create a task only explicitly—never one per target automatically.
2. Choose `coding`, `debugging`, or `design`. State expected behavior and a small command or rubric verification contract before work begins.
3. Persist the task through `node ~/.codex/skills/_shared/scripts/practice.mjs <workspace>` with one JSON intent on stdin. Never edit practice YAML or Evidence directly.
4. Let the learner create or modify the artifact. The host agent may explicitly compile, test, or inspect it; merely reading/listing a task must never execute persisted command metadata.
5. Record only observable results: `pass | partial | fail`, verification type, exit code or rubric summary, artifact refs, and timestamp. Do not persist hidden reasoning.
6. The deterministic runtime appends PracticeAttempt history and shared `kind: practice` Evidence linked to the target.

Practice can write only PracticeTask, PracticeAttempt, and practice Evidence. It cannot write Learning State, Journey, Episode/Question status, ReviewItem, or Review schedule. A failure may lead you to suggest another practice, `$learning-review`, or a new `$learning-learn` Episode, but none starts automatically.

Target kind is guidance, not a gate: procedure, design, and concept targets may all be practiced. The domain stores command metadata but is not a shell runner, sandbox, or remote execution platform.
