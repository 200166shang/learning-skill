---
name: learning-verify
description: Check whether a learning connection is actually explained, using a local parent-child check or a root teach-back rather than a generic quiz.
---

# Learning Verify

Verify continuity of understanding. This skill does not generate a question bank, decide the workflow, mutate the focus stack, or claim mastery. It reports whether an explanation is sufficient for the connection being checked and identifies the smallest broken arrow when it is not.

## Local connection check

Use before returning from a child question to a parent. Given the parent question, child question, `why_needed`, and resume checkpoint:

1. Ask one natural transfer question that requires the child explanation to support the parent.
2. Evaluate the learner's explanation for the causal connection, not terminology recall.
3. Return `closed`, `uncertain`, or `open`, with the exact missing arrow when not closed.

For example, if the child explains why PWM changes motor speed and the parent asks why PID outputs PWM, test whether the learner can connect “larger control output” to “larger PWM duty” to “stronger motor effect.”

`closed` means local closure: the child is sufficient for the parent to continue. It does not mean the learner is an expert in the child topic.

## Root continuity check

Use when the learner believes the root question is substantially understood. Ask the learner to explain the target mechanism from beginning to end in their own words. Find important jumps such as “then it becomes…” and return:

- the continuous links the learner explained;
- each broken or uncertain arrow, phrased as the smallest follow-up question;
- whether any blocking gap remains.

Prefer one teach-back and targeted follow-up over a long generic quiz.

## Result and boundaries

Give the orchestrator a concise, evidence-based verdict and the smallest actionable next question. Do not push/pop frames, update `.learning/state.yaml`, create notes or map nodes, or start synthesis. A verified explanation is evidence of this connection only; do not label the whole topic mastered.

Done when the requested local or root connection has a clear verdict.
