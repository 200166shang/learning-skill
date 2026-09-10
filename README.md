# Learning Skills

Personal learning workflow skills for Codex.

Included skills:

- `learning-route`: recursive learning orchestrator.
- `learning-teach`: one-question teaching worker.
- `learning-verify`: connection continuity checker.
- `learning-synthesis`: whole-picture synthesis worker.
- `learning-note`: compatibility entry point for older prompts; prefer `learning-teach`.
- `learning-curate`: analyze and safely reorganize accumulated KnowledgeNotes after learning.
- `learning-observe`: start or reconnect to the read-only Web Observer and return its URL.

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

## V5: Skill Core + Web Learning Observer

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

The core model has two sources of truth and several read-only views:

```text
KnowledgeNotes + derived-from lineage ─┐
                                      ├─→ Shared Learning Model ─→ learning-map.md / .mmd
.learning/state.yaml focus_stack ─────┘                         └→ Web Observer
```

`learning-map.md` is the generated view of questions the learner actually pursued—not a curriculum, mastery model, progress score, or AI-generated question tree. Regenerate both views after relevant note, lineage, PUSH, or POP changes:

```bash
node ~/.codex/skills/_shared/scripts/render-learning-map.mjs <workspace>
```

The renderer recursively scans `notes/**/*.md`, reads canonical `derived-from` relations and the optional active focus stack, and tolerates missing state, missing notes, malformed relations, missing parent refs, and cycles with warnings where appropriate. It uses the standard `yaml` parser installed with `_shared`.

Generate a JSON snapshot for debugging or integrations:

```bash
node ~/.codex/skills/_shared/scripts/render-learning-view.mjs <workspace>
```

### Run the read-only Web Observer

The observer is a removable presentation layer. It reads the shared model, watches the state and notes with `chokidar`, and sends updates to the browser over SSE. It never writes learning state or notes. After running `./install.sh`, the normal entry point is the thin launcher Skill:

```text
Use $learning-observe for /absolute/path/to/learning-workspace.
```

It starts the local server (or reuses the healthy server already watching that workspace) and returns a clickable `http://127.0.0.1:<port>` URL. Runtime PID metadata and logs live in the operating system's temporary directory, not the learning workspace.

To run the Web app directly during development:

```bash
cd web
npm install
npm run build
npm start -- /absolute/path/to/learning-workspace
```

Open `http://127.0.0.1:4174`. For development with Vite hot reload:

```bash
npm run dev -- /absolute/path/to/learning-workspace
```

Try the included fixture with `npm start -- ../examples/observer-demo`. The UI shows the actual explored graph, current stack, why the current question was opened, where learning returns next, in-memory transitions, and read-only KnowledgeNote previews. The server exposes only:

- `GET /api/view`
- `GET /api/note?path=notes/...md`
- `GET /events`

It binds to `127.0.0.1` by default. Override `LEARNING_WEB_PORT` when the default port is occupied. Note paths are resolved under `<workspace>/notes` and traversal is rejected.

The architectural deletion test is intentional: removing `web/` leaves every Skill, `_shared/lib`, `render-learning-map.mjs`, `render-learning-view.mjs`, KnowledgeNotes, and canonical state fully usable.

Use a Ticket only when an independent source, experiment, or research task needs its own context. `MISSION.md`, generated maps, `notes/`, and (when recursive state must persist) `.learning/state.yaml` are the preferred new workspace artifacts. Existing `learning.yaml`, `records/`, and v2 LearningRecords remain readable for migration.
