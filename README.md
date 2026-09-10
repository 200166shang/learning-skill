# Learning Skills

Personal learning workflow skills for Codex.

Included skills:

- `learning-route`: translate ordinary learning intent into one useful action.
- `learning-teach`: teach one concrete question, save/revise one KnowledgeNote, and continue through follow-ups.
- `learning-synthesis`: connect existing KnowledgeNotes into a coherent whole-picture explanation.
- `learning-note`: compatibility entry point for older prompts; prefer `learning-teach`.

The `_shared` directory contains the contracts used by the skills and must be installed alongside them.

## Install or update

Clone this repository, then run:

```bash
./install.sh
```

The installer copies the skills and `_shared` into `~/.codex/skills/`. Re-run it after pulling updates.

```bash
git pull
./install.sh
```

## V3 learning loop

The normal flow is intentionally small:

```text
say what you want to understand
        ↓
learning-teach → one KnowledgeNote
        ↓
follow-up question → learning-teach
        ↓
learning-synthesis → whole-picture explanation
```

Use a Ticket only when an independent source, experiment, or research task needs its own context. `MISSION.md`, `learning-map.md`, and `notes/` are the preferred new workspace artifacts. Existing `learning.yaml`, `records/`, and v2 LearningRecords remain readable for migration.
