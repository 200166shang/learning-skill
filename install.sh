#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$CODEX_SKILLS_DIR"

for old in learning-flow learning-route learning-teach learning-verify learning-note learning-synthesis learning-curate learning-observe; do
  rm -rf "$CODEX_SKILLS_DIR/$old"
done
rm -rf "$CODEX_SKILLS_DIR/learning" "$CODEX_SKILLS_DIR/review" "$CODEX_SKILLS_DIR/practice" "$CODEX_SKILLS_DIR/_shared" "$CODEX_SKILLS_DIR/web"
cp -R "$REPO_DIR/learning" "$CODEX_SKILLS_DIR/learning"
cp -R "$REPO_DIR/review" "$CODEX_SKILLS_DIR/review"
cp -R "$REPO_DIR/practice" "$CODEX_SKILLS_DIR/practice"
cp -R "$REPO_DIR/_shared" "$CODEX_SKILLS_DIR/_shared"
rm -rf "$CODEX_SKILLS_DIR/_shared/node_modules"
npm install --omit=dev --no-audit --no-fund --prefix "$CODEX_SKILLS_DIR/_shared"
echo "Installed learning V7."
echo "Restart or start a new Codex turn to reload skills."
