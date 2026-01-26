# Contributing to Nimara

This guide explains how to contribute to the Nimara open-source project, including how to add new features, integrations, and follow the project's architecture principles.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Principles](#architecture-principles)
3. [Adding New Features](#adding-new-features)
4. [Adding New Integrations](#adding-new-integrations)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/nimara-ecommerce.git
cd nimara-ecommerce
```

### 2. Set Up Upstream

```bash
git remote add upstream https://github.com/mirumee/nimara-ecommerce.git
git fetch upstream
```

### 3. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b contrib/your-feature-name
# or
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

## Architecture Principles

### The Golden Rule

✅ **Apps can import from packages**  
❌ **Packages must NEVER import from apps**

### Key Principles

1. **Thin Apps, Thick Packages**: Apps are orchestrators; packages contain reusable logic
2. **Provider-Driven**: Features depend on contracts (ports), not implementations
3. **Dependency Injection**: Use DI to decouple features from providers
4. **Override-First**: Users can override without forking
5. **Framework-Aware Boundaries**: Next.js-specific code stays in apps

### Layering Model

```
Domain (packages/domain)
  ↓
Contracts/Ports (packages/types)
  ↓
Application (packages/application)
  ↓
Features (packages/features)
  ↓
Integrations (packages/integrations)
  ↓
Apps (apps/*)
```

## Adding New Features

### Step 1: Determine Location

**Feature packages** go in `packages/features/{feature-name}/`

Examples:
- `packages/features/product-detail-page/`
- `packages/features/cart/`
- `packages/features/search/`

### Step 2: Feature Structure

```
packages/features/{feature-name}/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── actions/            # Action factories (*.core.ts)
│   ├── providers/          # Data providers
│   └── metadata/           # Metadata generation
├── shop-basic-{feature}/   # Feature variant
│   └── standard.tsx        # Main view component
├── messages/               # Feature-local translations (optional)
│   ├── en-US.json
│   └── en-GB.json
└── index.ts               # Public exports
```

### Step 3: Use Dependency Injection

Features must use providers, not direct imports:

```typescript
// ✅ GOOD: Use injected provider
import { useNimara } from "@nimara/core";

export function ProductDetailPage() {
  const { commerce } = useNimara();
  const product = await commerce.productGet({ slug });
}

// ❌ BAD: Direct import
import { SaleorCommerce } from "@nimara/integrations-saleor";
```

### Step 4: Create Action Factories

Actions should be factory functions in `*.core.ts` files:

```typescript
// packages/features/cart/shared/actions/add-to-cart.core.ts
export function createAddToCart({ cart }: { cart: CartPort }) {
  return async (input: AddToCartInput, ctx: ActionContext) => {
    return await cart.addItem(input);
  };
}
```

### Step 5: Use Routing Injection

```typescript
// ✅ GOOD: Use routing injection
import { Link } from "@nimara/core-routing";

export function ProductCard() {
  return <Link href="/products/123">Product</Link>;
}

// ❌ BAD: Direct app import
import { LocalizedLink } from "@/components/LocalizedLink";
```

### Step 6: Export Public API

```typescript
// packages/features/product-detail-page/index.ts
export { StandardPDPView } from "./shop-basic-pdp/standard";
export { createAddToCart } from "./shared/actions/add-to-cart.core";
export type { ProductDetailPageProps } from "./shared/types";
```

### Step 7: Add App Route Wrapper

In the app, create a route that uses the feature:

```typescript
// apps/storefront/src/app/[locale]/(main)/products/[slug]/page.tsx
import { StandardPDPView } from "@nimara/features/product-detail-page";
import { getServiceRegistry } from "@/services/registry";

export default async function Page(props: PageProps) {
  const services = await getServiceRegistry();
  return <StandardPDPView {...props} services={services} />;
}
```

### Step 8: Update Recipe

Add the feature to `nimara.recipe.yaml`:

```yaml
apps:
  - name: storefront
    recipe:
      pages:
        - pdp: {provider: "shop-basic-pdp"}
```

## Adding New Integrations

### Step 1: Create Integration Package

Create `packages/integrations/{provider-name}/`

Example: `packages/integrations-stripe/`

### Step 2: Implement Port Interface

```typescript
// packages/integrations-stripe/src/index.ts
import type { PaymentsPort } from "@nimara/types";

export class StripePayments implements PaymentsPort {
  async processPayment(input: PaymentInput): Promise<PaymentResult> {
    // Stripe-specific implementation
  }
}
```

### Step 3: Create Manifest

Create a manifest describing the integration:

```yaml
# packages/integrations-stripe/manifest.yaml
id: payments-stripe
type: payments
name: Stripe Payments
description: Stripe payment processing integration

env:
  required:
    - NEXT_PUBLIC_STRIPE_PUBLIC_KEY
    - STRIPE_SECRET_KEY
  optional:
    - NEXT_PUBLIC_PAYMENT_APP_ID

packages:
  - "@nimara/integrations-stripe"

docs:
  - Configure Stripe account
  - Set environment variables
  - Install Saleor app (if applicable)
```

### Step 4: Wire in App

In the app, wire the provider:

```typescript
// apps/storefront/src/providers.ts
import { StripePayments } from "@nimara/integrations-stripe";

export function createProviders() {
  return {
    payments: new StripePayments({
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
    }),
    // ... other providers
  };
}
```

### Step 5: Update Recipe

```yaml
apps:
  - name: storefront
    recipe:
      infra:
        - payments: {provider: "payments-stripe"}
```

## Testing Guidelines

### Unit Tests

Test action factories with mocked ports:

```typescript
// packages/features/cart/shared/actions/add-to-cart.core.test.ts
import { createAddToCart } from "./add-to-cart.core";

describe("createAddToCart", () => {
  it("should add item to cart", async () => {
    const mockCart = {
      addItem: vi.fn().mockResolvedValue({ success: true }),
    };
    
    const action = createAddToCart({ cart: mockCart });
    const result = await action({ productId: "123" }, {});
    
    expect(mockCart.addItem).toHaveBeenCalledWith({ productId: "123" });
  });
});
```

### Integration Tests

Test providers with fake adapters:

```typescript
// packages/integrations-stripe/src/index.test.ts
describe("StripePayments", () => {
  it("should process payment", async () => {
    const payments = new StripePayments({ publicKey: "pk_test_..." });
    const result = await payments.processPayment({ amount: 100 });
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests

Add E2E tests in `apps/automated-tests/`:

```typescript
// apps/automated-tests/tests/e2e/checkout/checkout-flow.spec.ts
import { test, expect } from "@playwright/test";

test("should complete checkout", async ({ page }) => {
  await page.goto("/products/test-product");
  await page.click("button:has-text('Add to Cart')");
  // ... complete checkout flow
});
```

## Code Standards

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add product comparison feature
fix: resolve cart calculation bug
docs: update contributing guide
refactor: simplify provider wiring
test: add unit tests for cart actions
```

### Code Style

- Use `const` instead of `let` unless reassignment is required
- Prefer `map` or `reduce` over `forEach`
- Use type imports: `import type { ... }`
- Follow ESLint and Prettier rules (see [Code Style Guide](./05-code-style.md))

### Import Organization

Imports are automatically sorted. Order:
1. Side effect imports
2. Node.js builtins
3. External packages
4. `@nimara/*` packages
5. `@/` aliases
6. Relative imports

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows architecture principles
- [ ] All tests pass: `pnpm run test`
- [ ] Code is formatted: `pnpm run format`
- [ ] No TypeScript errors: `pnpm run build`
- [ ] Documentation updated (if needed)
- [ ] Recipe updated (if adding features/integrations)

### 2. Create Pull Request

1. Push your branch:
   ```bash
   git push origin contrib/your-feature-name
   ```

2. Open PR on GitHub:
   - Target: `develop` branch
   - Clear title and description
   - Reference related issues

3. PR Template Checklist:
   - [ ] Architecture compliant (no package → app imports)
   - [ ] Uses dependency injection
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Recipe updated (if applicable)

### 3. Review Process

- Maintainers will review for:
  - Architecture compliance
  - Code quality
  - Test coverage
  - Documentation

- Address feedback and push updates

### 4. After Merge

- Delete your feature branch
- Update your local `develop` branch

## Common Patterns

### Adding a New Page Type

1. Create feature package: `packages/features/{page-name}/`
2. Create view component
3. Add route in app: `apps/storefront/src/app/[locale]/(main)/{route}/page.tsx`
4. Update recipe: `pages: - {page}: {provider: "shop-basic-{page}"}`

### Adding a New Provider Type

1. Define port interface: `packages/types/src/{type}-port.ts`
2. Create integration: `packages/integrations-{provider}/`
3. Wire in app providers
4. Create manifest
5. Update recipe

### Overriding a Feature

1. Use override pattern: `apps/storefront/src/nimara/**`
2. Copy from package to override location
3. Modify as needed
4. Import override instead of package

## Resources

- [Architecture Documentation](../architecture.md) - Complete architecture reference
- [Code Style Guide](./05-code-style.md) - Coding conventions
- [Getting Started](./01-getting-started.md) - Setup guide

## Getting Help

- GitHub Discussions: [Ask questions](https://github.com/mirumee/nimara-ecommerce/discussions)
- Discord: [Join the community](https://discord.gg/w4V3PZxGDj)
- Issues: [Report bugs](https://github.com/mirumee/nimara-ecommerce/issues)
