# Findings

## 讨论结论

- 当前复杂度主要来自把学习设计成项目生命周期状态机：Map、Ticket、Record、completion、integration、lineage 多个状态维度同时暴露给用户。
- 用户真实目标是递归知识树：学习一个小问题，保存一篇解释，阅读时产生 follow-up，再继续学习，最后统一 synthesis。
- `LearningNote/Lesson` 是“教过/解释过什么”；真正掌握状态如果未来需要，可另设精简的 learning record，不应拿文章自动证明“已学会”。
- knowledge lineage 与 learning decision map 是正交概念；本轮先不扩展复杂图模型。
- Route 应是意图适配器/薄入口；只有真正需要用户决策的分支才停下来询问。

## 当前仓库初步结构

- 入口：`learning-route/`、`learning-note/`、`learning-synthesis/`。
- `learning-synthesis/` 当前带有 `start`、`draft`、`capture-gaps`、`integrate`、`lineage`、`status` 等 references。
- 共享契约：`_shared/learning-record.md`、`_shared/knowledge-ticket.md`、`_shared/learning-synthesis-state.md`。
- 尚未发现 `learning-teach/`。
