# Learning thread

Follow this workflow for a concrete question, broad-scope orientation, or resume.

## Start

Choose the matching entry:

- **Concrete question:** accept the learner's question as the Root Question, inspect
  only the supplied Source Fragments relevant to its first causal connection, and
  begin that useful explanation immediately. Do not put setup, document scaffolding,
  a source inventory, or a generated curriculum before the explanation.
- **Broad scope without a useful question:** cheaply scan only filenames, headings,
  tables of contents, prepared-video chapters and timestamps, and code entry points,
  imports, calls, or public interfaces. Label exactly one end-to-end Root Question as
  the recommendation and give a short reason it connects the scope. Offer zero, one,
  or two explicitly labelled alternatives only when they are genuinely different
  routes, each with a short reason. Do not present several equal candidates. Stop
  after the conversational choices unless the learner has already delegated the
  decision. Do not acquire media, run OCR, exhaustively summarize the sources, or
  create a curriculum. Begin only after the learner chooses, or use the recommendation
  when the learner delegates the choice. “Do not choose for me” means recommend and
  then wait: a recommendation is not acceptance and does not establish the thread.
- **Resume:** read the article's `当前学习位置` section, start at the deepest current
  question, then follow its saved return points one level at a time. Resume is complete
  when the next explanation advances that active path without skipping an ancestor.

Treat supplied readable files, links, and prepared notes as the default Source
Boundary. Ask before expanding it. Ask for missing readable material only when the
requested causal connection cannot be established without it; otherwise continue
with the supported part and keep the limitation visible.

## Ground the explanation

Keep a low-resolution inventory of the agreed Source Boundary, but support important
causal edges beside the prose with precise Source Fragments. Use the source's natural
locator:

- Markdown or official documentation: file or URL plus heading;
- PDF: file or URL plus one-based page and, when useful, section;
- prepared video notes: note path plus chapter and timestamp range;
- repository code: workspace-relative path plus symbol, with a line location only
  when it is stable enough to help.

Do not imply that unreadable or uninspected material was inspected. Rendering a PDF
without actually opening the rendered page or extracting its text does not make its
contents inspected. Derive a PDF locator from the actual one-based page inspected;
never turn a numbered heading or list item into a page number. General background
may clarify an ordinary concept, but distinguish it from claims attributed to the
Source Boundary. When material, describe a claim in plain language as source-supported,
inferred, unresolved, or conflicting.
Show materially conflicting fragments together and state how the conflict changes or
limits the answer to the Root Question; never silently choose the convenient account.
Cite contestable, source-specific, central, or later-verifiable connections rather
than citing every sentence.

## Follow the main line

For each turn:

1. Explain the current question causally, using only source or code evidence that
   helps establish the next connection. State uncertainty where the sources do not
   settle a claim. This step is complete when the learner can see how the current
   connection advances the main line.
2. Classify an interruption by dependency, not by difficulty or topic size:
   - **Inline repair:** a brief supported bridge is enough for the learner to use the
     next causal connection. Explain it in place and continue; normally do not create
     a question or a separate check.
   - **Blocking Gap:** the learner cannot yet use a missing connection that the current
     explanation needs next. Open one child and suspend its parent.
   - **Pending Question:** the question is useful but the next connection does not
     depend on it. Preserve it under `待探索` with the context in which it arose, and
     leave the Active Path unchanged.
3. Work from the deepest current question. At that level, open at most one child for
   a Blocking Gap. A child may later open its own necessary child, so one Active Path
   can recurse through multiple levels. Keep every ancestor suspended; create no
   sibling frontier. For each new child, say and record in plain language:
   - the child question and missing connection it repairs;
   - why that connection blocks the immediate parent;
   - the exact parent sentence or causal arrow that is its Return Point.
   Append only that child to the Active Path and Question Lineage. Mark its parent
   suspended and the child current; do not advance, check, or open a child at any
   shallower level while a deeper question remains active.
   If the missing connection needs its own teaching plus a later learner reply or
   check before the parent can resume, it is a Blocking Gap: expose the routing triple
   before teaching it rather than treating the whole exchange as an inline repair.
   When the response ends waiting for the learner at this new deepest question,
   persist the full new path without changing `状态：学习中`; otherwise a fresh
   session could not know which question was opened. Ordinary turn-taking is not a
   learner pause.
4. Teach the child until the missing connection is available. At a natural boundary,
   use the smallest useful check: ask for the child-to-parent link, inspect a tiny
   example, or apply the mechanism once. A check is complete when that link is
   established; verification is not required on every reply.
5. When the learner makes the deepest missing connection available, return only to
   that child's immediate parent Return Point. Keep the child incomplete while
   rewriting or continuing the parent sentence with the repaired mechanism visible
   in causal reading order. Only after that integration remove the child from the
   Active Path, mark it `[已回填]`, and mark its parent `[当前]`. Restore that parent's
   saved blocking reason as `当前阻塞` when it is itself a child. Make this integration
   visible in the response and Markdown before considering the next ancestor; never
   pop several levels as one unexplained jump.
   Removing a returned child from the Active Path never removes it from Question
   Lineage: retain every actually pursued descendant as `[已回填]` through later
   returns and root closure.
   A child is complete only after this merge. Repeat the same operation upward, one
   saved Return Point at a time, until another gap appears or the Root Question is
   coherent.
