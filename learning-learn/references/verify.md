# Verify

Verification produces one Evidence entry with `kind`, `result`, `independence`, demonstrated capabilities, remaining gaps, and timestamp.

Verification is a closure gate, not the default conversational cadence. Keep teaching while the learner is exploring. A spontaneous learner explanation or teach-back may satisfy the gate when it genuinely demonstrates the required connection; record that demonstrated understanding instead of repeating it as a quiz. When it is incomplete, ask only the smallest natural probe needed to decide closure.

For a child, use its parent, `why_needed`, and `resume_checkpoint`. Ask a natural connection or transfer question. Only `kind: child_connection` plus `result: pass` may close it.

For a root, request one end-to-end teach-back and probe the smallest important “then it…” jump. Only `kind: root_teach_back` plus `result: pass` may close the root and Episode.

`uncertain` and `fail` remain evidence but never close a question. “I understand,” an AI explanation, or an existing note is not sufficient on its own; passing Evidence must be learner-produced. If the learner declines verification, continue or pause without fabricating a pass.
