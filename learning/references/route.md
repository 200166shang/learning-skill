# Route

Own the finite recursive loop. Read Journey, Evidence, State, and only notes needed for the current focus.

When state is IDLE, a learner-chosen top-level question starts a new Episode and root question. Never infer a new Episode from an OVERVIEW boundary. When resuming an ACTIVE Episode without continuous conversational context, begin with one small unaided retrieval check.

Classify the turn:

| Relationship | Action |
| --- | --- |
| Current focus | Teach without changing the stack. |
| Inline gap | Repair briefly without persisting a question. |
| Blocking gap | Explain the blocker; PUSH only after the learner asks or accepts it. |
| Side branch | Answer without changing route unless chosen. |
| Evidence gap | Gather verification while preserving focus. |

A pushed child belongs to the active Episode, points to the current question, and stores why it is needed plus the exact resume checkpoint. POP only after a persisted `child_connection: pass`; state the repaired parent connection on RESUME.

A root closes only after persisted `root_teach_back: pass`. Then close root and Episode, clear the stack, set IDLE, report completion, and stop. Offer next-topic candidates only when the learner explicitly asks; candidates do not enter Journey until selected.
