---
name: learning-synthesis
description: Synthesize existing learner-confirmed KnowledgeNotes into one coherent whole-picture explanation after recursive learning.
---

# Learning Synthesis

Synthesis is the final connective activity in the recursive learning loop. It does not manage the loop. Read the topic's Mission, human-readable Map, and existing KnowledgeNotes, then reorganize DFS learning order into a coherent dependency and causal explanation.

## Inputs

Resolve the topic workspace from a supplied directory, `MISSION.md`, `learning-map.md`, or explicit workspace. Read only relevant notes and sources. The conventional layout is:

```text
MISSION.md
learning-map.md
notes/*.md
```

Older workspaces may use `learning.yaml`, `records/`, or a synthesis `LearningRecord`; read those as compatibility inputs, but do not require their lifecycle fields for a new synthesis.

## Work

1. Identify the learner's desired whole-picture question from the Mission or request, including the causal chain it must make continuous.
2. Inventory the notes that answer parts of it and the explicit gaps they leave.
3. Arrange the explanation by dependency and causal flow, not by file creation order.
4. Preserve uncertainty and distinguish established explanation from inference or missing evidence.
5. Write or revise one synthesis document at a stable workspace path, normally `SYNTHESIS.md` or the existing synthesis path.

The synthesis may link to source KnowledgeNotes. It must not silently invent missing notes, claim mastery, or turn every unresolved detail into a Ticket. Preserve explicitly known blocking gaps so the learner can return to them rather than presenting a false whole.

## Boundaries

- `learning-route` owns focus-stack transitions, gap classification, backtracking, and root closure.
- `learning-teach` owns one-question teaching, note creation/revision, and observed-gap proposals.
- `learning-verify` owns local connection checks and root teach-back checks.
- Direct Codex/research owns repository or external evidence collection when needed.
- A Ticket is optional delegation infrastructure and is not a normal synthesis input requirement.
- The Map records learner-chosen questions and links to notes; it is not a completion state machine.
- `learning.yaml` is legacy topic memory. Do not add stage caches, candidate queues, completion provenance, or integration lifecycle for ordinary synthesis.
- Do not discover or own recursive gaps, push or pop the focus stack, resume parent questions, or own the learning lifecycle.

## Result

Return the synthesis path and a concise account of the explanatory thread, unresolved gaps, and the most useful next question. If the source notes are insufficient, say exactly what broken arrow remains; do not start a hidden capture/integrate workflow.

Done when one coherent synthesis document exists or has been revised in place, with links to the relevant notes and explicit remaining gaps.
