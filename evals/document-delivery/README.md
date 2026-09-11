# Document delivery behavioral evaluation

This small evaluation grades recorded learning-agent artifacts, not prompt text.
It does not invoke a model. `mechanics-pass` is a scripted positive fixture that
proves grader mechanics only. Both `regression-*` records are synthetic forms of
known failures and must fail. None is labeled as an agent replay.

## Record schema

A record selects a transcript, capture root, notes root, canonical state snapshot,
current question, canonical document reference, substantive teaching turn IDs,
read-only status turns, and new-session resume turns. Every teaching turn points
to the note bytes captured immediately after that turn; their SHA-256 must equal
both the commit revision and receipt revision. This prevents a delayed final write
from passing earlier delivery gates. Status turns point to before/after captures
whose declared and computed hashes must agree. Paths are relative to the record.
All artifact reads are realpath-confined to the evaluation or capture root, so
`..` and symlink escapes fail validation without being read.

`kind` must be one of `agent-replay`, `scripted-grader-fixture`, or
`synthetic-known-regression`. Use `agent-replay` only for artifacts copied from an
actual agent run; never for a hand-authored transcript or runtime simulation.

## Commands

```sh
node evals/document-delivery/grade.mjs evals/document-delivery/records/mechanics-pass.json
node evals/document-delivery/grade.mjs evals/document-delivery/records/regression-missing-note.json
cd _shared && npm test
```

The CLI exits 0 on deterministic PASS and 1 on FAIL and prints JSON. Delivery
facts (captured file bytes, canonical association, commit/receipt hashes,
before/after status hashes) and source-specific material at its required turn are deterministic.
Pedagogical coherence and correctness remain explicitly `NOT_SCORED_BY_CLI` and
require the listed human semantic review. A genuinely fresh session cannot be
proved by transcript JSON, so resume isolation is reported under
`externalAttestation: REQUIRES_REPLAY_OPERATOR`, never as a deterministic pass.

## Independent live replay

Run this only after installing the candidate `learning-learn` skill/runtime in a
clean temporary learning workspace. Record the exact source revision, installed
skill content hash, model, reasoning setting, start/end time, and tool calls.

1. Give the agent only `fixtures/laserscan-source.md` and the turns from
   `prompts.json`, in order. Do not show it the grader, positive note, regexes, or
   intended answers.
2. Begin with an empty workspace. Immediately after each teaching turn, copy the
   raw user/assistant transcript, observed receipt, canonical state, and exact note
   bytes into the capture root. Preserve the actual final notes too. Compute
   SHA-256 from captured bytes; do not transcribe revision strings by hand.
3. For the status turn, snapshot the document revision before and after. Start a
   genuinely new agent session for `resume`; provide only the workspace and its
   resume prompt, not prior chat.
4. Grade the captured record, then perform the separate human review. Run each
   key scenario at least three times. Report deterministic results and human
   judgments separately; a passing fixture is not evidence that a model passed.

The prompts intentionally avoid prescribing note contents. The raw fixture is
the sole factual teaching source.
