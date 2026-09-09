# Capture gaps

Before creating or reusing a ticket, read [KnowledgeTicket](../../_shared/knowledge-ticket.md). Read [LearningRecord](../../_shared/learning-record.md) only when an existing record must be inspected to determine whether it already resolves the accepted question.

Create a gap only when the user identifies it or explicitly accepts a previously suggested candidate question. First reuse an equivalent ticket or existing record when possible. For every accepted question, create one independently resolvable ticket, promote it to a formal map node, and give it a workspace-relative result destination.

Compile the accepted question into a delegation-ready ticket: a worker receiving only the ticket must be able to resolve it without the parent conversation. Keep lifecycle and routing identifiers in YAML frontmatter; put the actual work contract in the Markdown body: scope, exclusions, materials, evidence requirements, acceptance, delivery, and integration target. For a code ticket, require every source-based explanation in the resulting document to use the sequence “source location → minimal code excerpt → explanation”; a bare file/line citation is not sufficient evidence.

For a `code` gap, first perform only lightweight reconnaissance: locate real entry files, direct dependencies, key symbols, and the paths that need evidence. Use that to write the body sections for work, scope, materials, required traces, questions to answer, and evidence; do not answer the source question during reconnaissance. The user's confirmed question controls scope. Related but separately valuable questions remain candidates, not hidden requirements in the ticket.

If the user says to record, discuss, defer, or not start yet, stop after ticket creation; never invoke a producer automatically.

Done when every accepted question in the current pass is represented by exactly one reusable existing record or independently executable ticket, the map/state references are updated, and no producer has been started unless the user separately asked to execute it.
