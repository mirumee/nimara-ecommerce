---
name: new-use-case
description: Add an infrastructure use-case wired through a provider and app service using Result. Use when implementing a new external-operation or integration use-case.
argument-hint: <use-case name and behavior>
---

# Add an infrastructure use-case

Create this use-case: **$ARGUMENTS**

Read `packages/infrastructure/CLAUDE.md` and
`.agents/skills/project-guidelines/SKILL.md`. Mirror the closest existing pattern under
`packages/infrastructure/src/use-cases/<domain>/`.

1. **Types** — define shared request, response, and entity types in `packages/domain`, or
   keep use-case-specific types beside the infrastructure contract.
2. **Implementation** — add the use-case under
   `packages/infrastructure/src/use-cases/<domain>/`. Place provider implementation and
   GraphQL documents under the matching provider directory. Return `Result<T, E>` or
   `AsyncResult<T, E>` from `@nimara/domain/objects/Result`.
3. **Expose** — surface the operation through the relevant provider-neutral contract and
   provider implementation.
4. **Consume** — wire it through the app service registry and lazy loader. Apps must not
   import `@nimara/codegen` directly.
5. **Generate** — invoke `/codegen-check` after changing GraphQL documents.
6. **Test** — cover both success and expected-failure Result paths.

Report the files created, the provider contract, and the service entry point the app calls.
Do not invoke `/ship`.
