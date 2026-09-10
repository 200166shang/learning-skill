# Learning state

`.learning/state.yaml` is the private, lightweight working memory for recursive learning. It answers only: what is the root question, what is currently being understood, why was each child opened, and where must the learner return. Durable traversal history lives in [Learning Journey](learning-journey.md).

It is not a learner-facing curriculum, completion tracker, candidate queue, or mastery model. The generated `learning-map.md` records only questions the learner actually chose to pursue.

## Minimal schema

```yaml
version: 1

root_question:
  id: q001
  question: MCU 是如何把上位机命令最终变成电机运动的？

focus_stack:
  - id: q001
    question: MCU 是如何把上位机命令最终变成电机运动的？
  - id: q007
    question: PID 为什么最终输出 PWM？
    why_needed: 理解 MCU 控制链路时，PID 到实际电机控制之间存在断层。
    resume:
      question: MCU 是如何把上位机命令最终变成电机运动的？
      checkpoint: PID 输出如何进入电机执行链路？
```

The current focus is always the last frame in `focus_stack`; the previous frame is its parent. `frame.id` equals the corresponding Journey question ID, so V6 consumers map active state directly without title or note-path matching.

## Operations

- **Push:** append the learner-chosen question to Journey, then append a matching state frame with `why_needed` and a precise `resume.checkpoint`; the appended frame becomes current.
- **Pop:** only after its local connection is closed; remove the top frame, then resume the new top frame at the saved checkpoint.
- **Root:** keep the root as the first frame while the topic is active. Do not add `stage`, `mode`, lifecycle, completion, or candidate fields.

If the file is absent, infer the active question from the learner's request. Create state and its matching Journey root together when a workspace is in scope and recursive state needs to persist.
