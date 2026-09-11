# Runtime mechanics

This file is the authoritative reference for persisted Learning mechanics. The conversation skill owns teaching and routing; the deterministic runtime owns persisted writes, schema recovery, IDs, migrations, cross-model invariants, and atomic persistence.

## Workspace entry

Schema recovery and migrations must complete before persisted access. Use the repository's runtime scripts and their usage output to discover the current command interface. Continue when no upgrade is needed. If recovery changes persisted state, report the recovered position and stop before learning; if it errors, fail closed.

## Mutations

All state changes go through the appropriate deterministic runtime command; never hand-edit YAML or coordinate Journey, Evidence, State, Goal, and Target writes directly. The runtime validates the complete snapshot before and after each mutation and owns IDs, PUSH/POP bookkeeping, and atomic cross-model persistence.

Goal, Root Intent, and Target operations must not corrupt or implicitly replace the active focus stack. Target promotion remains explicit.

Question note refs are set explicitly on an existing Question. Structural document merge/rename/replacement uses an explicit old→new mapping that atomically rewrites affected Journey Question and KnowledgeTarget refs without changing State, Evidence, or Question status. Referenced notes must resolve inside the workspace `notes/` tree before they are attached or used for root closure.

## Read-only recovery and inspection

Use the read-only projection after context loss, when the learner asks where they are or why the current gap matters, or when recursive depth is hard to follow. A read-only projection reports persisted state but is not routing authority and cannot authorize a mutation.

**Completion criterion:** a runtime operation is complete only after its command succeeds and the resulting state satisfies the requested operation without cross-model invariant errors.
