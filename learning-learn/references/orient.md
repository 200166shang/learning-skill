# Topic-first orientation

Use this branch only when State is IDLE and the learner supplies a broad objective plus sources but cannot yet name a useful concrete question. Orientation ends at a learner choice; it does not silently begin an Episode.

1. Create or reuse the learner's Goal through `node ~/.codex/skills/_shared/scripts/learning-goal.mjs <workspace>`. Store source references only.
2. Survey cheap structure first: filenames, headings, entry points, imports, and chapter titles. Selectively deepen only enough to identify the module's role, execution entry, boundaries, and end-to-end chain. State unavailable-source uncertainty.
3. Give a compact goal restatement, provisional source-grounded system picture, source-role map, and normally 1–3 candidate Root Questions. Candidates remain ephemeral.
4. Persist only questions the learner explicitly accepts, using one `add_roots` command. If several are accepted without a selection, show them and stop at the selection boundary.
5. Start only the Root Intent the learner explicitly chooses, using the normal transition with `{"type":"start","goalId":"gNNN","rootIntentId":"rqNNN",...}`. The runtime resolves its stored wording and atomically links the Episode.

If the learner supplies a concrete root question at any point, return to the question-first fast path. Do not force a Goal or combine several roots into one Episode. After a Goal-backed Episode closes, pending roots may be shown but none is automatically selected.

**Completion criterion:** orientation is complete when the learner has seen a source-grounded picture plus candidate roots and has either selected one root to start or stopped at the selection boundary. No unchosen candidate is durable.
