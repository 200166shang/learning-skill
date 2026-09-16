#!/usr/bin/env bash
set -euo pipefail

SKILLS_DIR="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SKILLS_DIR"

for skill in learning-learn learning-review; do
  TARGET="$SKILLS_DIR/$skill"
  rm -rf "$TARGET"
  cp -R "$REPO_DIR/$skill" "$TARGET"
done

echo "Installed learning-learn and learning-review V6 skills to $SKILLS_DIR"
