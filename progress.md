# Progress

## 2026-09-10

- 读取了用户引用对话的完整可用上下文，确认 V3 重构目标是递归教学循环，而不是继续拆分旧状态机。
- 读取规划技能要求并建立本计划、发现记录和进度日志。
- 已完成仓库文件清单审计；下一步读取现有 Skill 契约和 agent 配置。
- 新增 `learning-teach` 作为递归教学主 worker，并新增 `_shared/knowledge-note.md` 说明 KnowledgeNote 与“已掌握”记录的边界。
- 将 `learning-route` 改为可隐式调用的 intent dispatcher；将 `learning-synthesis` 收敛为只读取 Mission/Map/Notes 并生成整体解释。
- 将 `learning-note` 保留为兼容入口；删除其旧 branch references 和 synthesis 的旧 mode references，避免双重 workflow。
- 更新 README、安装脚本、Ticket/Record/state 共享契约。
- 校验通过：`bash -n install.sh`、`git diff --check`、入口内无断裂 `references/` 链接。
- YAML agent 配置均通过 Ruby YAML 解析；重构完成，未执行安装脚本，因此没有改写用户的 `~/.codex/skills/`。
- 读取并采用最新 V4.1 方案，将 Map 定义为 KnowledgeNote lineage 与 focus stack 的派生视图。
- 先为 renderer CLI 增加黑盒测试，确认缺失实现时为 RED；实现后标准 lineage、空 workspace、missing parent 三项变为 GREEN。
- 简化 state：current focus 与 parent 均由 stack 位置推导；收紧 route worker 加载契约与 synthesis metadata。
- 新增 10 个 recursive workflow smoke cases，并更新 README 为 V4.1。
- 最终验证：renderer 黑盒测试 5/5 通过，五个 Skill 均通过官方 quick validator，agent YAML、install.sh 语法与 `git diff --check` 均通过。
- 保持安装边界：未执行 `install.sh`，因此本轮只修改仓库，没有覆盖已安装 Skill。
- 启动 V5 目标，读取参考会话的最新可用方案与两个适用技能说明。
- 将既有规划扩展到 V5：shared model、只读 Web observer、UI、Skill 反馈、测试与文档六个阶段。
- 完成 `_shared/lib` 首版拆分，并将 renderer 改为消费统一 graph；首次回归 3/5，确认失败仅为 V4.1 的纵向布局断言，已更新并新增 model/transition 测试。
- 完成 Web observer server、SSE watcher、React Flow/Dagre UI、stack/why/return/timeline/note preview 与演示 workspace；首轮 Web 测试 3/3、production build 通过。
- 完成浏览器视觉验收与 node 点击交互；随后收紧 note preview，隐藏 frontmatter 并净化 Markdown HTML。
- 新增 nested note watcher 测试，确认 chokidar 变更会 debounce 为一次刷新；Web 测试现为 4/4。
- 最终验证通过：shared model/renderer 9/9、Web server/watcher 4/4、Vite/TypeScript production build、6 个 Skill validator、install.sh 语法、git diff check。
- 在不包含 `web/` 的独立临时副本中重新安装 `_shared` 依赖，成功生成 learning-map.md、learning-map.mmd 与 learning-view.json，确认 Web 可删除边界成立。
- 新增 `learning-observe`：解析 workspace、寻找可用本地端口、后台启动 observer、健康检查、复用同 workspace 服务并返回 URL；运行记录仅写系统临时目录。
- `learning-observe` 启动/复用测试 1/1、Skill validator、Web 4/4、shared 9/9、production build、shell/diff 检查全部通过。
- 在独立临时 Skills 布局中安装 `_shared` 与 Web production 依赖，installed launcher 成功返回并响应 `http://127.0.0.1:4367`；测试服务随后终止。
- 启动 V6：读取 Review Skill 哲学对话中的执行方案，并按当前 Skill 机制校准显式调用配置。
- 新增 Learning Journey 合同、读写/校验 API、migration CLI 及测试；migration 只采用显式 provenance 并保留旧 notes。
- Map/View Model 在 Journey 存在时只消费 Journey + state；无 Journey 时继续使用 legacy `derived-from` fallback。
- 新增 `$learning` deep workflow 与六个 conditional references；旧 Skills 已缩减为兼容 wrapper。
- 更新 KnowledgeNote/LearningRecord/Synthesis 语义与 README/installer；Web 文件保持未修改。
- V6 最终验证：shared 测试 14/14、8 个 Skill validator、install.sh 语法与 git diff check 通过。
