# Workspace upgrade

Before reading persisted learning data, run:

```bash
node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>
```

- `empty` or `current`: proceed normally.
- `legacy` or `upgrade-required`: migrate once, report recovered active position and warnings, then stop that turn.
- `invalid` or `unsupported-newer`: fail closed without rewriting.

V1 migration creates one Episode, converts object frames to an ID stack, creates an empty Evidence ledger, and renames `SYNTHESIS.md` to `OVERVIEW.md` when safe. Because V1 lacked evidence, active questions remain open; inactive imported history is abandoned, never falsely marked verified.

Normal runtime reads only V2. Compatibility interpretation belongs only in migrations.
