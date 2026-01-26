# Monorepo Structure (Medusa-style cleanliness)

Nimara aims for a clean separation of:
- apps (thin orchestration)
- packages (reusable logic)
- integrations (adapters/providers)
- domain (pure types/models)

## Proposed structure

```
apps/
  storefront/          # Next.js app (thin orchestrator)
  vendor-panel/        # optional future
  admin-panel/         # optional future
packages/
  domain/              # pure domain models/types
  types/               # contracts/ports
  core/                # DI contexts/providers
  core-routing/        # routing injection
  core-actions/        # action injection (optional)
  ui/                  # shadcn + tokens-consumer
  theme/               # tokens + tailwind preset
  features/            # PDP/PLP/Cart/etc.
  application/         # use-cases depending on ports
  integrations/        # saleor/stripe/algolia adapters
  config/              # shared defaults/env schema
infra/
  terraform/           # optional
docs/
examples/
```

## Rules
- `packages/**` NEVER import from `apps/**`
- apps can import any packages
- integrations implement ports from `types`
- features depend on core/types/ui/foundation, not app
