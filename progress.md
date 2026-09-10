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
