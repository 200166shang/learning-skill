#!/usr/bin/env bash
set -euo pipefail

SKILLS_DIR="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SKILLS_DIR"

rm -rf "$SKILLS_DIR/learning-research"

for skill in learning learning-learn learning-review learning-practice learning-resources learning-organize; do
  TARGET="$SKILLS_DIR/$skill"
  rm -rf "$TARGET"
  cp -R "$REPO_DIR/$skill" "$TARGET"
done

echo "Installed six Learning V6 skills to $SKILLS_DIR"
