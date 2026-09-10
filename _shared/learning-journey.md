# Learning Journey

`.learning/journey.yaml` is the durable history of questions the learner actually pursued. A Journey question is an event in a learning path; a KnowledgeNote is reusable knowledge. Several questions may therefore reference the same note.

```yaml
version: 1
root_id: q001
questions:
  - id: q001
    question: MCU 如何把命令变成电机运动？
    parent_id: null
    why_needed: null
    resume_checkpoint: null
    note_refs:
      - notes/mcu-control.md
  - id: q007
    question: PID 为什么最终输出 PWM？
    parent_id: q001
    why_needed: PID 到执行器之间存在理解断层。
    resume_checkpoint: PID 输出如何进入执行链路？
    note_refs:
      - notes/pwm-motor-effect.md
```

`id` is stable and shared with the corresponding active frame in `.learning/state.yaml`. Repeated question text in a different context receives a new ID. `note_refs` may contain zero, one, or several workspace-relative KnowledgeNote paths.

Append a question only after the learner asks it or explicitly chooses it. The file records traversal, not suggestions, mastery, progress, or a curriculum. PUSH appends a question and a matching state frame; note reconciliation updates `note_refs`; POP changes only state.
