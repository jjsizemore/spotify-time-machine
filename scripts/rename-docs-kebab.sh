#!/usr/bin/env bash
set -euo pipefail

# Renames documentation markdown files in docs/ to kebab-case using git mv.
# README.md and INDEX.md files are excluded from renaming.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"

if [[ ! -d "$DOCS_DIR" ]]; then
  echo "docs directory not found at $DOCS_DIR" >&2
  exit 1
fi

while IFS= read -r -d '' file; do
  filename="$(basename "$file")"

  case "$filename" in
    README.md|INDEX.md)
      continue
      ;;
  esac

  dir="$(dirname "$file")"
  stem="${filename%.md}"

  kebab="$(echo "$stem" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g' \
    | sed -E 's/-{2,}/-/g')"

  # Ensure we end up with a non-empty stem
  if [[ -z "$kebab" ]]; then
    echo "Skipping $file because kebab stem is empty" >&2
    continue
  fi

  target="$dir/$kebab.md"

  if [[ "$file" == "$target" ]]; then
    continue
  fi

  if [[ -e "$target" ]]; then
    if [[ "${file,,}" == "${target,,}" ]]; then
      tmp="$dir/.rename-tmp-$$.md"
      while [[ -e "$tmp" ]]; do
        tmp="$dir/.rename-tmp-$$-$RANDOM.md"
      done

      echo "git mv \"${file#"$REPO_ROOT"/}\" \"${tmp#"$REPO_ROOT"/}\" (case-only rename workaround)"
      git mv "$file" "$tmp"
      file="$tmp"
    else
      echo "Skipping $file because target $target already exists" >&2
      continue
    fi
  fi

  echo "git mv \"${file#"$REPO_ROOT"/}\" \"${target#"$REPO_ROOT"/}\""
  git mv "$file" "$target"
done < <(find "$DOCS_DIR" -type f -name '*.md' -print0)
