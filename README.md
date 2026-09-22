# Learning V6: Chat First

A small set of explicit Codex learning Skills built around normal high-quality
conversation and lightweight durable Learning Threads.

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

A broad Root Question can grow into an arbitrarily deep Question graph. Topic creation
does not end or replace that exploration: later follow-ups remain normal globally
numbered Questions, and an explicit Organize refresh decides whether they change the
Topic Compass.

For source-heavy questions that require broad multi-file tracing, Learn may isolate the
investigation in a temporary worker when the host supports it. This is optional; the
main agent still owns the learner-facing explanation and the same request must work
without multi-agent capability.

## Review

Use `$learning-review` with an existing Learning Thread when you want to retrieve saved
understanding. Review asks you to reconstruct the important mechanism before revealing
or comparing against the saved explanation. Ordinary Review does not move the current
Question, rewrite notes, or store review scores/schedules in the thread.

## Practice

Use `$learning-practice` with an existing Learning Thread when you want to apply saved
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
long-form Topic articles. It first writes a Topic Compass that fixes each Topic's
purpose, Question sources, required content, exclusions, and reading order. You can
review and revise the Compass before approving it. After approval, generate one Topic,
a range, or all Topics without re-planning their boundaries. As learning continues,
`refresh` compares new Questions with the Compass snapshot and proposes a minimal diff,
preserving unaffected Topic articles. Questions remain the durable learning history;
Topics are the current best explanation.

## Durable output

A Learning Thread uses this minimal shape:

```text
<thread>/
├── thread.yaml
└── questions/
    ├── q001.md
    ├── q002.md
    └── ...
```

`questions/*.md` preserve useful explanatory substance for relearning. `thread.yaml`
stores only the lightweight graph needed to locate those notes and resume later:

```yaml
version: 1

thread:
  title: Camera projection
  root: q001
  current: q003

nodes:
  q001:
    title: How does a 3D camera point become a 2D pixel?
    file: questions/q001.md
  q002:
    title: What does camera intrinsic matrix K mean?
    file: questions/q002.md
  q003:
    title: Where does K appear in object_track.cpp?
    file: questions/q003.md

edges:
  - from: q001
    to: q002
    type: deepens
  - from: q002
    to: q003
    type: applies
```

V6 intentionally has only three relation types: `deepens`, `applies`, and `related`.
The YAML is the single source of truth for question relationships and current position.
Markdown is for readable explanations. The graph records learning that happened; it
does not determine what must be learned next.

## Resume

Resume remains deliberately small:

1. read `thread.current`;
2. read that Question note;
3. follow relations only to the earlier notes needed for the new message;
4. continue normal conversation.

Do not reconstruct a hidden workflow state machine from the graph.

## Boundaries

V6 does not maintain Active Path, Blocking Gap, Return Point, Completion Check/Basis,
Memory Targets, review scheduling, practice state, mastery scores, generated
prerequisites, or a workflow runtime.

The downstream explicit workflows consume Learning Threads but do not own canonical
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
