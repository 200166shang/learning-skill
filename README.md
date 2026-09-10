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

## Workspace upgrades

Use `$learning` normally. If an older supported workspace is detected, `$learning` upgrades it once to the current workspace schema before future learning continues. Existing KnowledgeNotes are preserved, and normal rendering continues to use only canonical Journey and active state.

## Read-only observer

`learning-observe` starts or reconnects to the removable Web Observer for an existing workspace. The presentation layer remains outside the learning workflow and does not own state or knowledge.
