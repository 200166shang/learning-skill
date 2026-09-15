# Learning V5: Learn

A single user-invoked Codex skill for starting or continuing one source-grounded
**Learning Thread**. Each thread has one **Root Question**, one **Active Path**, an
agreed **Source Boundary**, and one **Living Learning Document**.

## Use it

Ask a concrete question with its sources:

```text
$learning-learn Using src/motor.ts and docs/control.md, why does this controller
reduce duty cycle when the measured current rises?
```

The skill begins with the relevant causal explanation. Important causal edges cite
precise headings, PDF pages, prepared-video chapters and timestamps, or repository
symbols. Material inference, uncertainty, and source conflict remain visible. The
skill does not initialize a runtime, create learning IDs, or generate a curriculum.

Or provide a broad module and let the skill orient you:

```text
$learning-learn Help me learn the MCU module from src/mcu and the linked design
notes. I do not yet know which question will connect it end to end.
```

The skill recommends one connecting Root Question and may offer up to two genuinely
different alternatives. Candidates stay conversational until the learner accepts or
delegates one. At a stable checkpoint, the Living Learning Document keeps Active Path,
Question Lineage, and Causal Chain as visibly separate views, plus a low-resolution
source inventory and precise local Source Fragments.

The same `$learning-learn` entry resumes or corrects a thread, reuses an independent
Markdown Concept when appropriate, selectively promotes stable understanding into one
human-readable `REVIEW.md`, and reviews one due Memory Target at a time on explicit
request. Review uses the visible `1d → 3d → 7d → 14d → 30d → 90d` ladder; it has no
background scheduler or hidden state.

### Existing V4 documents

V4 Markdown remains readable and is never bulk-migrated. An active arrow-path document
is upgraded only when that document is resumed, corrected, or substantively edited.
The upgrade preserves its prose, converts only an unambiguous active route, and does
not invent completed Question Lineage, sources, causal claims, completion evidence,
Concepts, or Memory Targets. A completed V4 document stays byte-for-byte unchanged
until a correction actually reopens it.

## Install or update

```bash
./install.sh
```

By default this installs the one public `learning-learn` skill to
`${CODEX_HOME:-$HOME/.codex}/skills`. Pass a skills directory as the first argument
to install elsewhere:

```bash
./install.sh /tmp/codex-skills
```

The installed package contains only `SKILL.md`, its interface metadata, and the
`learning-thread.md` and `review.md` instruction references. Installation does not
search for or alter learner Markdown, an Obsidian vault, Concepts, or `REVIEW.md`.

The repository intentionally contains no learning runtime, hidden workspace schema,
viewer, review scheduler, practice tracker, migration program, package dependency, or
compatibility alias. Updating from Learning Suite V3 removes only its identified four
retired public skills, packaged viewer, installation manifest, and its own identified
`_shared` runtime directory. Media download, transcription, subtitle extraction, and
OCR stay upstream; Obsidian may render Markdown as a read-only projection but never
owns learning or review state.
