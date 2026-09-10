# Learning Skill V4.1 迭代计划

## 目标

在现有 V4 Recursive Understanding Loop 上增加 Generated Understanding Map，并收紧 worker 调用、metadata 与最小状态契约；不引入 curriculum、mastery 或新的 orchestration Skill。

## 阶段

- [complete] 1. 读取最新 V4.1 指令并审计仓库现状
- [complete] 2. 为 Map CLI seam 增加黑盒测试并实现 renderer
- [complete] 3. 收紧 route/teach/synthesis/state 契约与 UI metadata
- [complete] 4. 增加 10 个 recursive workflow smoke cases 并更新 README
- [complete] 5. 运行 fixtures、Skill validator、YAML/Markdown/安装脚本静态校验

## 决策记录

- Source of truth：KnowledgeNotes 的 `derived-from` + `.learning/state.yaml` 的 `focus_stack`。
- `learning-map.md` 与 `learning-map.mmd` 是同一内部 graph 的派生视图。
- CLI seam：`node _shared/scripts/render-learning-map.mjs <workspace>`。
- Renderer 只读 source of truth；不推断关系、不生成问题、不修改 state。
- 当前 focus、parent 均由 stack 位置推导，frame `id` 保留作稳定引用。

## 风险与待验证项

- 仓库没有依赖清单，renderer 需使用 Node 标准库并容忍有限 YAML 子集。
- `derived-from.ref` 可能相对 workspace 或当前 note；解析时兼容两者但不猜测标题关系。
- cycle、坏 frontmatter、缺失 parent 必须 warning 后继续生成有限图。

## 错误记录

- `quick_validate.py` 没有 executable bit，直接调用得到 permission denied；改用 `python3 quick_validate.py` 后五个 Skill 均通过。
