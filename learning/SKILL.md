---
name: learning
description: "Choose the explicit Learning workflow that best matches the learner's current intent."
disable-model-invocation: true
---

# Learning

Use this Skill only when the learner is unsure which explicit Learning workflow fits.
Recommend one primary Skill and stop.

- New question, continue understanding, source/code explanation, or correction of saved
  learning -> recommend `learning-learn`.
- Retrieve and reconstruct saved understanding before seeing the explanation ->
  recommend `learning-review`.
- Apply saved understanding in an exercise, code task, trace, prediction, or reasoning
  problem -> recommend `learning-practice`.

When the request genuinely mixes two intentions, name the primary Skill first and one
alternative only if the distinction helps the learner choose.

Do not teach the topic, perform review, generate practice, inspect a large source tree,
read or mutate Learning Thread state for ordinary routing, or auto-invoke a downstream
Skill. Learn, Review, and Practice are intentionally explicit user-invoked workflows.
If the learner already invoked one of them directly, no router hop is required.
