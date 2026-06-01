# Nimara — Claude Code memory

Nimara is a Saleor-based, layered Turborepo/pnpm monorepo for storefronts and
marketplaces. The canonical guidance lives in `AGENTS.md` and the skills under
`.agents/skills/` — this file loads them and pins the always-on rules.

@AGENTS.md

## Always-on rules

- **Server Components first.** Add `"use client"` only for interactivity, hooks, or
  browser APIs. Use Server Actions (`"use server"`) for mutations + `revalidatePath`/
  `revalidateTag`.
- **Result pattern.** Wrap fallible operations in `Result<T, E>` from
  `@nimara/domain/objects/Result`; don't throw for expected business errors. Server
  Actions return Result-like objects.
- **Layer boundaries.** `domain`/`foundation` are leaf packages; `infrastructure` depends
  only on them; `features` composes everything; apps consume features/infra/ui. Never
  import `@nimara/codegen` from app or component code — go through services.
- **Named exports only** (Next.js route/page/layout files are exempt).
- **Codegen.** Run `pnpm codegen` after any `.graphql` change; never hand-write generated
  GraphQL types.
- **Dependencies (CRITICAL).** NEVER add a dependency automatically — propose it with
  alternatives and wait for approval.

## Verify before done

```bash
turbo run lint:staged   # lint changed files
pnpm format:check       # Prettier (must stay clean)
pnpm test               # Vitest
pnpm codegen            # regenerate + check no diff after .graphql edits
```

## Workflow layer

- Subagents (`.claude/agents/`): `lead-developer`, `frontend-expert`, `devops-infra`,
  `qa-testing` — see `AGENTS.md` for each role's charter.
- SDLC commands (`.claude/commands/`): `/feature`, `/new-use-case`, `/codegen-check`,
  `/arch-review`, `/ship`.
- Architecture decisions → `.agents/skills/project-guidelines/SKILL.md`. React/Next →
  `vercel-react-best-practices`, `vercel-composition-patterns`. Build system → `turborepo`.
