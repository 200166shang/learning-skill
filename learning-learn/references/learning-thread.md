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

While the thread is active, keep this small, human-readable routing section near the
top and overwrite it as the path changes:

```markdown
## 当前学习位置
- 状态：学习中
- 主问题：<Root Question>
- 资源范围：<agreed readable sources>
- 活动路径：
  1. <Root Question>
  2. <child question>（回到：<exact parent sentence or connection>）
- 当前阻塞：为什么最深问题阻塞它的父层
```

Record the entire active path and every level's return point in order. When no child
is active, keep only the numbered Root Question, omit `当前阻塞`, and record
`下一连接：<the next causal connection being developed>`; do not invent a synthetic
child. A fresh session must be able to identify the Root Question, current position,
Source Boundary, and supporting Source Fragments from this Markdown alone.

Keep the three views separate:

- `当前学习位置` / Active Path says where learning is now and where a child returns.
- `问题脉络` / Question Lineage keeps only accepted questions the learner actually
  pursued. Add the accepted Root Question at the first checkpoint; never add broad-
  scope candidates or manufacture a question tree.
- `核心因果链` / Causal Chain is a mechanism-oriented sequence of complete
  propositions. For each important edge, name how the cause produces the consequence
  and place its Source Fragment beside it. It is not a transcript, outline, or copy of
  Question Lineage.

Every stable checkpoint includes `来源` as the low-resolution Source Boundary
inventory; it does not replace the local Source Fragments in the explanation or
Causal Chain. Remove optional empty sections instead of filling them with placeholders.

Before an orientation choice is accepted, do not create or update a Living Learning
Document. Candidate questions remain only in the conversation. Once the learner
accepts or delegates exactly one Root Question, establish its one-item Active Path,
add only that pursued question to Question Lineage, record the agreed Source Boundary,
and begin the first useful causal connection before the first checkpoint write.

## Finish

Before pausing or closing, confirm that the response and article agree, every active
level has a return point, and each repaired child is visibly reconnected to its parent.
Report the article path and what was integrated when a write occurred.
