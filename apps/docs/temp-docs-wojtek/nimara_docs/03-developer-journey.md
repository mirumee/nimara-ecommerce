# Developer Journey (DX)

Nimara’s documentation and tooling should mirror the ideal developer journey.

## The workflow (target)

### Create project
```bash
npx create-nimara-app my-project
cd my-project
```

### Add pieces incrementally (no "wizard")
```bash
nimara add storefront
nimara add provider saleor
nimara add provider payments-dummy
nimara add provider search-algolia
nimara add saleor-app stripe
```

### Run locally
```bash
pnpm dev
```

### Override when needed
```bash
nimara override feature product-detail-page
nimara override ui button
nimara override action add-to-bag
```

### Deploy
- Vercel projects for frontend apps
- Terraform modules for infra (optional)
- CI smoke tests validate providers/health

## DX principles

- Start minimal, add complexity only when selected
- Maintain clean boundaries: packages never import app code
- Make overrides safe, explicit, and reversible
- Provide profiles for local dev that work without real integrations
