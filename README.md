# Learning V6: Chat First

A small user-invoked Codex skill for learning through normal high-quality conversation
while preserving useful explanations and a lightweight graph of the questions the
learner actually pursued.

> **Teach first. Record second.**

The model's normal teaching ability is the primary learning experience. The skill does
not impose a curriculum or learning state machine on the answer. Durable structure is
added after useful teaching so the learning can be resumed and projected into tools
such as Obsidian without making that structure control the conversation.

## Use it

Ask a concrete question, optionally with source material:

```text
$learning-learn Using src/object_track.cpp, explain how camera intrinsics K and
projection appear in this code.
```

The skill answers the question directly. When source material matters, source-specific
claims are grounded in it while ordinary background knowledge can still be used to
teach the concept clearly.

Follow-up questions remain normal conversation:

```text
I still do not understand why fx changes the pixel x coordinate.
```

The follow-up may deepen the previous explanation, apply it to code, move to a related
question, or return to an older question. There is no mandatory Blocking Gap, Return
Point, Active Path, or completion ceremony.

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

`questions/*.md` preserve the useful explanatory substance of the conversation.
`thread.yaml` stores only the lightweight graph needed to locate those notes and resume
later:

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

V6 intentionally starts with only three relation types:

- `deepens`: digs further into understanding an earlier question;
- `applies`: applies earlier understanding to code, an example, or a concrete case;
- `related`: arose from the same learning context without being a simple deepening or
  application.

The YAML is the single source of truth for question relationships and current position.
Markdown is for readable explanations. A renderer may derive an Obsidian/Tauri graph
from these files, but the projection does not own learning state.

## Resume

Resume is deliberately small:

1. read `thread.current`;
2. read that question note;
3. follow relations to only the earlier notes needed for the learner's new message;
4. continue normal conversation.

The graph is a projection of learning that happened, not a plan that determines what
must happen next.

## What V6 removes from the core

V6 does not maintain Active Path, Blocking Gap, Return Point, Question Lineage,
Completion Check/Basis, Memory Targets, Concept promotion, review scheduling, or V4/V5
migration state. Git history preserves the old implementation; the new core does not
carry compatibility machinery into every learning turn.

Review, spaced repetition, reusable concept extraction, Obsidian export, and viewers
may be added as separate explicit workflows that consume V6's saved notes and graph.
They are not part of `$learning-learn`.

## Install or update

```bash
./install.sh
```

By default this installs `learning-learn` to
`${CODEX_HOME:-$HOME/.codex}/skills`. Pass a skills directory as the first argument to
install elsewhere:

```bash
./install.sh /tmp/codex-skills
```

The installed skill contains `SKILL.md`, interface metadata, and the lightweight
recording contract. It has no runtime service, viewer, review scheduler, or hidden
learning database.

## Acceptance principle

Compare the same real learning question with and without the skill. If the skill makes
the explanation materially less clear, less complete, or less natural, simplify the
skill rather than adding more teaching protocol.

Be deterministic about recording. Let the model teach.
