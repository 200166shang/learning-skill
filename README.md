# Learning Skills

Personal learning workflow skills for Codex.

Included skills:

- `learning-route`: recursive learning orchestrator.
- `learning-teach`: one-question teaching worker.
- `learning-verify`: connection continuity checker.
- `learning-synthesis`: whole-picture synthesis worker.
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

## V4.1: Recursive Understanding Loop + Generated Understanding Map

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

The loop can be summarized as eight actions:

```text
FRAME → EXPLAIN → DETECT → DIVE → LEARN → CLOSE → BACKTRACK → SYNTHESIZE
```

`learning-route` is the only orchestrator. The stack in `.learning/state.yaml` remembers why a child question was opened and exactly where to return; it is not a curriculum or mastery tracker.

The map has two sources of truth and two generated views:

```text
KnowledgeNotes + derived-from lineage ─┐
                                      ├─→ learning-map.md
.learning/state.yaml focus_stack ─────┘   learning-map.mmd
```

`learning-map.md` is the generated view of questions the learner actually pursued—not a curriculum, mastery model, progress score, or AI-generated question tree. Regenerate both views after relevant note, lineage, PUSH, or POP changes:

```bash
node ~/.codex/skills/_shared/scripts/render-learning-map.mjs <workspace>
```

The renderer recursively scans `notes/**/*.md`, reads canonical `derived-from` relations and the optional active focus stack, and tolerates missing state, missing notes, malformed relations, missing parent refs, and cycles with warnings where appropriate.

Use a Ticket only when an independent source, experiment, or research task needs its own context. `MISSION.md`, generated maps, `notes/`, and (when recursive state must persist) `.learning/state.yaml` are the preferred new workspace artifacts. Existing `learning.yaml`, `records/`, and v2 LearningRecords remain readable for migration.
