#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target_root="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"
target_dir="$target_root/learning-learn"

mkdir -p "$target_root"
rm -rf "$target_dir"
cp -R "$repo_dir/learning-learn" "$target_dir"

echo "Installed learning-learn to $target_dir"
