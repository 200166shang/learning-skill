# Recursive learning smoke cases

These cases verify observable orchestration behavior. The route branch inside `$learning` owns every stack transition; other branches return local results without mutating state.

## Case 1: ordinary follow-up

**Given:** root “PID 是怎么工作的？” and the learner asks “积分项为什么能消除稳态误差？”

**Expect:** treat it as the current focus, do not push, and load the teach branch for that concrete question.

## Case 2: inline gap

**Given:** current “PID 为什么输出 PWM？” and the learner asks “PWM 全称是什么？”

**Expect:** answer briefly inline, create no note or map node, do not push, and resume the current explanation.

## Case 3: blocking gap

**Given:** current “PID 为什么输出 PWM？” and the learner says “但我不知道 PWM 为什么能控制电机速度。”

**Expect:** push “PWM 为什么能控制电机速度？”, record `why_needed` and the exact resume checkpoint, then teach the child.

## Case 4: nested blocking gap

**Given:** while learning why PWM controls speed, the learner cannot explain why duty cycle changes the average effect.

**Expect:** push a smaller child. The active path becomes PID → PWM-to-motor → duty-to-average-effect; do not flatten or pre-generate sibling questions.

## Case 5: local verification remains open

**Given:** the child was explained but the learner cannot connect it to its parent.

**Expect:** the verify branch reports `open`; do not pop. Identify the smallest broken arrow and continue the current child or push that smaller blocking gap.

## Case 6: local verification closes

**Given:** the learner can use the child explanation to support the parent connection.

**Expect:** record the note when appropriate, pop, resume the parent's checkpoint, and explicitly explain child → parent. Do not end with “你接下来想学什么？” while the parent remains suspended.

## Case 7: side branch

**Given:** current “PID” and the learner asks “那 MPC 是不是更先进？”

**Expect:** answer briefly and mark it non-blocking. Do not change the stack or add a map node unless the learner explicitly chooses to pursue MPC.

## Case 8: evidence gap

**Given:** the learner asks “MCU 多久收不到串口命令会停车？” and the answer requires source inspection.

**Expect:** preserve the stack, collect repository/source evidence, return it to the teach branch, and explain the result. Research never mutates recursive state.

## Case 9: resume in a new session

**Given:** state contains the active path MCU controls motor → PID outputs PWM → PWM controls speed, and the learner says “继续昨天那个问题。”

**Expect:** load state, derive current focus from the final frame, and resume the PWM question without restarting the root.

## Case 10: root teach-back

**Given:** the learner believes the full topic is understood.

**Expect:** load the verify branch in root mode and ask the learner to reconstruct the mechanism. Reopen the smallest blocking “then it…” jump; only a continuous explanation with no blocking gap permits synthesis.

## Derived-map assertions

After a confirmed note or lineage change, blocking PUSH, or successful POP, the route runs `render-learning-map.mjs` after its primary writes. The renderer may refresh only `learning-map.md` and `learning-map.mmd`; it never changes state, invents relations, persists suggested questions, or assigns mastery/confidence.
