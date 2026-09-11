# Independent Sol learning smoke check

This directory contains unmodified workspace snapshots captured after actual
agent turns, not scripted teaching fixtures. The agent used `gpt-5.6-sol`, started
with no parent conversation, and received only the candidate learning skill,
its runtime location, a fresh workspace, and the raw
[scan facts](../fixtures/laserscan-source.md). It was not shown the grader or
expected answers. Reasoning effort was not overridden; the host default applied.

The candidate was a temporary runtime-only installation of the in-progress
checkout based on `b0abb4b4b05825c6216a8bd3e631b6967ec55cbd`. Its exact installed
file hashes are in [candidate-manifest.json](candidate-manifest.json).
Later concurrency and CLI hardening was still being developed during this smoke
check; do not treat this as model replay of every byte in the final commit.

The learning skill SHA-256 was
`2ba4306bb6f07f73b78e4054570522b5af646b027144e2109e06565270b83435`.
Workspace timestamps and commit revisions are preserved in each snapshot's
`.learning/document.yaml`. The temporary absolute source paths in the notes are
part of the original artifacts and were not rewritten for publication.

## Observed turns

1. `teach`: “请使用这份资料，从头教我雷达的数据模型。我想形成可以持续学习的内容，当前具体问题是：雷达的一帧数据包含什么，如何表示角度和距离？用中文自然讲解。”
2. `continue-array`: “继续。请具体展示一个角度如何映射到数组位置。”
3. `dont-know`: “我不知道为什么 +30 度变成那个下标。请换一种方式解释，然后继续主线；先别考我。”
4. `continue-time`: “继续讲时间戳、运动、frame_id 和 TF。”
5. `insufficient`: “保存的材料还是太像摘要了，请把详细教学内容补到正文里，方便我以后独立复习。”
6. `status`: “我目前学到哪里了？保存的材料在哪里？只查询状态和文件事实，不要改动任何文件。”
7. `resume` (new agent, no previous conversation): “这是一个没有旧聊天的新会话。请仅根据这个学习目录恢复当前问题，告诉我实际保存了什么，以及应该从哪里接续。先不改动任何文件。用中文。”

After each final answer, the coordinating agent checked the actual note and copied the
workspace before sending the next prompt. The first turn created an associated
article without an additional save reminder. The second preserved the first
chapter and saved the inverse formula, worked calculation, seven-position table,
radian calculation, and the non-grid-angle boundary. The third saved a separate
count-the-gaps explanation and continued the data-model thread without a quiz.
The fourth saved the first-ray timestamp meaning, sec/nsec components, motion
and pose consequences, non-network waiting time, and the frame-name/TF-transform
distinction. It explicitly bounded claims where the source lacked ray timing
or a compensation implementation.
The fifth replaced the opening chapter with a fuller standalone treatment while
retaining the later chapters; the resulting article was 11,833 bytes. Length is
reported as a file fact, not a quality score. The sixth reported the active
question and actual article; recursive comparisons of `notes/` and `.learning/`
against the fifth capture were byte-identical.

For the seventh turn, a separate fresh `gpt-5.6-sol` agent received only the
workspace path and the final candidate skill/runtime location. That installation
is identified by [final-candidate-manifest.json](final-candidate-manifest.json).
It recovered the root question, associated article, actual saved chapters,
latest saved section, absence of pending recovery and absence of verification.
It proposed continuing or checking understanding on the same root, not creating
a new topic. A second recursive comparison confirmed no state or note changes.
The coordinating agent attests session separation; file hashes cannot prove it.

The test suite checks each captured article's revision against its persisted
receipt and current-question association, and checks the read-only status
captures for byte equality. This validates captured artifacts, not unrecorded
tool chronology or all future model behavior.

These are coordinating-agent observations with persisted evidence, not human
semantic review, a full
raw tool-call transcript or a schema-v2 `grade.mjs` agent-replay record. Do not
claim three repetitions, a comparative latency result, or deterministic proof
of teaching quality from them.
