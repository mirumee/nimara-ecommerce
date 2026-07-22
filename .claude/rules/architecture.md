---
paths:
  - "packages/domain/**/*"
  - "packages/foundation/**/*"
  - "packages/infrastructure/**/*"
  - "packages/features/**/*"
  - "packages/ui/**/*"
---

# Layered architecture

- Put pure business types, constants, validation, and rules in `domain`. It imports no
  other Nimara package.
- Put shared utilities and hooks in `foundation`. It may depend on `domain`, but not on
  higher layers.
- Put external APIs, GraphQL operations, providers, serializers, and integration
  use-cases in `infrastructure`. It may depend only on `domain` and `foundation`.
- Put reusable presentational primitives in `ui`; keep business and feature logic out.
- Put UI plus feature state and orchestration in `features`; this is the composition
  layer and may consume the other packages.
- Keep app-specific routing, configuration, and final wiring in `apps/`.
- Return `Result<T, E>` from fallible infrastructure operations. Do not throw for
  expected business failures.
- Use named exports except where a framework convention explicitly requires a default.

For placement decisions and dependency procedures, use
`.agents/skills/project-guidelines/SKILL.md`.
