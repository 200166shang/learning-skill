# Document lifecycle

Conversation is the learning interface; documents are its durable output. Reconcile documents after substantive learning, not after every turn. A document records supported understanding, never mastery Evidence and never a reason to change the active Question path.

## Two entry sequences

**Default flow:** conversation → durable understanding → document reconcile → continue.

**Explicit write-first flow:** source survey → initial document → conversation → continuous document reconcile. Use this alternate start when the learner asks for a knowledge map, study guide, or source synthesis before discussion. Preserve any active Question and continue the same lifecycle afterward; write-first is not a separate learning mode.

## What earns a write

Substantive learning has occurred when a causal mechanism, source-code execution chain, durable distinction, correction, or important child-to-parent connection is now supported. Acknowledgements, requests for another example, small wording clarifications, and still-unresolved exploration do not by themselves earn a write.

## Document hierarchy

- `OVERVIEW.md` is the workspace/topic index and whole-picture navigation. Keep detailed knowledge in supported documents.
- A **Topic/Module document** is the primary working article for a project, module, or source chain. A module-learning Episode should normally keep revising one obvious primary document.
- A **Concept document** owns an independently reusable mechanism such as USART, PID, PWM, or Tensor. Split one out only when that scope is coherent and useful outside the current Topic document.

The Document Graph and Question Tree are many-to-many and non-isomorphic: several Questions may contribute to one document, one Question may reference several documents, and `note_refs: []` remains valid. Never create one document per Question by default. KnowledgeNotes explain reusable knowledge; Journey Questions record why it was pursued here.

## Reconcile

1. Search `notes/**/*.md` by concept, mechanism, tags, and vocabulary.
2. Revise the active Topic/Module document when the understanding belongs there.
3. Reuse and revise an existing Concept document when it already owns the idea; link it from the Topic document when useful.
4. Create a Concept document only for independently reusable, coherent knowledge.
5. Read [persistence](persistence.md) before writing a KnowledgeNote. After the files exist, attach the relevant Question refs through the deterministic runtime; never hand-edit Journey YAML.
6. Read [curation](curate.md) when touched documents overlap, move, merge, or need structural hygiene. Use explicit old→new mappings to rewrite affected Question and KnowledgeTarget refs.
7. Read [overview](overview.md) only when the supported document map materially changes.

After a child, reconcile only its useful contribution and touched documents; it may reference the parent's Topic document. Before root closure, reconcile the primary Topic/Module document, link any extracted concepts, validate touched refs, and perform bounded hygiene over touched documents only.

**Completion criterion:** each substantive understanding is represented in the best existing or newly justified document, all touched Question/KnowledgeTarget refs resolve through the runtime, the active route is unchanged, and no duplicate Question-shaped note was introduced.
