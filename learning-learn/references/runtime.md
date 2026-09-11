# Runtime mechanics

This file is the authoritative reference for persisted Learning mechanics. The conversation skill owns teaching and routing; the deterministic runtime owns schema recovery, IDs, invariants, and writes.

## Durable models

- `.learning/journey.yaml`: finite Episodes and questions actually asked or accepted.
- `.learning/evidence.yaml`: verification attempts and misconceptions.
- `.learning/state.yaml`: only `idle | active`, active Episode ID, and focus question IDs.
- `.learning/targets.yaml`: stable reusable KnowledgeTarget identities (`memory | concept | procedure | design`) with Journey provenance.
- `.learning/goals.yaml`: broad learner objectives, source references, and explicitly accepted Root Intents; absent means no Goals.
- `notes/*.md`: reusable knowledge, never proof of mastery.
- `OVERVIEW.md`: derived whole-picture projection, never routing authority.

## Workspace entry

Before persisted reads or writes, run:

```bash
node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>
```

Continue when no upgrade is needed. If it upgrades, report the recovered position and stop before learning; if it errors, fail closed.

## Mutations

All active-learning mutations go through:

```bash
node ~/.codex/skills/_shared/scripts/learning-transition.mjs <workspace>
```

Provide one JSON intent on stdin. Never coordinate Journey, Evidence, State, Goal, or Target writes directly. The runtime validates the complete persisted snapshot before and after each transition and owns IDs, PUSH/POP bookkeeping, and atomic persistence.

Goal/root-intent operations use:

```bash
node ~/.codex/skills/_shared/scripts/learning-goal.mjs <workspace>
```

Target promotion remains explicit and must not change the focus stack.

## Read-only recovery and inspection

Use:

```bash
node ~/.codex/skills/_shared/scripts/learning-view.mjs --workspace <workspace> --format text
```

after context loss, when the learner asks where they are or why the current gap matters, or when recursive depth is hard to follow. Use `--goals` to list Goals and `--goal gNNN` for accepted roots plus the active recursive path. JSON is available to machine consumers; Mermaid is a bounded debugging projection. The view is read-only and never routing authority.

**Completion criterion:** a runtime operation is complete only after the command succeeds and the resulting persisted/read-only projection satisfies the requested transition or inspection without cross-model invariant errors.
