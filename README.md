# Learning Skills

Personal learning workflow skills for Codex.

Included skills:

- `learning-route`: translate ordinary learning intent into one useful action.
- `learning-teach`: teach one concrete question and save/revise its KnowledgeNote.
- `learning-verify`: check whether a child-to-parent connection or root explanation actually holds.
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

## V4: Recursive Understanding Loop

The system follows the learner's real understanding gaps rather than generating a curriculum in advance:

```text
root question
    ↓
explain current focus → detect a real gap
    ↓                       ↓
continue             blocking gap: PUSH → learning-teach
                                             ↓
                                  learning-verify: connection closed?
                                             ↓
                                  POP → resume and reconnect parent
                                             ↓
                            root teach-back → learning-synthesis
```

`learning-route` is the only orchestrator. The stack in `.learning/state.yaml` remembers why a child question was opened and exactly where to return; it is not a curriculum or mastery tracker. `learning-map.md` grows only from questions the learner actually chose to pursue.

Use a Ticket only when an independent source, experiment, or research task needs its own context. `MISSION.md`, `learning-map.md`, `notes/`, and (when recursive state must persist) `.learning/state.yaml` are the preferred new workspace artifacts. Existing `learning.yaml`, `records/`, and v2 LearningRecords remain readable for migration.
