# Learning Skills

A recursive learning system for Codex with one primary user interface: `$learning`.

## Install or update

```bash
./install.sh
```

The installer exposes `$learning` as the sole learning workflow and installs the shared runtime. It also installs `$learning-observe` as an optional read-only presentation tool.

## V6 domain model

The workflow follows real broken arrows rather than generating a curriculum:

```text
PUSH → LEARN → VERIFY → POP → RESUME
```

Its durable model separates traversal from knowledge:

```text
.learning/state.yaml    active recursive working memory
.learning/journey.yaml  questions the learner actually pursued
notes/*.md              reusable KnowledgeNotes
```

Several Journey questions may resolve to one KnowledgeNote, and one question may use several notes. Before writing knowledge, the workflow searches existing notes and chooses `reuse`, `revise`, or `create`.

Generated artifacts are views rather than canonical state:

- `learning-map.md` and `learning-map.mmd` show how learning unfolded, sourced from Journey plus active state.
- `SYNTHESIS.md` is the single whole-picture review entry point, sourced from the current Knowledge Base.

Run the map renderer with:

```bash
node ~/.codex/skills/_shared/scripts/render-learning-map.mjs <workspace>
```

## Migration

The normal renderer requires `.learning/journey.yaml`; it never reconstructs traversal from note titles, paths, active-state guesses, or legacy relations. Migrate a legacy workspace non-destructively with:

```bash
node ~/.codex/skills/_shared/scripts/migrate-learning-journey.mjs <workspace>
```

Migration alone may read old `derived-from` provenance and active-state hints. It creates `.learning/journey.yaml` and leaves existing KnowledgeNotes unchanged. After migration, Journey plus active state is the sole learning-map traversal source.

## Read-only observer

`learning-observe` starts or reconnects to the removable Web Observer for an existing workspace. The presentation layer remains outside the learning workflow and does not own state or knowledge.
