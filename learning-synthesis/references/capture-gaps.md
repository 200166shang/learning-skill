# Capture gaps

Before creating or reusing a ticket, read [KnowledgeTicket](../../_shared/knowledge-ticket.md) and treat it as the authoritative schema and worker contract for every `concept`, `code`, `structure`, or `evidence` ticket. Read [LearningRecord](../../_shared/learning-record.md) only when an existing record must be inspected to determine whether it already resolves the accepted question.

Create a gap only when the user identifies it or explicitly accepts a previously suggested candidate question. First reuse an equivalent ticket or existing record when possible. For every accepted question, create one independently resolvable ticket, promote it to a formal map node, and give it a workspace-relative result destination.

Compile the accepted question into a delegation-ready ticket in memory before writing it: a worker receiving only the ticket must be able to resolve it without the parent conversation. Use the KnowledgeTicket contract's required frontmatter and body requirements exactly; do not substitute a reduced ticket shape. Keep lifecycle and routing identifiers in YAML frontmatter; put the actual work contract in the Markdown body: scope, exclusions, materials, evidence requirements, acceptance, delivery, and integration target. Compile every `code` ticket under the KnowledgeTicket `Code evidence rule`.

Before persisting a new ticket, validate the complete candidate against every required KnowledgeTicket frontmatter field and worker-facing body requirement, including a concrete workspace-relative result destination, acceptance criteria, and integration target. Persist the ticket and update its map/state references only after validation passes. If required contract information cannot be compiled, do not write a partial ticket or count the capture as complete; report what is missing and stop at this mode's boundary.

For a `code` gap, first perform only lightweight reconnaissance: locate real entry files, direct dependencies, key symbols, and the paths that need evidence. Use that to write the body sections for work, scope, materials, required traces, questions to answer, and evidence; do not answer the source question during reconnaissance. The user's confirmed question controls scope. Related but separately valuable questions remain candidates, not hidden requirements in the ticket.

If the user says to record, discuss, defer, or not start yet, stop after ticket creation; never invoke a producer automatically.

Done when every accepted question in the current pass is represented by exactly one reusable existing record or persisted ticket that has passed the KnowledgeTicket contract validation gate, the map/state references are updated, and no producer has been started unless the user separately asked to execute it.
