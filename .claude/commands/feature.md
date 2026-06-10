---
description: Plan and implement a feature the Nimara way, in the correct layer.
argument-hint: <feature description>
---

Implement this feature: **$ARGUMENTS**

Follow the Nimara SDLC. Do not skip steps.

1. **Locate** — search for similar existing code/patterns first (Grep/Glob). Reuse before
   you add. Reference `.agents/skills/project-guidelines/SKILL.md` to decide the layer.
2. **Place** — choose the correct package:
   - shared types/objects/consts → `packages/domain`
   - external integration / use-case → `packages/infrastructure`
   - feature (UI + logic + state) → `packages/features`
   - utility/hook/helper → `packages/foundation`
   - app wiring/routes → `apps/<app>`
3. **Build** — delegate to the right subagent: UI/pages/forms → `frontend-expert`;
   cross-package or new use-case/service → `lead-developer` (use `/new-use-case`);
   build/CI/env → `devops-infra`. Wrap fallible ops in `Result`. Add `next-intl`
   translations for user-facing text.
4. **Codegen** — if you touched any `.graphql`, run `/codegen-check`.
5. **Test** — add/extend tests via `qa-testing`.
6. **Verify & ship** — run `/arch-review` on the diff, then `/ship`.

Never add a dependency without asking first.
