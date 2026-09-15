#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target_root="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
target_dir="$target_root/learning-learn"
legacy_shared="$target_root/_shared"

mkdir -p "$target_root"
for legacy_name in \
  learning-ask learning-review learning-practice learning-view \
  _learning-viewer learning-installation-manifest.json
do
  rm -rf "$target_root/$legacy_name"
done

if [[ -f "$legacy_shared/package.json" ]] && \
  grep -Eq '"name"[[:space:]]*:[[:space:]]*"learning-skill-shared"' "$legacy_shared/package.json"
then
  rm -rf "$legacy_shared"
fi

rm -rf "$target_dir"
mkdir -p "$target_dir/agents" "$target_dir/references"
cp "$repo_dir/learning-learn/SKILL.md" "$target_dir/SKILL.md"
cp "$repo_dir/learning-learn/agents/openai.yaml" "$target_dir/agents/openai.yaml"
cp "$repo_dir/learning-learn/references/learning-thread.md" \
  "$target_dir/references/learning-thread.md"
cp "$repo_dir/learning-learn/references/review.md" \
  "$target_dir/references/review.md"

echo "Installed learning-learn to $target_dir"
