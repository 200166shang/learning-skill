# Learning Skills

A recursive learning system for Codex with one primary user interface: `$learning`.

## Install or update

```bash
./install.sh
```

The installer copies the canonical skill, compatibility entry points, observer, and shared model into `~/.codex/skills/`.

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

Migrate a legacy workspace non-destructively with:

```bash
node ~/.codex/skills/_shared/scripts/migrate-learning-journey.mjs <workspace>
```

Migration reads explicit `derived-from` provenance and active state, creates `.learning/journey.yaml`, and leaves existing notes unchanged. When Journey exists, it is the sole learning-map source; otherwise the renderer uses legacy `derived-from` relations as a compatibility fallback.

The former `learning-route`, `learning-teach`, `learning-verify`, `learning-synthesis`, `learning-curate`, and `learning-note` skills remain thin compatibility entry points for one release. New workflows should use `$learning`.

## Read-only observer

`learning-observe` starts or reconnects to the removable Web Observer for an existing workspace. The presentation layer remains outside the learning workflow and does not own state or knowledge.
