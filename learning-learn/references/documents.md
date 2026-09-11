# Document lifecycle

Conversation is the learning interface; the primary Topic/Module document is the durable teaching text. A learner should be able to review the explanation without reopening the chat. Save supported understanding during exploration, before mastery is verified.

## Delivery

**Default flow:** resolve current context → compose a complete teaching passage → commit it → present the saved passage or a linked excerpt → continue.

**Explicit write-first flow:** survey the requested sources → compose and commit the initial article → discuss and revise it on the same active path.

The first substantive learning explanation or real source-code execution chain earns a write. New worked examples, corrections, and explanations that repair uncertainty also belong in the article. Acknowledgements, navigation and status-only answers remain read-only. Existing adequate content can be referenced without a cosmetic rewrite.

Write the teaching passage once. Keep its causal links, relevant code explanation, worked calculations, units, limitations and precise sources in the document. Reuse that saved content in the response; an excerpt can be shorter but must not introduce substantive material absent from the article. Adapt the detail to the question instead of filling a rigid template. If the learner says the notes are too brief, expand the relevant article section with the missing explanation.

## Document hierarchy

- A **Topic/Module document** under `notes/` owns the main article. Continue its chapters across turns.
- A **Concept document** owns an independently reusable explanation. Reuse an existing one, or split one out only when its scope justifies it.
- `OVERVIEW.md` links to supported articles. It is a navigation aid, not a substitute for their body text.

Questions and documents are many-to-many. A child may revise its parent's article; a question may reference several articles. An active question with no substantive teaching yet may have no note refs. Keep the learning path and verification evidence separate from document revisions.

## Inspect and commit

Read [persistence](persistence.md) before the first KnowledgeNote write. Use the document module for ordinary chapter delivery:

```sh
node ~/.codex/skills/_shared/scripts/learning-document.mjs inspect <workspace>
node ~/.codex/skills/_shared/scripts/learning-document.mjs inspect <workspace> --document notes/topic.md --section 'Section title'
node ~/.codex/skills/_shared/scripts/learning-document.mjs schema
node ~/.codex/skills/_shared/scripts/learning-document.mjs commit <workspace> --input <draft.json>
```

The inspect result supplies current context, candidate/primary document, content and revision. Reuse an unambiguous primary document; inspect candidates when needed. The draft contains the current question, document path, complete section body Markdown, expected revision and a retry operation ID. The runtime adds the section heading: omit that heading from `markdown`, and use deeper headings for any subsections. New documents use `mode: "create"`, `expectedRevision: "absent"` and a document `title`; later chapters use `append`, and revisions to an existing chapter use `replace`. Obtain the exact fields from `schema` or `--help`, rather than reading implementation files. Create the JSON draft with the environment's file-edit tool. The runtime timestamps the operation when a timestamp is omitted.

Commit writes the chapter and associates the document with the question. It preserves unrelated sections and learning state, checks stale edits, and returns the persisted passage and a receipt. Use the returned path instead of retyping Chinese filenames. On conflict, re-read and merge; on an uncertain outcome, retry the same operation. If inspect reports an interrupted transaction, use the documented recovery command, inspect again, and resume the same passage. Report an unresolved save failure honestly; a failed save is not a delivered document.

For structural merge/rename/relink work, read [curation](curate.md) and use explicit replacements through the runtime. For a materially changed supported document map, read [overview](overview.md). Keep these occasional operations out of the ordinary chapter loop.

## Completion

Before delivering a substantive answer, confirm the saved passage contains its necessary explanation and examples. A file's existence, nonempty body or updated hash alone does not prove that coverage. A successful commit does prove the specific returned text was saved and linked. Give one short receipt naming the article and added section, then teach naturally.

The runtime cannot intercept an assistant that skips it and sends a final response. Behavioral replay tests cover that failure; do not claim a tool result proves all chat content is synchronized. Before closing a question, reconcile the touched articles and validate their refs without changing the active route.
