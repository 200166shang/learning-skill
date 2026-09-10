# Learning Skill V3 重构计划

## 目标

围绕递归教学循环重构当前 Skill：用户只表达学习意图，Skill 内部维护状态；主流程聚焦小问题与知识笔记，`learning-synthesis` 只负责把已有知识串成完整理解，Ticket 降级为按需的跨上下文调查工具。

## 阶段

- [complete] 1. 审计现有 Skill、引用和验证入口，确定兼容边界
- [complete] 2. 重写入口与核心 Skill 契约，收敛用户可见 workflow
- [complete] 3. 清理/迁移旧的 synthesis 状态机与引用，补充新的持久化模型说明
- [complete] 4. 更新 README、agent 配置与示例，确保安装后入口一致
- [complete] 5. 静态检查、契约检查并总结兼容性影响

## 决策记录

- 主循环：`learning-teach → KnowledgeNote → follow-up → learning-teach`。
- 用户接口：自然语言意图；`stage`、`mode`、Ticket lifecycle、completion provenance 默认隐藏。
- `learning-synthesis`：读取 Mission、Knowledge Map、notes，输出 coherent synthesis document；不再承载日常 gap/ticket/integrate lifecycle。
- Ticket：仅在需要独立源码调查或跨上下文工作时按需创建。
- 暂不把 LearningRecord 继续作为“文章完成证明”；知识文章统一以 KnowledgeNote/LearningNote 表达。保留旧记录格式时必须标明兼容用途。

## 风险与待验证项

- 现有仓库可能没有 `learning-teach`，需要决定是新增入口还是复用/改名 `learning-note`。
- 旧文件和已生成项目可能依赖 `learning.yaml`、Ticket、Record 字段；本次优先更新 Skill 契约，并明确迁移/兼容策略，不擅自删除用户产物。
- 必须检查所有 Skill 之间是否仍互相要求用户手动进入内部 mode。

## 错误记录

暂无。
