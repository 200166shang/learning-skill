#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
BUILT_APP="$REPO_DIR/viewer/src-tauri/target/release/bundle/macos/Learning Companion.app"
BUILD_STAGE="$(mktemp -d)"
trap 'rm -rf "$BUILD_STAGE"' EXIT

npm ci --no-audit --no-fund --prefix "$REPO_DIR/viewer"
(
  cd "$REPO_DIR/viewer"
  npm exec tauri -- build
)
if [[ ! -d "$BUILT_APP" ]]; then
  echo "Learning Companion build did not produce $BUILT_APP" >&2
  exit 1
fi
cp -R "$BUILT_APP" "$BUILD_STAGE/Learning Companion.app"

mkdir -p "$CODEX_SKILLS_DIR"
INSTALLED_VIEWER_EXECUTABLE="$CODEX_SKILLS_DIR/_learning-viewer/Learning Companion.app/Contents/MacOS/learning-companion"
if pgrep -f "$INSTALLED_VIEWER_EXECUTABLE" >/dev/null 2>&1; then
  pkill -f "$INSTALLED_VIEWER_EXECUTABLE" || true
fi

for old in learning-flow learning-route learning-teach learning-verify learning-note learning-synthesis learning-curate learning-observe learning review practice web; do
  rm -rf "$CODEX_SKILLS_DIR/$old"
done
for current in learning-ask learning-learn learning-review learning-practice learning-view _shared _learning-viewer; do
  rm -rf "$CODEX_SKILLS_DIR/$current"
done

for skill in learning-ask learning-learn learning-review learning-practice learning-view; do
  cp -R "$REPO_DIR/$skill" "$CODEX_SKILLS_DIR/$skill"
done
cp -R "$REPO_DIR/_shared" "$CODEX_SKILLS_DIR/_shared"
mkdir -p "$CODEX_SKILLS_DIR/_learning-viewer"
rsync -a --exclude node_modules --exclude target --exclude dist "$REPO_DIR/viewer/" "$CODEX_SKILLS_DIR/_learning-viewer/"
cp -R "$BUILD_STAGE/Learning Companion.app" "$CODEX_SKILLS_DIR/_learning-viewer/Learning Companion.app"

rm -rf "$CODEX_SKILLS_DIR/_shared/node_modules"
npm install --omit=dev --no-audit --no-fund --prefix "$CODEX_SKILLS_DIR/_shared"

echo "Installed Learning Suite (learning-ask, learning-learn, learning-review, learning-practice, learning-view)."
echo "Prebuilt Desktop Learning Companion installed at $CODEX_SKILLS_DIR/_learning-viewer/Learning Companion.app."
echo "Restart or start a new Codex turn to reload skills."
