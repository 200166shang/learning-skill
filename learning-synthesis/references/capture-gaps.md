# Capture gaps

Read [KnowledgeTicket](../../_shared/knowledge-ticket.md) before creating/reusing pending work. Read [LearningRecord](../../_shared/learning-record.md) only when an existing Record must be inspected for scope or prior resolution.

## Surface → Reconcile → Classify → Promote

Handle every question surfaced while reading a topic Record/mother document through this sequence:

1. **Surface** — preserve the learner's actual question. The three-candidate limit applies only to AI recommendations, never to learner-surfaced questions.
2. **Reconcile** — compare against the current topic in order: formal Map nodes → Tickets → AI candidates → existing/related Records. Reuse semantic equivalents. Keep lookup bounded to the topic workspace and supplied materials.
3. **Classify** —
   - missing explanation inside the current Record's promised scope → return to that Record's producer for revision;
   - tiny prerequisite needed only to read the current Record → keep as local context;
   - existing objective/work/result → reuse that path;
   - materially broader learning objective → eligible for promotion.
4. **Promote** — formalize a genuinely new objective only when the learner chooses to pursue it. Place it under the closest relevant confirmed parent in the Map.

A completed existing Map node points back to its completion evidence. An unresolved existing node reuses its Ticket when present; create pending work only when the learner is pursuing that unresolved objective.

## Capture accepted work

A formal gap represents user-confirmed work that is still unresolved.

- Equivalent completed Record → reuse it; pending work is unnecessary.
- Equivalent pending Ticket → reuse it.
- New unresolved objective → create one independently executable Ticket.
- Accepted partial coverage → `[~]` only when both the covered portion and concrete residual gap are explainable; scope new work to the residual gap.
- Historical material without accepted partial coverage → keep `[ ]`.

When a completed Record already resolves the accepted question, record only the Map/state relationship needed by this capture pass and stop at the capture boundary. Integration/completion evidence belongs to the separate integration action.

## Compile pending work

Before persistence, compile the full Ticket in memory and validate it against the canonical [KnowledgeTicket contract](../../_shared/knowledge-ticket.md). The Ticket must carry a concrete workspace-relative result destination, acceptance criteria, and integration target; its body must be sufficient for a worker without parent-chat context.

For `code`, perform only lightweight reconnaissance needed to locate entry files, direct dependencies, key symbols, and evidence paths. **Reconnaissance stops at task location.** The learner's confirmed question controls scope; separately useful questions remain candidates rather than hidden requirements.

Persist the Ticket only after the complete candidate passes the contract, then reconcile its Map/state references. If required contract information is missing, report the missing input at this boundary.

**Capture boundary:** recording/reconciling pending work does not start the producer or integration step. A learner request to defer/record only stays at this boundary.

Done when every surfaced question in this pass is reconciled/classified, each pursued objective maps to exactly one reusable completed Record or pending Ticket, new Map relationships are correct, every trusted `[~]` has covered+residual meaning, and every new Ticket is contract-valid.