#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "$CODEX_SKILLS_DIR"

# Remove every former public entry point before installing the V6-only surface.
for legacy_skill in learning-flow learning-route learning-teach learning-verify learning-note learning-synthesis learning-curate; do
  rm -rf "$CODEX_SKILLS_DIR/$legacy_skill"
done

for skill in learning learning-observe; do
  rm -rf "$CODEX_SKILLS_DIR/$skill"
  cp -R "$REPO_DIR/$skill" "$CODEX_SKILLS_DIR/$skill"
done

rm -rf "$CODEX_SKILLS_DIR/_shared"
cp -R "$REPO_DIR/_shared" "$CODEX_SKILLS_DIR/_shared"
rm -rf "$CODEX_SKILLS_DIR/_shared/node_modules"
npm install --omit=dev --no-audit --no-fund --prefix "$CODEX_SKILLS_DIR/_shared"

npm install --no-audit --no-fund --prefix "$REPO_DIR/web"
npm run build --prefix "$REPO_DIR/web"
rm -rf "$CODEX_SKILLS_DIR/web"
mkdir -p "$CODEX_SKILLS_DIR/web"
cp "$REPO_DIR/web/package.json" "$REPO_DIR/web/package-lock.json" "$CODEX_SKILLS_DIR/web/"
cp -R "$REPO_DIR/web/server" "$REPO_DIR/web/dist" "$CODEX_SKILLS_DIR/web/"
npm install --omit=dev --no-audit --no-fund --prefix "$CODEX_SKILLS_DIR/web"

echo "Installed learning and learning-observe."
echo "Restart or start a new Codex turn to reload skills."
