# Learning V6: Chat First

A small set of explicit Codex learning Skills built around normal high-quality
conversation and lightweight durable multi-Root learning workspaces.

> **Teach first. Record second.**

`learning-learn` is the core. The model teaches naturally first, then preserves useful
explanations and a lightweight graph of the questions the learner actually pursued.
Review, Practice, Resources, and Organize consume those saved artifacts without
becoming part of the core teaching state.

## Workflows

```text
$learning-learn     understand something and preserve useful explanations
$learning-review    retrieve and reconstruct saved understanding
$learning-practice  apply saved understanding in one concrete task
$learning-resources find high-quality external materials worth inspecting
$learning-organize  turn pursued Questions into coherent Topic articles
$learning           tell me which explicit workflow fits
```

All six Skills are deliberately user-invoked. `$learning` recommends a workflow when
you are unsure which one fits; it does not auto-run the other Skills. Direct invocation
of any downstream Skill remains first-class.

## Learn

Ask a concrete question, optionally with source material:

```text
$learning-learn Using src/object_track.cpp, explain how camera intrinsics K and
projection appear in this code.
```

The Skill answers the question directly. When source material matters, source-specific
claims are grounded in it while ordinary background knowledge can still be used to
teach the concept clearly.

Follow-up questions remain normal conversation:

```text
I still do not understand why fx changes the pixel x coordinate.
```

The follow-up may deepen the previous explanation, apply it to code, move to a related
question, or return to an older question. There is no mandatory Blocking Gap, Return
Point, Active Path, or completion ceremony.

For an unfamiliar module, Learn first offers a small Root Compass: 3–5 broad ways into
the system. Activating a Root creates an independent recursive Question graph. Each
Root restarts visible numbering at `q001`, while stable IDs include the Root, such as
`r003-q002`. Similar Questions may remain under different Roots because they preserve
different learning contexts. Topic creation later aggregates their knowledge without
rewriting either exploration path.

For source-heavy questions that require broad multi-file tracing, Learn may isolate the
investigation in a temporary worker when the host supports it. This is optional; the
main agent still owns the learner-facing explanation and the same request must work
without multi-agent capability.

## Review

Use `$learning-review` with an existing learning workspace when you want to retrieve saved
understanding. Review asks you to reconstruct the important mechanism before revealing
or comparing against the saved explanation. Ordinary Review does not move the current
Question, rewrite notes, or store review scores/schedules in the thread.

## Practice

Use `$learning-practice` with an existing learning workspace when you want to apply saved
understanding. Practice presents one concrete application task at a time, lets you
attempt it before showing the solution, and explains the mechanism-level gap in the
attempt. Ordinary Practice does not add exercise state, scores, or practice nodes to
the thread.

## Resources

Use `$learning-resources` when you want a small, verified set of official docs, source
code, demos, articles, talks, videos, or courses to inspect yourself. It may use a
Question, an Organized Topic, or a free-form technical subject as context. It returns
curated links and precise entry points; it does not write a research report, create
Questions, or persist research notes.

## Organize

Use `$learning-organize` to reconstruct many pursued Questions as a coherent set of
long-form Topic articles. It first writes a cross-Root Topic Compass that fixes each
Topic's purpose, Root-qualified Question sources, required content, exclusions, and
reading order. You can review and revise the Compass before approving it. After
approval, generate one Topic,
a range, or all Topics without re-planning their boundaries. As learning continues,
`refresh` compares new Questions with the Compass snapshot and proposes a minimal diff,
preserving unaffected Topic articles. Questions remain the durable learning history;
Topics are the current best explanation.

## Durable output

A durable workspace uses this shape:

```text
<workspace>/
├── root-compass.yaml
└── questions/
    ├── r001-end-to-end/
    │   ├── thread.yaml
    │   ├── q001.md
    │   └── q002.md
    └── r003-concurrency/
        ├── thread.yaml
        └── q001.md
```

`root-compass.yaml` stores candidate, active, and explored Roots. A candidate has no
directory until selected. Each Root-local `thread.yaml` locates notes and preserves its
current/parent navigation:

```yaml
version: 1

root:
  id: r003
  title: How does concurrency work in this system?
current: r003-q002
nodes:
  r003-q001:
    seq: 1
    title: How does concurrency work in this system?
    file: q001.md
    parent: null
    status: explored
  r003-q002:
    seq: 2
    title: Why does TTS use a separate worker?
    file: q002.md
    parent: r003-q001
    status: active
```

Root-qualified IDs avoid ambiguity across repeated local numbers. Parent links record
the actual recursive path without trying to classify every relationship. Markdown is
for readable explanations. The graph records learning that happened; it does not
determine what must be learned next.

## Resume

Resume remains deliberately small:

1. resolve the named Root or the active Root;
2. read that Root's `current`;
3. read that Question note;
4. follow parent links only to the earlier notes needed for the new message;
5. continue normal conversation.

Do not reconstruct a hidden workflow state machine from the graph.

## Boundaries

V6 does not maintain Active Path, Blocking Gap, Return Point, Completion Check/Basis,
Memory Targets, review scheduling, practice state, mastery scores, generated
prerequisites, or a workflow runtime.

The downstream explicit workflows consume learning workspaces but do not own canonical
learning state. No persistent Custom Agent is required by this repository.

## Install or update

Install all six Skills with npm:

```bash
npx learning-skill
```

This installs to `${CODEX_HOME}/skills`, or `~/.codex/skills` when `CODEX_HOME` is
unset. Pass a custom skills directory when needed:

```bash
npx learning-skill /tmp/codex-skills
```

The command installs exactly these six Skills:

```text
learning
learning-learn
learning-review
learning-practice
learning-resources
learning-organize
```

The installation contains Skill instructions and interface metadata only. There is no
runtime service, viewer, review scheduler, hidden learning database, or Custom Agent
framework.

## Acceptance principle

Compare ordinary `$learning-learn` behavior with normal high-quality ChatGPT/Codex
teaching. If the Skill makes the explanation materially less clear, less complete, or
less natural, simplify the Skill rather than adding more teaching protocol.

Be deterministic about recording. Let the model teach.
