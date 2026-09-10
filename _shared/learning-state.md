# Learning state

`.learning/state.yaml` is the private, lightweight working memory for recursive learning. It answers only: what is the root question, what is currently being understood, why was each child opened, and where must the learner return.

It is not a learner-facing curriculum, completion tracker, candidate queue, or mastery model. The human-readable `learning-map.md` records only questions the learner actually chose to pursue.

## Minimal schema

```yaml
version: 1

root_question:
  id: q001
  question: MCU 是如何把上位机命令最终变成电机运动的？

focus_stack:
  - id: q001
    question: MCU 是如何把上位机命令最终变成电机运动的？
    note: notes/mcu-command-to-motor.md

  - id: q007
    question: PID 为什么最终输出 PWM？
    parent: q001
    why_needed: 理解 MCU 控制链路时，PID 到实际电机控制之间存在断层。
    resume:
      question: MCU 是如何把上位机命令最终变成电机运动的？
      checkpoint: PID 输出如何进入电机执行链路？

current_focus: q007
```

## Operations

- **Push:** append the smallest blocking question with `parent`, `why_needed`, and a precise `resume.checkpoint`; set it as `current_focus`.
- **Pop:** only after its local connection is closed; remove the top frame, set `current_focus` to its parent, and resume at the saved checkpoint.
- **Root:** keep the root as the first frame while the topic is active. Do not add `stage`, `mode`, lifecycle, completion, or candidate fields.

If the file is absent, infer the active question from the learner's request and existing artifacts. Create it only when a workspace is in scope and recursive state needs to persist.
