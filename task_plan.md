# Learning Skill V7 迭代计划

## 目标

将 V6 重构为 evidence-backed、user-directed、recursive、finite 的学习 Skill：有限 Episode、证据驱动关闭、根问题关闭后 IDLE、人工触发 Review、OVERVIEW 只组织已有知识，并移除 Map/Web/Observe。

## 阶段

- [complete] 1. 读取最终 V7 方案、适用 Skill 指南并审计仓库/工作树
- [complete] 2. 设计并实现 Journey v2、Evidence v1、State v2 及跨模型校验
- [complete] 3. 实现 V1→V2 迁移、OVERVIEW 一次性迁移和 status projection
- [complete] 4. 重写 learning Skill 与 route/teach/verify/review/persistence/overview/upgrade 契约
- [complete] 5. 删除 Map、Web、Observer 及其依赖，更新安装器、README 与示例
- [complete] 6. 扩充并运行领域模型、迁移、CLI、Skill、安装器与静态验证
- [complete] 7. 审计 diff、提交并推送 codex/v7-learning-loop

## 核心决策

- `.learning/journey.yaml` 保存 Episode/Question 历史；`.learning/evidence.yaml` 保存 verification 与 misconception；`.learning/state.yaml` 只保存 active/idle 与 ID stack。
- Question 只有获得匹配类型的 pass evidence 才能关闭；root 关闭同时关闭 Episode 并清空为 IDLE。
- Review 追加证据但不改变已关闭的历史 Episode；复习失败后只有用户选择重学才创建新 Episode。
- `OVERVIEW.md` 是非权威知识投影，绝不创建问题、PUSH 或 Episode。
- 用户未跟踪文件 `--help/` 和 observer demo 生成物保持不动且不提交。

## 错误记录

- `create_goal` 返回已有 active goal；改为读取并沿用该目标。
- `read_thread` 的 `maxOutputCharsPerItem=30000` 超限；降为 20000。最终方案单条仍被截断，但关键 0–24 节与删除/测试方向均已恢复。
