---
name: arch-review
description: Audit the current diff for Nimara architecture, layer-boundary, and code-convention violations. Use before handing implementation changes to a developer.
---

# Review architecture and conventions

Review the current changes against the ordinary-work base branch, `main`. Read
`.agents/skills/project-guidelines/SKILL.md` and the scoped `CLAUDE.md` files for affected
paths.

Check for:

- **Dependency direction** — infrastructure importing features, UI, or apps; domain or
  foundation importing higher layers; app or component code importing `@nimara/codegen`.
- **App boundary** — shared components importing from `@/app`.
- **Result pattern** — fallible service or action code throwing expected failures instead
  of returning `Result<T, E>`.
- **Exports** — default exports outside exempt framework route, page, and layout files.
- **Imports** — missing type-only imports or incorrect import ordering.
- **i18n** — hardcoded user-facing strings that should use `next-intl`.
- **GraphQL** — changed source documents without regenerated outputs.

Report findings by severity: blocking, should-fix, and nice-to-have. Cite exact file paths
and lines. Do not silently fix findings; present them for review first.
