---
name: learning-research
description: "Research high-value external sources from current Questions or Topics and preserve reusable Research Notes without creating learning Questions."
---

# Learning Research

Use the learner's current understanding to find a small set of external sources that are useful now. Explain what to inspect, connect each source to existing Questions or Topics, and surface meaningful potential gaps.

Research may suggest Questions. Only `$learning` may create a Question after the learner actually chooses to pursue it.

The execution spine is:

`RESOLVE CONTEXT → ALIGN ONLY IF MATERIAL → RESEARCH → EXPLAIN → DISCUSS GAPS → PRESERVE`

## Resolve the research context

1. Run `node ~/.codex/skills/_shared/scripts/upgrade-learning-workspace.mjs <workspace>` before persisted reads. Continue when no upgrade is needed. If it upgrades, report the recovered position and stop; if it errors, fail closed.
2. Resolve one of these scopes from the learner's request:
   - **Current Question:** use `.learning/state.yaml` and `.learning/journey.yaml`, then read every KnowledgeNote referenced by the focused Question. Read earlier related Questions only when necessary to understand the boundary.
   - **Selected Questions:** resolve the named IDs in Journey and read their referenced Notes plus the minimum related context.
   - **Organized Topic:** read `organized/organize.yaml`, the named Topic, and its contributing Journey Questions and Notes when needed.
3. Summarize internally what the learner already understands, the mechanism already covered, relevant project or source context, and the current boundary. Match source depth to that understanding rather than assuming a beginner.

## Align direction only when material

After reading the current understanding, decide whether the research direction is sufficiently clear. Research immediately when the request and learning context support one reasonable direction. Missing preferences such as exact source count, difficulty, output format, or whether to include blogs are not reasons to pause; infer them or use the defaults below.

Pause for one concise direction choice only when all of these are true:

- two or more plausible directions would produce materially different searches or primary source sets;
- the request and learning context cannot choose reliably;
- choosing incorrectly would likely produce results for a different learning goal.

When alignment is needed, offer 2–4 genuinely distinct directions. For each, state what it would investigate, which source types it would prioritize, and what learning goal it serves. Ask one concise question, then stop. Perform no full research and create no Research Note before the learner chooses.

When context strongly favors one direction, choose it and research immediately. Briefly explain that choice with the findings. If the learner delegates the choice, select the direction most directly connected to the current causal chain, then authoritative verification, then concept-to-implementation, and finally optional engineering expansion. Do not continue asking.

## Research

Before searching, read and apply the complete [source quality rules](references/source-quality.md).

Search using the host's available web, documentation, and repository capabilities. Aim for 3–6 core sources by default, stopping earlier when fewer sources cover the need. Choose complementary roles where useful—authoritative reference, explanatory article, official tutorial, implementation, system walkthrough, or engineering experience—without forcing every role into every result.

For every recommended source, verify and provide:

- title, direct link, and source type;
- why it is useful given the learner's current understanding;
- the specific section, concept, code entry point, or passage to inspect;
- which Question or Topic it connects to;
- what it adds beyond the other selected sources.

Report a specific section, code location, class, function, call path, configuration file, or video chapter only after inspecting it. Prefer an official repository for source-code research and explain why each entry point matters; keep the mechanism primary rather than dumping a source tree.

## Discover potential gaps

Compare the current understanding with material supported by the selected sources. Surface only gaps that materially affect the learner's present subject. For each gap, explain why it matters and when it is worth pursuing, using qualitative priority rather than a score.

Potential gaps and suggested prompts remain recommendations. Do not allocate Question IDs, edit Journey, change State, record Evidence, write KnowledgeNotes, or modify Organized Topics. Do not recursively research every unfamiliar term; the learner chooses the next research or learning direction.

## Present and preserve the result

After research, always explain the findings to the learner and discuss the possible next learning directions. Presenting only links or a saved file path is incomplete. Provide a useful reading path containing:

- the current-understanding boundary;
- recommended sources and their learning purpose;
- how each source connects to Questions or Topics;
- meaningful potential gaps, why each matters, whether it affects the current understanding, and when it is worth pursuing;
- a suggested reading order.

Distinguish gaps that directly affect the current reasoning chain from useful non-blocking extensions and peripheral concepts that can wait. Suggested follow-up questions are invitations for the learner to choose, not persisted Questions.

After actual research is complete, in a durable Learning workspace save the same result by default as the next sequential `research/rNNN.md`; honor an explicit conversation-only or no-save request. Outside a durable workspace, return it only in the conversation. A Research Note is a reusable external-learning reference, not a graph node or proof of understanding. Direction alignment alone never creates one.

Use a readable shape such as:

```markdown
# Research: <focused subject>

## Research context

Based on: q008, q011 or t002

Current understanding: ...

## Recommended sources

### <source title>

Type: Official documentation
Link: <direct URL>
Why it matters now: ...
Focus on: ...
Connects to: q008

## Potential learning gaps

- <gap, why it matters, and when to pursue it>

## Suggested reading order

1. ...
```

Adapt headings when another structure is clearer. Use `r001`, `r002`, and so on by scanning existing filenames; create no manifest, graph, relationship schema, status, or research runtime state.

## Completion check

Finish only when:

- the current knowledge boundary is reflected in the recommendations;
- the selected set is small, relevant, non-redundant, and includes authoritative support when available;
- every source has a verified, actionable learning purpose and a connection to the chosen context;
- potential gaps are material and remain suggestions;
- the learner-facing response explains the findings and distinguishes what is worth pursuing now from what can wait;
- the result is reusable by a later `$learning` request without having changed any canonical learning or Topic state.

Do not continue searching merely to increase the source count. Research Notes may feed later learner-chosen study; research itself never starts that study or triggers `$learning-organize`.
