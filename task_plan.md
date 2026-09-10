# Learning Skill V6 迭代计划

## 目标

保留递归理解循环，将 Learning Journey 与 Knowledge Base 正交化，并把用户界面收敛为一个显式调用的 `$learning` deep workflow。Web Observer 保持只读且不在本轮修改范围内。

## 阶段

- [complete] 1. 读取最新 V4.1 指令并审计仓库现状
- [complete] 2. 为 Map CLI seam 增加黑盒测试并实现 renderer
- [complete] 3. 收紧 route/teach/synthesis/state 契约与 UI metadata
- [complete] 4. 增加 10 个 recursive workflow smoke cases 并更新 README
- [complete] 5. 运行 fixtures、Skill validator、YAML/Markdown/安装脚本静态校验
- [complete] 6. 审计 V5 方案、现有 renderer、Skill 契约与测试基线
- [complete] 7. 抽取 shared state/record/graph/view-model/transition 模块并重构 renderer
- [complete] 8. 实现只读 Web server、SSE watcher、note 安全读取与自动更新
- [complete] 9. 实现 React Flow 学习观察器 UI、stack/why/return/timeline/note preview
- [complete] 10. 改善 route 的 PUSH/POP/RESUME 反馈并补齐 curate 兼容边界
- [complete] 11. 完善 fixtures、单元/集成/UI 构建测试、README 与删除 web 后兼容性验证
- [complete] 12. 新增 learning-observe 薄启动 Skill、复用机制与安装后 runtime 打包
- [complete] 13. 新增 Journey schema、读写 API、校验与非破坏 migration
- [complete] 14. 将 Map canonical identity 改为 Journey Question，并保留 legacy fallback
- [complete] 15. 引入 write-time reuse/revise/create 与 KnowledgeNote semantic relations
- [complete] 16. 新增显式 `$learning` 入口与按分支 progressive disclosure references
- [complete] 17. 将旧 learning Skills 收敛为 compatibility wrappers，并完成回归验证

## 决策记录

- Source of truth：`.learning/journey.yaml` 保存真实追问历史，KnowledgeNotes 保存可复用知识，`.learning/state.yaml` 只保存 active working memory。
- `learning-map.md` 与 `learning-map.mmd` 是同一内部 graph 的派生视图。
- CLI seam：`node _shared/scripts/render-learning-map.mjs <workspace>`。
- Renderer 只读 source of truth；不推断关系、不生成问题、不修改 state。
- 当前 focus、parent 均由 stack 位置推导，frame `id` 保留作稳定引用。
- Shared model 位于 `_shared/lib/`，Web 与 Markdown/Mermaid renderer 共同消费它。
- Web 只提供 `GET /api/view`、`GET /api/note`、`GET /events`，默认仅绑定 `127.0.0.1`。
- UI 视觉方向采用“学习调试器工作台”：高密度但克制，突出 current、active path 与 return address。

## 风险与待验证项

- 引入 npm 依赖后仍需保证删除 `web/` 不破坏 Skill Core；shared 依赖与 Web 依赖边界需要明确。
- `derived-from` 只作为无 Journey 工作区的 legacy fallback 和 migration 输入。
- cycle、坏 frontmatter、缺失 parent 必须 warning 后继续生成有限图。

## 错误记录

- `quick_validate.py` 没有 executable bit，直接调用得到 permission denied；改用 `python3 quick_validate.py` 后五个 Skill 均通过。
- `read_thread` 首次请求的 `maxOutputCharsPerItem=30000` 超过接口上限；已改为 20000，长方案仍会被单项截断，因此以可读取内容和用户明确目标为实现基线。
- Shared renderer 首次回归为 3/5；两个失败均因测试仍断言旧 `flowchart TD`，实现已按 V5 要求改为 `LR`，同步更新测试预期。
- `init_skill.py` 首次创建 learning-curate 时因 short_description 为 65 字符而拒绝生成 UI metadata；目录与 scaffold 已创建，随后使用更短描述补齐一致的 metadata。
- 首次加入 DOMPurify 时安装了已废弃的 `@types/dompurify` stub，且单 bundle 超过 500 kB；移除 stub 并用 Vite manual chunks 分离 graph/markdown 依赖。
- 首次兼容性模拟包含清理临时目录的 `rm -rf`，被执行环境的安全规则拒绝且未执行；改用 rsync 排除目录且不做删除的测试副本。
- 兼容性副本中 `npm ci --prefix <tmp>/_shared` 在 npm 11 错误识别包名为 `_shared@`；改为进入副本目录执行 `npm ci`，避开 prefix 路径解析问题。
