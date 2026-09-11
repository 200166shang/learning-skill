#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$CODEX_SKILLS_DIR"

for old in learning-flow learning-route learning-teach learning-verify learning-note learning-synthesis learning-curate learning-observe learning review practice; do
  rm -rf "$CODEX_SKILLS_DIR/$old"
done
for current in learning-ask learning-learn learning-review learning-practice learning-view _shared _learning-viewer; do
  rm -rf "$CODEX_SKILLS_DIR/$current"
done

for skill in learning-ask learning-learn learning-review learning-practice learning-view; do
  cp -R "$REPO_DIR/$skill" "$CODEX_SKILLS_DIR/$skill"
done
cp -R "$REPO_DIR/_shared" "$CODEX_SKILLS_DIR/_shared"
cp -R "$REPO_DIR/viewer" "$CODEX_SKILLS_DIR/_learning-viewer"

rm -rf "$CODEX_SKILLS_DIR/_shared/node_modules" "$CODEX_SKILLS_DIR/_learning-viewer/node_modules"
npm install --omit=dev --no-audit --no-fund --prefix "$CODEX_SKILLS_DIR/_shared"

echo "Installed Learning Suite (learning-ask, learning-learn, learning-review, learning-practice, learning-view)."
echo "Desktop Learning Companion source installed at $CODEX_SKILLS_DIR/_learning-viewer; its optional dependencies are installed on first use."
echo "Restart or start a new Codex turn to reload skills."
