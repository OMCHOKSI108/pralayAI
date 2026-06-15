#!/usr/bin/env bash
set -e

COMMAND="$*"

BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "sudo rm -rf"
  "git push --force"
  "git reset --hard"
  "docker system prune -a"
  "DROP DATABASE"
  "DROP SCHEMA"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$COMMAND" == *"$pattern"* ]]; then
    echo "❌ Dangerous command blocked: $pattern"
    exit 1
  fi
done

echo "✅ Command allowed"
