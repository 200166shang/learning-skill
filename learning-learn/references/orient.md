# Topic-first orientation

Use this branch only when State is IDLE and the learner supplies a broad objective plus sources but cannot yet name a useful concrete question. Orientation ends at a learner choice; it does not silently begin an Episode.

1. Survey cheap structure first: filenames, headings, entry points, imports, and chapter titles. Selectively deepen only enough to identify the module's role, execution entry, boundaries, and end-to-end chain. State unavailable-source uncertainty. Skip this repeat survey when `$learning-ask` already supplied a source-grounded candidate and the learner explicitly accepted it.
2. Give a compact goal restatement, provisional source-grounded system picture, source-role map, and normally 1–3 candidate Root Questions. Candidates remain ephemeral. When continuing an accepted `$learning-ask` candidate, use its exact wording as the chosen candidate.
3. Stop for an explicit learner choice. Before that choice, do not run `learning-goal.mjs`, `learning-transition.mjs`, workspace initialization, migration, or any other state-writing command.
4. After acceptance, create or reuse the learner's Goal through `node ~/.codex/skills/_shared/scripts/learning-goal.mjs <workspace>` and store source references only. Persist only questions the learner explicitly accepts, using one `add_roots` command. If several are accepted without a selection, persist the accepted roots, show them, and stop at the selection boundary.
5. Start only the Root Intent the learner explicitly chooses, using the normal transition with `{"type":"start","goalId":"gNNN","rootIntentId":"rqNNN",...}`. The runtime resolves its stored wording and atomically links the Episode. Confirm via the read-only map projection that the accepted root is linked to the new root Question before teaching begins.

If the learner supplies a concrete root question at any point, return to the question-first fast path. Do not force a Goal or combine several roots into one Episode. After a Goal-backed Episode closes, pending roots may be shown but none is automatically selected.

**Completion criterion:** orientation is complete when the learner has seen a source-grounded picture plus candidate roots and has either selected one root to start or stopped at the selection boundary. No unchosen candidate is durable.
