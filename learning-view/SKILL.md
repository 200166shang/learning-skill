---
name: learning-view
description: "Use when the learner wants to open, focus, inspect, or pin the native Desktop Learning Companion window or asks to see the current learning map in the desktop app."
---

# Learning: View

Operate the native Desktop Learning Companion as a thin UI adapter. The companion is a read-only projection of Learning state; this skill never owns or mutates learning state.

## Route these intents here

Treat phrases such as these as desktop-window intents, not requests to generate diagrams:

- "open the learning window"
- "show my learning map"
- "open/focus the companion"
- "pin the learning window"
- "keep the learning window on top"

Do **not** substitute Mermaid, Markdown graphs, terminal charts, or a browser page when the learner asked for the native window.

## Operation

1. Resolve the Learning workspace from the learner's current context. If one active workspace is already known, reuse it instead of asking again.
2. Prefer an available desktop/computer-control capability to find and focus an already-running Learning Companion rather than launching duplicates.
3. If the companion is not running and shell execution is available, use the installed viewer at `${CODEX_HOME:-$HOME/.codex}/skills/_learning-viewer`:
   - install its dependencies once with `npm ci --prefix <viewer-dir>` when needed;
   - launch it for the workspace with the equivalent of `npm run viewer -- --workspace <workspace>` from the Learning Suite repository, or `node <viewer-dir>/scripts/launch.mjs --workspace <workspace>` when using the installed copy;
   - launch non-blockingly when the host supports it so the learning conversation can continue.
4. If the learner asks to pin/unpin or focus the window and desktop control is available, perform that window action directly.
5. Report only a concise success/failure relevant to the window operation.

If the host cannot control or launch desktop applications, state that limitation and give the exact local launch command. Never reinterpret the request as a different visualization task.

## Read-only boundary

Opening, focusing, or pinning the application may change desktop window state, but this skill must not mutate `.learning` domain state, create questions, choose roots, record evidence, or change Review/Practice state.
