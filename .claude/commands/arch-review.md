---
description: Audit the current diff for Nimara layer/boundary and convention violations.
allowed-tools: Bash(git diff*), Bash(git status), Read, Grep, Glob
---

Review the current changes (`git diff` against the base branch) for architecture and
convention violations. Reference `.agents/skills/project-guidelines/SKILL.md`.

Check for:

- **Dependency direction** — `infrastructure` importing `features`/`ui`/apps; `domain` or
  `foundation` importing anything non-leaf; apps or components importing `@nimara/codegen`.
- **App boundary** — `@/components` importing from `@/app`.
- **Result pattern** — fallible service/action code that throws instead of returning
  `Result<T, E>`.
- **Exports** — default exports outside exempt Next.js route/page/layout files.
- **Imports** — type-only imports for types; import order side-effect → node → packages →
  `@nimara` → `@/` → relative (`simple-import-sort`).
- **i18n** — hardcoded user-facing strings that should use `next-intl`.
- **New `.graphql`** — generated types regenerated (`/codegen-check`).

Report findings grouped by severity (blocking / should-fix / nice-to-have). Do not fix
silently — list them, then fix the blocking ones.