6. When all children have been integrated and the Root Question is coherent, ask one
   end-to-end Completion Check: have the learner reconstruct the important cause,
   mechanism, consequence, and any material limitation needed by the explanation, or
   apply the chain once. Generated prose, a saved document, or completed child checks
   are not evidence for root closure. Ask one check at a time and wait for the
   learner's answer.

Let questions emerge from real confusion or a broken causal arrow. Do not turn a
brief bridge into structure merely because it has a name, and do not collapse a
learner-stated unresolved dependency into an inline answer merely because the source
contains a short result. Keep side questions durable without letting them steal the
main line.

## Maintain one living document

Use one Living Learning Document per Learning Thread by default. Organize it in
explanatory order, revising earlier prose when understanding changes. Put a child into
the relevant subsection or parent paragraph. Create a separate reusable Concept
document only when the learner explicitly asks, or when it has a clearly independent
reusable scope.

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
If the learner stops, declines a check, or asks to continue later, that is a pause
checkpoint: set `状态：暂停`, preserve the complete Active Path with every per-level
blocking reason and Return Point, and keep the deepest question current. Do not mark
any unreconnected child or the Root Question complete. An explicit continuation may
set the status back to `学习中` and advance the same deepest question.

While the thread is active, keep this small, human-readable routing section near the
top and overwrite it as the path changes:

```markdown
## 当前学习位置
- 状态：学习中
- 主问题：<Root Question>
- 资源范围：<agreed readable sources>
- 活动路径：
  1. <Root Question>
  2. <child question>
     - 阻塞：<why this question prevents its immediate parent connection>
     - 回到：<exact parent sentence or causal arrow>
  3. <deepest child question>
     - 阻塞：<why this question prevents its immediate parent connection>
     - 回到：<exact parent sentence or causal arrow>
- 当前阻塞：为什么最深问题阻塞它的父层
```

Record the entire active path and each non-root level's own blocking reason and Return
Point in order. `当前阻塞` summarizes only the deepest pair; it does not replace the
per-level records. The Root Question is the path origin, so never give its numbered
item a blocking reason or Return Point. Keep `当前阻塞` as a routing field after the
whole numbered list, not nested under one item. When no child is active, keep only the
numbered Root Question, omit `当前阻塞`, and record
`下一连接：<the next causal connection being developed>`; do not invent a synthetic
child. A fresh session must be able to identify the Root Question, current position,
Source Boundary, and supporting Source Fragments from this Markdown alone.

Keep the three views separate:

- `当前学习位置` / Active Path says where learning is now and where a child returns.
- `问题脉络` / Question Lineage keeps only accepted questions the learner actually
  pursued. Add the accepted Root Question at the first checkpoint and each child when
  it is actually opened; use compact states such as `[暂停]`, `[当前]`, and
  `[已回填]` to distinguish suspended ancestors from the one deepest question.
  Never add broad-scope candidates or manufacture a question tree.
- `核心因果链` / Causal Chain is a mechanism-oriented sequence of complete
  propositions. For each important edge, name how the cause produces the consequence
  and place its Source Fragment beside it. It is not a transcript, outline, or copy of
  Question Lineage.

Every stable checkpoint includes `来源` as the low-resolution Source Boundary
inventory; it does not replace the local Source Fragments in the explanation or
Causal Chain. Remove optional empty sections instead of filling them with placeholders.
When Pending Questions exist, keep this separate durable section outside routing and
causal prose:

```markdown
## 待探索

- <question in learner language>（<where it arose; optionally what it may extend>）
```

Pending Questions have no prerequisites, priority tree, schedule, or automatic
promotion. Omit the section when it is empty.

Before an orientation choice is accepted, do not create or update a Living Learning
Document. Candidate questions remain only in the conversation. Once the learner
accepts or delegates exactly one Root Question, establish its one-item Active Path,
add only that pursued question to Question Lineage, record the agreed Source Boundary,
and begin the first useful causal connection before the first checkpoint write.

## Complete the root

Interpret the root Completion Check by the essential connection, not exact wording.
If the answer is incomplete, keep the Root Question active, identify the smallest
missing part, repair it inline or open one Blocking Gap, and check again only at the
next natural boundary. If the learner declines or stops, use the pause contract.

Close only when no child remains, the article has a coherent end-to-end answer, the
learner has completed that root check, and remaining uncertainty is visible. At the
closing checkpoint:

- replace `当前学习位置` with `学习结果`; do not retain an Active Path or current
  Blocking Gap;
- record `状态：已完成`, the Root Question, and one concise `完成依据` describing what
  causal chain or application the learner demonstrated;
- mark the Root Question `[已完成]` and retain pursued children as `[已回填]` in
  Question Lineage;
- keep the integrated Causal Chain in explanatory order and preserve Pending Questions
  or material uncertainty.

The Completion Basis is not a score, mastery claim, or test transcript. Use this
human-readable shape and omit empty optional lines:

```markdown
## 学习结果
- 状态：已完成
- 主问题：<resolved Root Question>
- 完成依据：<concise learner reconstruction or small application>
- 保留的不确定性：<only when material>
```

## Finish

Before pausing or closing, confirm that the response and article agree, every active
level has a return point, and each repaired child is visibly reconnected to its parent.
Report the article path and what was integrated when a write occurred.
