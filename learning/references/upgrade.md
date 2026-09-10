# Workspace upgrade

Run this before normal route, teach, resume, synthesis, or curation work involving persisted workspace data:

```bash
node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>
```

The inspector is read-only. Its explicit states are `empty`, `legacy`, `canonical-unversioned`, `current`, `upgrade-required`, `unsupported-newer`, and `invalid`.

- `empty`: initialize the normal current Journey and state when learning begins, then run the command again to stamp the workspace schema.
- `current`: continue normally.
- `canonical-unversioned`: validate and stamp the manifest without rebuilding Journey. Normal work may continue because semantic learning state did not change.
- `legacy` or `upgrade-required`: preflight, run the complete one-way migration chain, validate canonical data, and write the manifest last. Report source and target versions, root/current question, resume destination/checkpoint, and warnings. Then **stop the turn**; do not teach automatically.
- `unsupported-newer` or `invalid`: fail closed, report the diagnostic, and do not rewrite or downgrade anything.

Migration is the only code allowed to interpret legacy `derived-from` traversal provenance. Normal runtime, maps, observers, and synthesis use current Journey, state, and notes only.

`schema_version` describes persisted-data compatibility, independently of skill or repository releases. Increment it only for an incompatible persisted contract change, such as changing lineage representation, identity semantics, or removing persisted fields. Prompt wording, verification behavior, rendering, observers, and internal refactors do not increment it.

Future migrations register only sequential `vN -> vN+1` steps. Do not add hypothetical migrations or permanent runtime branches.
