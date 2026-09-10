# Findings

## V7 产品约束

- Workspace 是长期容器，top-level root 是有限 Episode；全局单 root 会让系统错误地持续扩张。
- Journey、Evidence、State、Notes、OVERVIEW 各自只有一个职责。Note 存在不等于学习者理解。
- Child closure 需要 `child_connection/pass`；Root closure 需要 `root_teach_back/pass`。
- Root closure 后必须 `mode: idle`、`active_episode_id: null`、`focus_stack: []`，等待用户提出下一目标。
- 只有 learner asked/accepted 的问题能进入 Journey；OVERVIEW 中的 boundary 不能触发 route。
- Review 优先 retrieval，保存 `review` evidence，不篡改历史 Episode；V7 不引入 FSRS 或数值 mastery。
- Misconception 只记录用户真实表达过的错误理解。

## 当前实现差距

- Journey v1 是单 `root_id` 树且没有 lifecycle；State v1 重复保存问题文本与 resume 内容。
- 没有 Evidence ledger，closure verdict 不持久化。
- Map/View/Web/Observer 形成大量派生层，且安装器会构建并部署它们。
- `SYNTHESIS.md` 同时承担复习入口和未解决 gap 描述，存在 routing authority 泄漏。
- 当前工作树在 main 上只有用户未跟踪的 observer demo 产物；已新建 `codex/v7-learning-loop`。
