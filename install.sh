#!/usr/bin/env bash
set -euo pipefail

SKILLS_DIR="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SKILLS_DIR"

for skill in learning learning-learn learning-review learning-practice; do
  TARGET="$SKILLS_DIR/$skill"
  rm -rf "$TARGET"
  cp -R "$REPO_DIR/$skill" "$TARGET"
done

echo "Installed learning, learning-learn, learning-review, and learning-practice V6 skills to $SKILLS_DIR"
