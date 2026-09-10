---
version: 2
title: PID 为什么最终输出 PWM？
record_type: note
created_at: 2026-09-10
relations:
  - type: derived-from
    ref: notes/mcu-command.md
    question: PID 为什么最终输出 PWM？
---

# PID 为什么最终输出 PWM？

PID 计算出的控制量需要映射为驱动器能够执行的占空比，PWM 再通过功率级改变电机的平均电压。
