# Getting Started with Nimara

**Last Updated:** January 26, 2026

This guide will help you set up and run Nimara for the first time.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 22.x (`node --version`)
- **pnpm** (`npm install -g pnpm`)
- **Turborepo** (`pnpm install turbo --global`)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mirumee/nimara-ecommerce.git
cd nimara-ecommerce
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create `.env.local` in `apps/storefront/`:

```bash
# Saleor Connection
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel

# Storefront URL
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000

# Environment
ENVIRONMENT=LOCAL

# Default Settings
NEXT_PUBLIC_DEFAULT_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_DEFAULT_PAGE_TITLE=Your Store Name
```

**Optional variables for full functionality:**

```bash
# Payment Provider (Stripe)
NEXT_PUBLIC_PAYMENT_APP_ID=your-payment-app-id
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Search Provider (Algolia)
NEXT_PUBLIC_SEARCH_SERVICE=ALGOLIA
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_API_KEY=your-algolia-api-key

# CMS Provider (ButterCMS)
NEXT_PUBLIC_CMS_SERVICE=BUTTER_CMS
NEXT_PUBLIC_BUTTER_CMS_API_KEY=your-butter-cms-key
```

### 4. Generate TypeScript Types

```bash
pnpm run codegen
```

### 5. Start Development Server

```bash
# Start storefront only
pnpm run dev:storefront

# Or start all apps
pnpm run dev
```

The storefront will be available at `http://localhost:3000`.

---

## Project Structure

```
nimara-ecommerce/
├── apps/
│   ├── storefront/          # Main customer-facing Next.js app
│   ├── stripe/              # Stripe integration app
│   ├── automated-tests/     # Playwright E2E tests
│   └── docs/                # Documentation site
├── packages/
│   ├── domain/              # Pure domain models/types (no dependencies)
│   ├── features/            # Feature implementations (cart, checkout, products)
│   ├── infrastructure/      # External API integrations (Saleor, Stripe)
│   ├── foundation/          # Core utilities and helpers
│   ├── ui/                  # Shared UI components (shadcn-based)
│   ├── translations/        # i18n message catalogs
│   ├── codegen/             # GraphQL code generation config
│   └── config/              # Shared configurations
├── terraform/               # Infrastructure as Code
└── nimara.recipe.yaml       # Project composition configuration
```

---

## Common Commands

### Development

```bash
pnpm run dev:storefront        # Start storefront
pnpm run dev                   # Start all apps
```

### Building

```bash
pnpm run build                 # Build all packages and apps
pnpm run build:storefront      # Build storefront only
```

### Testing

```bash
pnpm run test                  # Run all tests
pnpm run test:watch            # Run tests in watch mode
pnpm run test:e2e              # Run E2E tests
```

### Code Generation

```bash
pnpm run codegen               # Generate GraphQL types
```

### Linting & Formatting

```bash
pnpm run lint                  # Lint all packages
pnpm run format                # Format with Prettier
```

---

## Architecture Principles

### 1. The Golden Rule

✅ **Apps can import from packages**
❌ **Packages must NEVER import from apps**

This ensures clean separation and reusability.

### 2. Layering Model

```
Domain (packages/domain) - Pure business logic, entities, types
  ↓
Infrastructure (packages/infrastructure) - External API integrations
  ↓
Features (packages/features) - Feature implementations
  ↓
Foundation (packages/foundation) - Core utilities
  ↓
Apps (apps/*) - Orchestration and presentation
```

### 3. Server Components First

- All components are Server Components by default
- Only add `'use client'` when you need:
  - Interactivity (onClick, onChange, event handlers)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window)
  - Third-party libraries using browser features

### 4. Provider-Driven Architecture

Features depend on **contracts** (ports), not implementations:

```typescript
// ✅ GOOD: Use injected provider
import { useNimara } from "@nimara/core";

export function ProductDetailPage() {
  const { commerce } = useNimara();
  const product = await commerce.productGet({ slug });
}

// ❌ BAD: Direct import of implementation
import { SaleorCommerce } from "@nimara/integrations-saleor";
```

### 5. Dependency Injection

**Feature packages must not depend on the app**.

Nimara uses DI:

- Packages depend on interfaces
- Apps provide concrete implementations

```tsx
"use client";
import { NimaraProvider } from "@nimara/core";
import { SaleorCommerce } from "@nimara/integrations-saleor";

export function AppProviders({ children }) {
  const providers = {
    commerce: new SaleorCommerce({
      apiUrl: process.env.NEXT_PUBLIC_SALEOR_API!,
    }),
  };

  return <NimaraProvider value={providers}>{children}</NimaraProvider>;
}
```

---

## Data Flow Patterns

### Server Actions (Mutations)

Actions should be factory functions in packages, then wrapped as server actions in apps.

**Package (framework-agnostic):**

```typescript
// packages/features/cart/shared/actions/add-to-cart.core.ts
export function createAddToCart({ cart }: { cart: CartPort }) {
  return async (input: AddToCartInput, ctx: ActionContext) => {
    return await cart.addItem(input);
  };
}
```

**App wrapper (Next.js-specific):**

```typescript
// apps/storefront/src/actions/cart.ts
"use server";

const impl = createAddToCart({ cart: providers.cart });

export async function addToCartAction(input) {
  const userId = cookies().get("uid")?.value;
  const result = await impl(input, { userId });
  revalidateTag(`cart:${userId}`);
  return result;
}
```

### GraphQL Queries

1. Define query in `.graphql` file
2. Run `pnpm run codegen`
3. Use generated types

```graphql
# packages/infrastructure/cart/queries/GetCart.graphql
query GetCart($id: ID!) {
  checkout(id: $id) {
    id
    lines {
      id
      quantity
    }
  }
}
```

```typescript
// Use generated types
import { GetCartDocument } from "./queries.generated";

const { data } = await saleorClient.query({
  query: GetCartDocument,
  variables: { id: cartId },
});
```

---

## Next Steps

- **[Contributing Guide](./CONTRIBUTING.md)** - Learn how to contribute
- **[Customization Guide](./CUSTOMIZATION.md)** - Adapt Nimara for your needs
- **[Code Style Guide](./CODE_STYLE_GUIDE.md)** - Follow coding standards

---

**Need help?** Check our [GitHub Issues](https://github.com/mirumee/nimara-ecommerce/issues) or [Discussions](https://github.com/mirumee/nimara-ecommerce/discussions).
