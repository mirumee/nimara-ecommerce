---
name: project-guidelines
description: Place new or changed Nimara code in the correct monorepo layer and preserve package dependency direction. Use when adding or moving features, use-cases, integrations, shared utilities, UI, or app wiring; reviewing cross-package data flow; or deciding whether code belongs in domain, foundation, infrastructure, features, ui, or an app.
---

# Place code in Nimara's architecture

Read the nearest scoped `CLAUDE.md` before deciding. Use this skill for placement and
dependency direction; use the scoped instructions for local conventions and commands.

## Choose the layer

Follow this decision tree in order:

1. Is it a provider-neutral business type, rule, value object, constant, or validation?
   Put it in `packages/domain`.
2. Is it an external API operation, GraphQL document, provider adapter, serializer, or
   integration-facing use-case? Put it in `packages/infrastructure`.
3. Is it a reusable presentational component with no feature or provider knowledge? Put it
   in `packages/ui`.
4. Does it combine feature UI, state, validation, and orchestration for reuse by apps? Put
   it in `packages/features`.
5. Is it an integration-agnostic helper or hook reused across capabilities? Put it in
   `packages/foundation`.
6. Is it routing, provider selection, environment configuration, or final composition for
   one application? Keep it in the relevant directory under `apps`.

Keep code local when reuse is only hypothetical. Promote it to a shared package after a
real second consumer establishes the correct abstraction.

## Preserve dependency direction

Use these production-code boundaries:

| Consumer         | May depend on                                                         |
| ---------------- | --------------------------------------------------------------------- |
| `domain`         | No other Nimara package                                               |
| `foundation`     | `domain`                                                              |
| `infrastructure` | `domain`, `foundation`, and generated provider artifacts              |
| `ui`             | `domain` or `foundation` only when a presentational contract needs it |
| `features`       | `domain`, `foundation`, `infrastructure`, `ui`, and `i18n`            |
| `apps`           | Shared packages; never another app                                    |

Build and lint configuration may use `@nimara/config`; do not treat tooling-only
development dependencies as production architecture edges.

Never:

- import React, Next.js, Node-only APIs, environment values, or external clients into
  `domain`;
- import `features`, `ui`, or app code into `infrastructure`;
- fetch data, select providers, or implement business rules in `ui`;
- import `@nimara/codegen` from app or component code;
- import one app from another app;
- hand-edit generated GraphQL output.

## Design cross-layer work

For a new external operation:

1. Define only provider-neutral shared types in `domain`.
2. Define the use-case contract and provider implementation in `infrastructure`.
3. Translate provider responses before returning them; use `Result<T, E>` or
   `AsyncResult<T, E>` for expected failures.
4. Compose reusable user-facing behavior in `features` when more than one app can use it.
5. Select providers and perform final wiring in the consuming app.
6. Add focused tests at the layer that owns the behavior.

Edit GraphQL source documents beside their provider implementation, then run codegen. Keep
generated artifacts behind infrastructure contracts.

## Load details only when needed

- Read [architecture examples](references/architecture-examples.md) when a placement
  decision is ambiguous or spans several layers.
- Read [dependency management](references/dependency-management.md) before proposing,
  declaring, installing, removing, or upgrading a dependency.

## Report the decision

State the selected layer, why the neighboring layers are unsuitable, the dependency edges
introduced, and the checks needed to validate the change.
