# Learning: Learn

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

## Install or update

```bash
./install.sh
```

By default this copies only `learning-learn` to
`${CODEX_HOME:-$HOME/.codex}/skills`. Pass a skills directory as the first argument
to install elsewhere:

```bash
./install.sh /tmp/codex-skills
```

The repository intentionally contains no learning runtime, hidden workspace schema,
viewer, review scheduler, practice tracker, migration layer, or compatibility aliases.
Updating from Learning Suite V3 also removes its four retired public skills, packaged
viewer, installation manifest, and its own identified `_shared` runtime directory.
