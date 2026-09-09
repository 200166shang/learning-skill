# Learning Skills

Personal learning workflow skills for Codex.

Included skills:

- `learning-route`: route a learning request to the right stage and owner.
- `learning-note`: turn observations, questions, experiments, or references into a learning record.
- `learning-synthesis`: manage a topic-centered learning document and its integration state.

The `_shared` directory contains the contracts used by the skills and must be installed alongside them.

## Install or update

Clone this repository, then run:

```bash
./install.sh
```

The installer copies the three skills and `_shared` into `~/.codex/skills/`. Re-run it after pulling updates.

```bash
git pull
./install.sh
```
