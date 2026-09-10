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

## V5 方案摘要（2026-09-10）

- 核心边界：Skill Core 产生 `.learning/state.yaml` 与 KnowledgeNotes；Web 仅观察，不能修改任何学习状态或内容。
- Canonical state 保持极简；current、parent、depth、active path 均由 `focus_stack` 推导，禁止加入 UI 状态、进度或 mastery 字段。
- `_shared/lib/` 需要统一 YAML、frontmatter、graph、view model 与 runtime transition；现有 Markdown/Mermaid renderer 也应复用该模型。
- Graph 只包含真正进入过的学习问题；稳定 ID 使用 active frame id 或 normalized note path，不以标题作为唯一身份。
- Web 技术栈为 React + TypeScript + Vite + React Flow + Dagre + Tailwind；Node + chokidar + SSE 提供只读服务。
- UI 重点回答“我在哪里、为什么来这里、解决后回哪里”，包含 Graph、Learning Stack、Why Here、Return To、轻量 Timeline 与只读 Note Preview。
- Server 默认仅监听 `127.0.0.1`，note API 必须防 path traversal；文件变化 debounce 后构建 view 并广播。
- Runtime transition 只由相邻 stack 快照推导并保存在内存；不增加 event log、数据库或 event sourcing。
- 必须验证删除 `web/` 后 renderer 与所有 Skill 仍正常；Web 不是核心运行依赖。
- 浏览器视觉验收确认桌面首屏同时展示三层横向 graph、current stack、Why Here 与 Return To；点击 durable node 可打开只读 note 抽屉。
- 视觉验收发现初版 note API 返回完整 frontmatter 且前端直接注入 marked HTML；已改为 shared parser 提取正文，并使用 DOMPurify 净化渲染结果。
