---
description: Scaffold a new infrastructure use-case wired through a service with Result.
argument-hint: <use-case name and what it does>
---

Create a new use-case: **$ARGUMENTS**

Follow Nimara's use-case recipe (see `AGENTS.md` "When adding a new use-case" and
`.agents/skills/project-guidelines/SKILL.md`). Reuse existing patterns under
`packages/infrastructure/src/<domain>/use-cases` — mirror the closest sibling.

1. **Types** — define request/response/entity types in `packages/domain` (if shared) or
   colocated with the use-case.
2. **Implementation** — add it under `packages/infrastructure/src/<domain>/use-cases`,
   with GraphQL operations in `.graphql` files alongside. Return `Result<T, E>` from
   `@nimara/domain/objects/Result`.
3. **Expose** — surface it through the relevant provider.
4. **Consume** — wire a service the app calls (lazy-init pattern, e.g.
   `apps/storefront/src/services/registry.ts` and `apps/storefront/src/services/`). Apps
   must not import `@nimara/codegen` directly.
5. **Codegen** — run `/codegen-check`.
6. **Test** — assert both `result.ok` and the expected-failure path.

Report the files created and the service entry point the app should call.
