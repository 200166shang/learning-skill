# Learning: Learn

A single user-invoked Codex skill for learning a project or knowledge scope along
one coherent **main line**. It descends only into a real **blocking gap**, returns
at an explicit **return point**, and integrates stable understanding into one living
Markdown article.

## Use it

Ask a concrete question with its sources:

```text
$learning-learn Using src/motor.ts and docs/control.md, why does this controller
reduce duty cycle when the measured current rises?
```

The skill begins with the relevant causal explanation. It does not initialize a
runtime, create learning IDs, or generate a curriculum.

Or provide a broad module and let the skill orient you:

```text
$learning-learn Help me learn the MCU module from src/mcu and the linked design
notes. I do not yet know which question will connect it end to end.
```

The skill recommends one connecting root question and may offer up to two genuinely
different alternatives. Once a route is chosen, stable understanding is maintained
in one primary Markdown article. Its `当前学习位置` section records the complete
active path and every level's return point so a fresh session can resume at the deepest
question and return to the root one level at a time.

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
