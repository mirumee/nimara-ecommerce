---
name: feature
description: Plan and implement a Nimara feature in the correct architectural layer. Use when building a complete feature from a user-provided description.
argument-hint: <feature description>
---

# Implement a feature

Implement this feature: **$ARGUMENTS**

Follow the Nimara development workflow. Do not skip steps.

1. **Locate** — search for similar code and patterns first. Reuse before adding. Read
   `.agents/skills/project-guidelines/SKILL.md` to decide the layer.
2. **Place** — choose the correct location:
   - shared types, objects, and constants → `packages/domain`
   - external integrations and use-cases → `packages/infrastructure`
   - feature UI, logic, and state → `packages/features`
   - utilities, hooks, and helpers → `packages/foundation`
   - app wiring and routes → `apps/<app>`
3. **Build** — use the relevant scoped `CLAUDE.md`. When delegating to a specialist agent,
   scope it to implementation and verification and explicitly instruct it to return its
   work without invoking `/ship`. Wrap fallible operations in `Result`. Add `next-intl`
   translations for user-facing text.
4. **Generate** — invoke `/codegen-check` after changing any `.graphql` file.
5. **Test** — add or extend focused tests, then run the relevant quality checks.
6. **Review** — invoke `/arch-review`, summarize the implementation and verification, then
   stop for developer review.

Never invoke `/ship` from this workflow. Shipping is a separate developer-only action.
Never add or remove a dependency without explicit approval.
