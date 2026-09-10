---
name: learning-observe
description: Start or reconnect to the local read-only Learning Observer for a learning workspace and return its browser URL; use when the learner asks to open, launch, view, or visualize the current learning map or stack.
---

# Learning Observe

Launch the existing Web Observer as a thin operational wrapper. The observer reads learning state and KnowledgeNotes; this skill does not interpret the topic or mutate its workspace.

## Start

Resolve the workspace from the user's explicit path or the current learning workspace. Then run:

```bash
node <this-skill-directory>/scripts/start-observer.mjs <workspace>
```

Return the exact `http://127.0.0.1:<port>` URL printed by the script as a clickable link. Say whether the process was started or an existing healthy observer was reused. Do not wait on the server process after the URL is available.

If no workspace can be resolved, ask for its path. If the runtime is missing, report the script's installation guidance rather than attempting to recreate or reimplement the Web app.

Done when the URL responds and has been returned to the learner.
