---
name: learning-curate
description: Organize accumulated KnowledgeNotes through safe merge, cluster, split, reorder, link, or supersede proposals after learning; use for long-term knowledge maintenance, not active route navigation.
---

# Learning Curate

Improve the long-term shape of an existing learning workspace without taking ownership of the active recursive route. Treat KnowledgeNotes and their supported relations as durable knowledge; treat generated maps as replaceable views.

## Workflow

1. Read the workspace's relevant Mission, KnowledgeNotes, synthesis, and generated map. Read `.learning/state.yaml` only to avoid disrupting active work.
2. Diagnose concrete maintenance problems: duplicate explanations, mixed scopes, missing explicit links, stale superseded notes, or an ordering that obscures the causal whole.
3. Propose the smallest useful set of `merge`, `cluster`, `split`, `reorder`, `link`, or `supersede` operations. For every proposal, name the affected paths, preserved content, and expected reader benefit.
4. Apply content or lineage changes only after the learner approves them. Preserve evidence, provenance, stable paths where practical, and unresolved uncertainty.
5. Validate every changed KnowledgeNote against the shared LearningRecord contract, then regenerate `learning-map.md` and `learning-map.mmd` from the shared renderer.

Analysis and proposals are read-only. Generated views can be refreshed after approved source changes; they never become canonical knowledge.

## Boundaries

- `learning-route` owns the live focus stack, gap choice, PUSH, POP, and resume.
- `learning-teach` owns teaching and creating one coherent KnowledgeNote.
- `learning-synthesis` owns the whole-picture explanation.
- `learning-curate` owns post-learning organization proposals and approved maintenance edits.

Leave `.learning/state.yaml` unchanged. Do not infer `derived-from` from topic similarity or treat file order as learning progress.

Done when the requested diagnosis or approved maintenance is complete, changed records remain valid, and derived maps reflect the durable source.
