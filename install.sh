#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "$CODEX_SKILLS_DIR"

for skill in learning-flow learning-note learning-synthesis; do
  rm -rf "$CODEX_SKILLS_DIR/$skill"
  cp -R "$REPO_DIR/$skill" "$CODEX_SKILLS_DIR/$skill"
done

rm -rf "$CODEX_SKILLS_DIR/_shared"
cp -R "$REPO_DIR/_shared" "$CODEX_SKILLS_DIR/_shared"

echo "Installed learning-flow, learning-note, and learning-synthesis."
echo "Restart or start a new Codex turn to reload skills."
