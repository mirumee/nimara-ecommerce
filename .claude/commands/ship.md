---
description: Pre-PR quality gate, then open a PR to develop.
allowed-tools: Bash(turbo run *), Bash(pnpm format:check), Bash(pnpm test), Bash(pnpm codegen), Bash(git*), Bash(gh*)
---

Run the quality gate and ship. Stop and report at the first failing step.

1. `turbo run lint:staged` — lint changed files (fix issues).
2. `pnpm format:check` — Prettier must be clean (`pnpm format` to fix).
3. `pnpm test` — Vitest must pass.
4. `pnpm codegen` — if anything changed, generated types were out of sync; commit them.
5. Commit using **Conventional Commits** (`feat:` / `fix:` / `chore:` / `docs:` …) on a
   feature branch (never commit straight to `develop`).
6. Push with `git push -u origin <branch>` and open a PR **targeting `develop`** via `gh`
   (only when the user asked to open a PR).

Branch flow: feature → `develop` → `staging` (QA) → `main` (prod).
