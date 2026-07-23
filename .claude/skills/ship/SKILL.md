---
name: ship
description: Run the pre-PR quality gate, then commit, push, and open a pull request to main when requested by the developer.
disable-model-invocation: true
---

# Ship changes

Run the quality gate and stop at the first failing step.

1. Run `pnpm exec turbo run lint:staged` and review any fixes.
2. Run `pnpm format:check`.
3. Run `pnpm test`.
4. If GraphQL source changed, invoke `/codegen-check` and include regenerated outputs.
5. Review the final diff and summarize the files and checks.
6. Commit with a Conventional Commit on a short-lived branch, push it, and open a pull
   request targeting `main`. Aim to merge within two working days; split longer work behind
   a short-lived feature flag or branch-by-abstraction seam.
7. Confirm `Linters & Tests` and all four Vercel project statuses pass before merge. Use the
   Conventional Commit pull-request title as the squash title that drives semantic-release.

Project permissions still require confirmation for commits, pushes, and pull-request
creation. Never bypass those prompts or commit directly to `main`.
