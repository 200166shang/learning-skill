---
name: learning-view
description: "Native learning-window control. Use when the learner asks to open, show, focus, inspect, pin, or keep the Learning Companion or learning map on top."
---

# Learning: View

Operate the native Desktop Learning Companion as a thin UI adapter. The companion is a read-only projection of Learning state; this skill never owns learning state.

## Contract

- Treat requests to open, show, focus, inspect, pin, or keep the learning window on top as native-window intents.
- Launch through `node ~/.codex/skills/learning-view/scripts/open-viewer.mjs --workspace <workspace>`; add `--goal <goal-id>` only when the learner already selected a Goal. The launcher reuses and focuses an already-running Learning Companion for the same workspace, otherwise it returns only after the first learning projection renders.
- After launch, use host desktop control for focus or pin/unpin when that capability exists.
- Return only the window-operation result the learner needs.

The target is the native companion window. Mermaid, Markdown graphs, terminal charts, and browser pages are not substitutes for a native-window request.

## Workspace resolution

Resolve the Learning workspace from current context. Reuse a known active workspace instead of asking for it again. If no workspace can be resolved, explain what is missing rather than guessing.

## Read-only boundary

Opening, focusing, inspecting, or pinning the application may change desktop window state, but this skill must not mutate `.learning` domain state, create questions, choose roots, record evidence, or change Review/Practice state.
