#!/usr/bin/env bash
set -euo pipefail

SKILLS_DIR="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$SKILLS_DIR/learning-learn"

mkdir -p "$SKILLS_DIR"
rm -rf "$TARGET"
cp -R "$REPO_DIR/learning-learn" "$TARGET"

echo "Installed learning-learn V6 to $TARGET"
