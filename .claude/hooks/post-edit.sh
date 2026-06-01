#!/bin/bash
# PostToolUse hook: runs after Claude edits a file.
# - Reminds to regenerate GraphQL types when a .graphql file changes.
# - Formats edited TS/TSX files with Prettier to keep `format:check` green.
set -euo pipefail

# Claude passes the tool payload on stdin; extract the edited file path.
input=$(cat)
file=$(printf '%s' "$input" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -n1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')

[ -z "${file:-}" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.graphql)
    echo "[post-edit] $file changed — run /codegen-check (pnpm codegen) to refresh generated types." >&2
    ;;
  *.ts|*.tsx)
    pnpm prettier --write "$file" >/dev/null 2>&1 || true
    ;;
esac

exit 0
