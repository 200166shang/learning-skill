# Learning V5 Product Specification

> Status: In progress; first decision frontier accepted  
> Wayfinder map: [Define a small question-led personal learning V5](https://github.com/200166shang/learning-skill/issues/110)

## 1. Product sentence

Given a learner-chosen question or readable source scope, Learning maintains one
coherent inquiry path, descends only into a question that blocks the next causal
connection, returns through every suspended parent, and folds stable understanding
into one readable document. Selected ideas may later enter a small learner-invoked
review queue.

## 2. Product boundary

V5 is a personal Codex workflow backed by Markdown. It is not a course generator,
general knowledge base, media acquisition pipeline, graph editor, or learning
management system.

The first version owns:

- orientation from a concrete question or readable source scope;
- one resumable Learning Thread and one Active Path;
- source-grounded causal explanation;
- recursive repair of genuine Blocking Gaps;
- Pending Questions that do not interrupt the current path;
- one Living Learning Document per thread by default;
- Completion Checks at meaningful boundaries;
- selective promotion into a Markdown Review Queue.

The first version does not own:

- video download, transcription, subtitle extraction, or OCR;
- exhaustive summarization of every supplied source;
- generated curricula, full question trees, or parallel learning branches;
- a database, hidden workspace schema, durable entity IDs, or transaction runtime;
- a bundled knowledge-graph runtime or native viewer; an optional read-only
  Obsidian projection may render canonical Markdown without owning learning state;
- full FSRS scheduling, automatic reminders, or background notifications.

Canonical terms are defined in [CONTEXT.md](../../CONTEXT.md).

## 3. Core experience

### 3.1 Concrete-question entry

When the learner supplies a concrete question and readable sources, Learning:

1. inspects only source material relevant to the first causal connection;
2. treats the supplied material as the initial source boundary;
3. begins the useful explanation immediately;
4. creates or updates the Living Learning Document at the first stable checkpoint.

It does not initialize a runtime, generate IDs, produce a curriculum, or summarize
all sources before teaching.

### 3.2 Broad-scope orientation

When the learner supplies readable sources but no useful question, Learning performs
only a cheap structural scan:

- file names and directory shape;
- document headings and tables of contents;
- transcript chapters and timestamps;
- code entry points, imports, calls, and public interfaces.

It then presents:

1. one recommended Root Question that connects the supplied scope end to end;
2. at most two alternatives, and only when they create genuinely different routes;
3. a short reason each route is useful.

Learning waits for the learner to choose. If the learner explicitly delegates the
choice, Learning uses its recommendation. Candidate questions remain conversational
and are not persisted as a generated tree.

### 3.3 Unreadable or insufficient sources

Learning names the missing access or missing causal evidence precisely. It asks for
an accessible export or additional source only when the requested connection cannot
be established from the current boundary. It may continue with the supported part
while marking uncertainty; it must not silently substitute unsupported general
knowledge for source-grounded claims.

The exact citation and conflict behavior remains open in
[Define Source Fragment citations and evidence boundaries](https://github.com/200166shang/learning-skill/issues/112).

## 4. Learning Thread document contract

A Learning Thread normally has one primary Markdown file. The file is both the
learner-facing explanation and the only durable resume surface for the thread.
Temporary routing state stays small and readable near the top; the rest is organized
as an article, not as a chat transcript.

### 4.1 Required shape while active

```markdown
# <human-readable topic title>

## 当前学习位置
- 状态：学习中
- 主问题：<the Root Question>
- 资源范围：<readable files, links, or prepared notes in scope>
- 活动路径：
  1. <Root Question>
  2. <child question>（回到：<exact parent connection>）
  3. <deepest question>（回到：<exact parent connection>）
- 当前阻塞：<why the deepest question prevents its parent from continuing>

## <explanatory sections in causal order>

<the continuously revised explanation>

## 待探索

- <a non-blocking Pending Question and why it was noticed>

## 来源

- <source boundary and stable references used by the explanation>
```

Rules:

- `当前学习位置` is overwritten as the route changes; it is not an event log.
- `活动路径` contains the complete root-to-deepest path in order.
- Every non-root path item contains its own Return Point.
- `当前阻塞` describes only the deepest active gap.
- `待探索` contains non-blocking questions only and does not impose an order.
- Explanatory sections are revised in causal reading order.
- `来源` records the source boundary; exact Source Fragment syntax is decided later.
- Optional empty sections are removed rather than filled with placeholders.

### 4.2 Shape with no active child

When the Root Question is active without a child, `当前学习位置` contains only its
status, Root Question, source boundary, and the next connection being developed.
There is no empty Blocking Gap or synthetic child.

### 4.3 Shape when complete

When the Root Question closes:

```markdown
## 学习结果
- 状态：已完成
- 主问题：<the resolved Root Question>
- 完成依据：<the learner reconstruction or small application>
- 后续：<optional Pending Questions or promoted Memory Targets>
```

The temporary Active Path and Blocking Gap are removed. The final article remains
readable without understanding the learning process that produced it.

The definition of sufficient Completion Checks remains open in
[Define completion checks and Learning Thread closure](https://github.com/200166shang/learning-skill/issues/115).

### 4.4 Durable-write policy

Learning writes at a stable checkpoint:

- a coherent part of the causal chain has been established;
- a Blocking Gap has been repaired and reconnected to its parent;
- earlier understanding has been corrected;
- the learner asks to organize or export the result;
- the session is pausing or the Root Question is closing.

At a checkpoint, one direct Markdown edit integrates the stable changes from the
turn. Sending an assistant reply alone is not a reason to write.

### 4.5 Location, lineage, and causality are different views

V5 must not overload one graph with three different meanings:

| View | Question it answers | Durability |
|---|---|---|
| Active Path | Where am I now, and where do I return? | Overwritten as focus changes |
| Question Lineage | Which learner-pursued questions grew from which parent? | Kept as a compact history |
| Causal Chain | Which mechanism or condition connects one learned proposition to the next? | Integrated into the article |

The Active Path remains in `当前学习位置`. Question Lineage grows only from questions
the learner actually pursued; it is not a generated curriculum and does not contain
unaccepted candidate questions. A compact representation is:

```markdown
## 问题脉络

- [进行中] 为什么电流升高时控制器会降低 PWM 占空比？
  - [已回填] ADC 读数如何换算成电流？
    - 结果：[电流测量](#电流测量)
  - [当前] 电流误差如何改变占空比请求？
```

`当前学习位置` makes the exact route and Return Point explicit:

```markdown
## 当前学习位置
- 主问题：为什么电流升高时控制器会降低 PWM 占空比？
- 活动路径：
  1. 为什么电流升高时控制器会降低 PWM 占空比？
  2. 电流误差如何改变占空比请求？
     - 阻塞：还不能连接限流判断与 PWM 更新。
     - 回到：[限流闭环](#限流闭环)中“控制器计算新的占空比请求”。
```

The causal explanation uses complete propositions and labels the connection between
them. It belongs next to the explanatory prose rather than inside routing state:

```markdown
## 核心因果链

1. 采样电阻上的压降随电流升高。
   - 通过：欧姆定律把电流变化转换成可测电压。
   - 依据：<Source Fragment>
2. ADC 读数因此升高，换算后的测量电流超过限流目标。
   - 通过：测量电流与目标电流形成负向控制误差。
   - 依据：<Source Fragment>
3. 控制器降低 PWM 占空比请求，使电机平均电压下降。
   - 结果：电流被推回目标范围。
   - 依据：<Source Fragment>
```

An Obsidian plugin may render `问题脉络` as a mind map and `当前学习位置` as a
highlighted root-to-current route. A mind map alone is not the Causal Chain because
hierarchical parenthood does not express mechanism or direction. If the plugin later
renders causality, it should derive a labelled directed chain from `核心因果链`.

Markdown remains the source of truth. The plugin must not require private IDs, keep a
second copy of statuses, or become necessary for resume.

## 5. Recursive inquiry contract

### 5.1 Classify the gap

Before opening another question, Learning classifies what interrupted the explanation:

| Classification | Test | Action |
|---|---|---|
| Inline repair | A brief supported bridge restores the next causal connection | Explain it inline and continue |
| Blocking Gap | The parent explanation cannot make its next causal connection without learning this | Open one child and save the Return Point |
| Pending Question | It is useful or interesting but not required for the next parent connection | Record it under `待探索` and continue |

The test is dependency, not difficulty or topic size.

### 5.2 Open a child

Only the deepest active question may open one child. When it does, Learning states:

1. the child question;
2. the missing connection it repairs;
3. why the parent cannot continue without it;
4. the exact parent sentence or causal arrow that is the Return Point.

The child is appended to the Active Path. Ancestors remain suspended; no sibling
frontier is created.

### 5.3 Work at the deepest point

Learning explains and discusses only the deepest active question until its missing
connection is available. A child may recursively open one necessary child of its own.
New tangents become Pending Questions unless they block the deepest question.

### 5.4 Return and integrate

When the current Blocking Gap is repaired, Learning:

1. performs the smallest useful Completion Check when the boundary calls for one;
2. returns to the nearest saved Return Point;
3. rewrites or continues the parent explanation with the repaired connection visible;
4. removes the completed child from the Active Path;
5. repeats upward one parent at a time until another gap appears or the Root Question
   becomes coherent.

A child is not complete merely because it received an answer. It is complete only
after its connection has been integrated into its parent.

### 5.5 Pending Questions

A Pending Question records only:

- the question in learner language;
- the context in which it arose;
- an optional note about which explanation it may extend.

Pending Questions have no generated prerequisites, schedule, priority tree, or
automatic promotion. The learner may later choose one as the Root Question of a new
Learning Thread.

## 6. Public skill surface and source handoff

### 6.1 Recommended V5 surface

V5 keeps one user-invoked public skill: `$learning-learn`.

The invocation communicates intent in ordinary language:

```text
$learning-learn Using these sources, help me understand why ...
$learning-learn Help me find one connecting question for this module ...
$learning-learn Resume this learning document ...
$learning-learn Review the Memory Targets currently due in this Review Queue ...
```

Learning and review are distinguishable intents inside one personal workflow, not
separate runtimes. Whether review deserves a second public entry point remains a
learner decision before this section is final.

### 6.2 Handoff boundary

Learning consumes readable sources or prepared learning artifacts:

- repository files and code locations;
- readable local documents and PDFs;
- accessible official documentation links;
- transcripts, chapter notes, or evidence-backed notes produced by a media workflow.

For video, the upstream workflow produces readable, addressable notes. The learner
then passes those notes to Learning together with a question or broad learning scope.
Learning does not expose media-provider stages, run downloads, or retain video.

Example handoff:

```text
$video-learning <video or course source and requested chapter-note preferences>
$learning-learn Using <path to the resulting notes>, help me understand <question or scope>.
```

If a PDF or web page is unreadable in the current environment, Learning requests an
accessible copy instead of taking ownership of conversion infrastructure.

## 7. Review contract

This section is intentionally not yet normative. It will be decided through:

- [Define selective Memory Target promotion](https://github.com/200166shang/learning-skill/issues/116)
- [Prototype the minimal Markdown Review Queue](https://github.com/200166shang/learning-skill/issues/117)

Confirmed constraints:

- not every answer or note becomes a Memory Target;
- a target must be worth retrieving, likely to be forgotten, and independently checkable;
- review is learner-invoked in V5;
- Markdown is the durable representation;
- full FSRS and automatic notifications are outside the V5 core.

## 8. Resume, correction, and recovery

This section remains open until the Learning Thread document and Source Fragment
contracts are validated. It will be decided in
[Define cross-session resume, correction, and recovery](https://github.com/200166shang/learning-skill/issues/118).

## 9. Acceptance

Representative end-to-end acceptance scenarios will be decided after the upstream
contracts settle in
[Define representative V5 acceptance scenarios](https://github.com/200166shang/learning-skill/issues/120).

At minimum, the eventual scenarios must cover concrete-question entry, broad-scope
orientation, nested Blocking Gaps and ordered return, a Pending Question that does
not steal focus, cross-session resume, selective Memory Target promotion, and one
due-review interaction.

## 10. Next decisions

The first frontier is accepted: document shape, orientation, recursive inquiry,
Question Lineage, Causal Chain, one public skill, and the external media handoff are
normative. The next specification pass must decide:

1. Source Fragment addressing, attribution, uncertainty, and conflict behavior.
2. Completion Checks and Learning Thread closure.
3. Memory Target promotion and the minimal Review Queue.
4. Cross-session resume, correction, and recovery.
