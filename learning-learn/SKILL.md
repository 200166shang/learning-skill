---
name: learning-learn
description: "Learn one learner-chosen question or source scope through a coherent recursive explanation and one living Markdown document."
disable-model-invocation: true
---

# Learning: Learn

Build one source-grounded explanation around the learner's chosen scope. Keep a
single **main line**; descend only into a **blocking gap**; resume at an explicit
**return point**. Fold stable understanding into one readable Markdown article.

## Start

Choose the matching entry:

- **Concrete question:** inspect only the relevant supplied sources and begin the
  useful explanation immediately. The explanation has started when it states the
  first causal connection supported by those sources.
- **Broad scope without a useful question:** cheaply scan filenames, headings,
  entry points, imports or calls, and transcript chapter titles. Recommend one
  root question that connects the scope end to end. Offer at most two alternatives
  only when they expose genuinely different routes. Stop after the choices unless
  the learner has already delegated the decision. Begin only after the learner chooses,
  or use the recommendation when the learner delegates the choice. This branch is
  complete when the learner has a conversational choice, not a curriculum.
- **Resume:** read the article's `当前学习位置` section, start at the deepest current
  question, then follow its saved return points one level at a time. Resume is complete
  when the next explanation advances that active path without skipping an ancestor.

Treat supplied files and links as the learning boundary. Ask for missing material
only when the requested causal connection cannot be established without it.

## Follow the main line

For each turn:

1. Explain the current question causally, using only source or code evidence that
   helps establish the next connection. State uncertainty where the sources do not
   settle a claim. This step is complete when the learner can see how the current
   connection advances the main line.
2. Repair a small missing connection inline when a brief explanation is sufficient.
3. Work from the deepest current question. At that level, open at most one child only
   when a missing connection blocks further explanation. The child may later open its
   own necessary child, so one active path can recurse through multiple levels. Keep
   every ancestor suspended with its return point; create no sibling frontier. For
   each new child, say in plain language:
   - the blocking gap;
   - why the main line cannot continue without it;
   - the exact parent sentence or connection that is the return point.
4. Teach the child until the missing connection is available. At a natural boundary,
   use the smallest useful check: ask for the child-to-parent link, inspect a tiny
   example, or apply the mechanism once. A check is complete when that link is
   established; verification is not required on every reply.
5. Return immediately to the nearest parent's return point. Rewrite or continue that
   explanation with the repaired link visible, then repeat upward one level at a time.
   A child is complete only when its repaired connection is merged into its parent;
   the recursive path is complete only when the root main line is coherent again.
6. Close the root with an end-to-end learner explanation or concrete application
   when closure would help. Otherwise continue the conversation without manufacturing
   a test.

Let questions emerge from real confusion or a broken causal arrow. Keep side questions
that do not block the explanation conversational and preserve the current main line.

## Maintain one living document

Use one primary Topic or Module Markdown article by default. Organize it in explanatory
order, revising earlier prose when understanding changes. Put a child into the relevant
subsection or parent paragraph. Create a separate reusable Concept document only when
the learner explicitly asks, or when it has a clearly independent reusable scope.

At the first stable checkpoint, use the article path the learner supplied. Otherwise,
reuse the single existing primary document that clearly matches the topic. If neither
exists, choose a sensible path within the learner's workspace. Ask only when multiple
existing candidates create a real risk of overwriting the wrong document. A stable
checkpoint is one of:

- a coherent part of the main chain has been established;
- a blocking child has been repaired and merged into its parent;
- an earlier explanation has been corrected;
- the learner asks to organize or export the understanding;
- the session is pausing or the root is closing.

At a checkpoint, make at most one direct Markdown edit that integrates all stable
changes from the turn. Do not write merely because an assistant message was sent.

Keep this small, human-readable section near the top and overwrite it as the path
changes:

```markdown
## 当前学习位置
- 主问题：...
- 活动路径：主问题 → 子问题 A（回到：父层的具体句子或连接） → 当前问题 B（回到：父层的具体句子或连接）
- 当前阻塞：为什么最深问题阻塞它的父层
```

Record the entire active path and every level's return point in order. When no child
is active, keep only the main question. When the topic closes, mark it complete or
remove temporary routing details. A fresh session must be able to begin at the deepest
question, repair it, return to each ancestor in order, and recover the root main line
from this section and the surrounding article alone.

## Finish

Before pausing or closing, confirm that the response and article agree, every active
level has a return point, and each repaired child is visibly reconnected to its parent.
Report the article path and what was integrated when a write occurred.
