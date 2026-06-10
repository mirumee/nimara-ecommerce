#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs workspace dependencies (and regenerates GraphQL types when an env
# file is present) so linters, tests, and codegen work in fresh containers.
set -euo pipefail

# Only run in remote (Claude Code on the web) environments; local devs manage
# their own installs.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

echo "[session-start] Installing workspace dependencies with pnpm..."
corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

# Codegen needs the storefront env (NEXT_PUBLIC_SALEOR_API_URL). Skip cleanly
# when it is not configured so the session still starts.
if [ -f "apps/storefront/.env" ]; then
  echo "[session-start] Running GraphQL codegen..."
  pnpm codegen || echo "[session-start] codegen failed (non-fatal); run 'pnpm codegen' manually."
else
  echo "[session-start] apps/storefront/.env not found; skipping codegen."
fi

echo "[session-start] Done."
