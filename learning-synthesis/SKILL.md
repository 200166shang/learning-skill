---
name: learning-synthesis
description: Use when starting, drafting, resuming, or evolving one topic-centered learning document from user-confirmed questions, materials, a learning map, or knowledge tickets.
---

# Learning Synthesis

Own one learning project's Goal, Learning Map, mother document, KnowledgeTickets, and integration state. The Learning Map is a learning-decision map: it records questions the user asked or explicitly chose to pursue, not an AI-generated curriculum.

Read [LearningSynthesisState v1](../_shared/learning-synthesis-state-v1.md), [KnowledgeTicket v2](../_shared/knowledge-ticket-v2.md), and [LearningRecord v2](../_shared/learning-record-v2.md) before writing artifacts.

## Resolve the workspace

Use, in order: the directory containing a supplied `learning.yaml`; the directory containing a supplied mother document; an explicit workspace. If none is available, ask where to create the topic workspace before writing. Never publish, move existing notes, or scan unrelated knowledge stores implicitly.

## Choose one mode

### Start / frame

Use for a vague topic or unconfirmed map. Discuss the desired outcome before expanding scope: identify the user's current question, desired understanding, and exclusions; inspect only relevant supplied materials. Propose candidate central questions only when the user has not supplied one, then wait for confirmation.

Build the initial map around the confirmed question and the learning decisions already made. Do not infer a full module hierarchy from the materials. Record the working claim, exclusions, materials, and decisions in `learning.yaml`. Do not draft until the user confirms the Goal and initial map.

### Draft

Require a confirmed map. Inventory how existing materials support its nodes, then create or update one publishable mother-document `LearningRecord`. Organize it around the central question, not source order or a list of technologies. Keep prerequisites minimal and distinguish evidence, inference, and unresolved gaps. Move the state to `filling`.

### Capture gaps

Create a gap only when the user identifies it or explicitly accepts a previously suggested candidate question. First reuse an equivalent ticket or existing record when possible. For every accepted question, create one independently resolvable ticket, promote it to a formal map node, and give it a workspace-relative result destination.

Compile the accepted question into a delegation-ready ticket: a worker receiving only the ticket must be able to resolve it without the parent conversation. Keep lifecycle and routing identifiers in YAML frontmatter; put the actual work contract in the Markdown body: scope, exclusions, materials, evidence requirements, acceptance, delivery, and integration target. For a code ticket, require every source-based explanation in the resulting document to use the sequence “source location → minimal code excerpt → explanation”; a bare file/line citation is not sufficient evidence.

For a `code` gap, first perform only lightweight reconnaissance: locate real entry files, direct dependencies, key symbols, and the paths that need evidence. Use that to write the body sections for work, scope, materials, required traces, questions to answer, and evidence; do not answer the source question during reconnaissance. The user's confirmed question controls scope. Related but separately valuable questions remain candidates, not hidden requirements in the ticket.

If the user says to record, discuss, defer, or not start yet, stop after ticket creation; never invoke a producer automatically.

### Integrate

Require a `resolved` ticket and its result. Add only the minimum explanation needed by the mother document, followed by one idempotent callout:

```markdown
> [!NOTE] 关联知识：<title>
> [<record title>](<ref>)概括解决的问题、贡献和何时值得深入阅读。
```

Do not copy the child record, expose workflow metadata in the body, or alter the child record. Update the map, related-record index, ticket to `integrated`, stage, and next action. Do not insert a second callout for an already integrated ticket.

### Status / resume

Read `learning.yaml`, the map, and referenced tickets. Treat each ticket file as authoritative for its lifecycle and reconcile the state index when it changed independently. Report the Goal, current stage, completed work, open/resolved/deferred tickets, inconsistencies, and one recommended next action. A status question is navigation only; execute the next action only when the user asks.

## Map rules

The map is a human-readable learning-decision tree, not merely the document table of contents or a complete subject taxonomy. Formal nodes come only from a user question or an explicit user acceptance of a candidate; use stable node identifiers in tickets and mark nodes as unhandled `[ ]`, partial `[~]`, integrated `[x]`, or excluded `[-]`.

At a natural stopping point, recommend at most three directly relevant candidate questions. Keep them outside the formal tree and tickets, for example in `learning.yaml`'s `candidate_questions`; explain why each would help. Promote one only after the user chooses it. Keep important scope decisions in the map; keep machine paths and lifecycle state in YAML.

## Ownership boundaries

- A conceptual ticket is resolved by reading and following `learning-note`.
- A source execution ticket is resolved by a Codex agent directly investigating the listed repository material under its ticket contract.
- Resolving a ticket produces one LearningRecord and may mark the ticket `resolved`; it never integrates it.
- Prefer assigning a self-contained accepted ticket to a child agent when delegation is available and the work can proceed independently. For a code ticket, give that agent the ticket and its listed materials; it selects the investigation method from the question rather than following a fixed source-reading skill. The parent recovers the resulting LearningRecord and lifecycle change rather than the research transcript. Resolve inline only when delegation is unavailable or the task is too small to justify a handoff.
- Interview prompts, open gaps, material inventories, future enhancements, and next actions belong in the map, state, or tickets—not the mother-document body.
- Validation and publication are outside this v1 workflow.

Completion for the current pass means the mother document has a coherent central thread and every selected ticket is integrated, deferred, or cancelled. New gaps may reopen `filling` later.
