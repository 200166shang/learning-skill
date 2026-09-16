# Recording contract

Use this contract only for durable recording or resume. Teaching quality must not be
changed to make recording easier.

## Workspace shape

Use one directory per Learning Thread:

```text
<thread>/
├── thread.yaml
└── questions/
    ├── q001.md
    ├── q002.md
    └── ...
```

`thread.yaml` is the single source of truth for routing and relationships. Question
Markdown is the readable learning artifact. Do not duplicate graph state in notes.

## Minimal schema

Keep the schema intentionally small:

```yaml
version: 1

thread:
  title: <human-readable title>
  root: q001
  current: q003

nodes:
  q001:
    title: <question in learner language>
    file: questions/q001.md
  q002:
    title: <question in learner language>
    file: questions/q002.md
  q003:
    title: <question in learner language>
    file: questions/q003.md

edges:
  - from: q001
    to: q002
    type: deepens
  - from: q002
    to: q003
    type: applies
```

Required top-level keys are `version`, `thread`, `nodes`, and `edges`. Keep
`version: 1`. `thread` contains only `title`, `root`, and `current`. Each node contains
only `title` and `file`. Each edge contains only `from`, `to`, and `type`.

Do not add fields speculatively. In particular, do not add Active Path, Blocking Gap,
Return Point, completion evidence, mastery, review state, source boundaries, generated
prerequisites, tags, or graph ontology fields.

## IDs

Use simple thread-local sequential IDs: `q001`, `q002`, and so on. IDs are stable after
creation. A renamed or improved question title keeps its ID and file.

## Record a turn

Record only a question the learner actually pursued and for which a useful explanation
was produced.

For a new thread:

1. Create `q001` from the learner's actual question.
2. Save the useful explanation to `questions/q001.md`.
3. Set both `root` and `current` to `q001`.
4. Start with an empty `edges` list.

For a later pursued question:

1. Reuse an existing node when the learner is plainly continuing the same question
   rather than creating a distinct question.
2. Otherwise allocate the next sequential ID and save a new question note.
3. Add at most one direct edge that best captures how the new question arose from a
   previously pursued question. Prefer the immediate conversational parent when it is
   clear. Do not manufacture ancestry when it is not clear.
4. Use only `deepens`, `applies`, or `related`.
5. Set `thread.current` to the question the learner is now pursuing.

When the learner explicitly returns to an existing question, set `current` to that
existing node instead of creating a duplicate node.

## Preserve the explanation

A question note exists to preserve what was useful to learn, not to normalize it into
a database record.

Use this lightweight shape:

```markdown
# <question>

<the useful explanation from the conversation, edited only as needed to read well on
its own>
```

Preserve important reasoning, examples, code explanations, analogies, caveats, and
source references that made the conversational answer useful. Do not replace them with
a terse summary merely because the question has been answered.

When a later turn materially improves the same explanation, integrate the improvement
into that question note in readable order. Do not append raw chat transcripts or
assistant/user labels.

## Sources

When an explanation depends on supplied code, documentation, PDFs, or prepared notes,
keep useful source locators close to the relevant prose in the Markdown note. Source
metadata is explanatory evidence, not graph routing state, so it does not belong in
`thread.yaml` version 1.

General conceptual explanation does not require pretending it came from the supplied
sources. Make the distinction clear when it matters.

## Resume

Read `thread.current` and its note first. If the new user message depends on earlier
context, inspect only the relevant connected nodes needed to understand it. Do not
parse Markdown to reconstruct relationships already represented in YAML.

A graph is a projection of learning that already happened. Never use it to force the
learner down a predetermined path.

## Determinism boundary

Be deterministic about persistence:

- valid minimal YAML;
- stable node IDs;
- existing nodes are not duplicated;
- only the three relation values are used;
- `current` points to an existing node;
- every edge endpoint exists;
- every node file exists;
- Markdown contains no second copy of graph routing state.

Be flexible about teaching. The recorder must adapt to a good explanation; the
explanation must not adapt to the recorder.
