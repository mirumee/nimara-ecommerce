# Contributing to Nimara

**Last Updated:** January 26, 2026

We welcome contributions from the community! This guide explains how to contribute effectively.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Adding New Features](#adding-new-features)
3. [Adding New Integrations](#adding-new-integrations)
4. [Testing Guidelines](#testing-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Commit Message Format](#commit-message-format)

---

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

```bash
git checkout -b contrib/your-feature-name
# or
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## Adding New Features

### Step 1: Determine Location

Feature packages go in `packages/features/{feature-name}/`

**Examples:**

- `packages/features/product-detail-page/`
- `packages/features/cart/`
- `packages/features/search/`

### Step 2: Feature Structure

```
packages/features/{feature-name}/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── actions/             # Action factories (*.core.ts)
│   ├── providers/           # Data providers
│   └── metadata/            # Metadata generation
├── shop-basic-{feature}/    # Feature variant
│   └── standard.tsx         # Main view component
├── messages/                # Feature-local translations
│   ├── en-US.json
│   └── en-GB.json
└── index.ts                 # Public exports
```

### Step 3: Use Dependency Injection

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
export type { ProductDetailPageProps } from "./types";
```

---

## Adding New Integrations

New providers (Saleor, Stripe alternatives) go in `packages/integrations/`

### Step 1: Define the Port/Contract

```typescript
// packages/types/src/commerce.ts
export interface CommerceProvider {
  productGet(params: { slug: string }): Promise<Product>;
  productList(params: ListParams): Promise<Product[]>;
  // ... other methods
}
```

### Step 2: Implement the Provider

```typescript
// packages/integrations/shopify/src/ShopifyCommerce.ts
export class ShopifyCommerce implements CommerceProvider {
  constructor(private config: ShopifyConfig) {}

  async productGet({ slug }: { slug: string }) {
    // Implementation using Shopify API
  }
}
```

### Step 3: Register in App

```typescript
// apps/storefront/src/providers.tsx
import { ShopifyCommerce } from "@nimara/integrations-shopify";

const providers = {
  commerce: new ShopifyCommerce({
    domain: process.env.SHOPIFY_DOMAIN!,
  }),
};
```

---

## Testing Guidelines

### Unit Tests

Test pure functions and utilities using Vitest + React Testing Library.

Colocate tests with source: `utils.ts` → `utils.test.ts`

```typescript
// formatPrice.test.ts
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats USD correctly", () => {
    expect(formatPrice(19.99, "USD", "en-US")).toBe("$19.99");
  });
});
```

### Integration Tests

- Test Server Actions with full flow
- Mock external APIs (Saleor, Stripe)
- Verify cache revalidation

### E2E Tests

Use Playwright with Page Object Model.

**Cover critical user journeys:**

- Browse → Add to cart → Checkout → Payment
- User registration → Login → Account management
- Product search → Filter → Sort

```bash
pnpm run test:e2e
```

---

## Pull Request Process

1. **Ensure all tests pass**: `pnpm run test`
2. **Lint your code**: `pnpm run lint`
3. **Format code**: `pnpm run format`
4. **Write clear commit messages**: Use conventional commits
5. **Update documentation**: If adding features
6. **Open a PR** to `develop` branch (not `main`)
7. **Wait for review** from maintainers

### PR Checklist

- [ ] Tests pass locally
- [ ] Code is linted and formatted
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow convention
- [ ] No breaking changes (or clearly documented)
- [ ] PR description explains what and why

---

## Commit Message Format

Use **conventional commits**:

```
feat: add product comparison feature
fix: resolve cart total calculation bug
docs: update installation guide
refactor: extract payment logic to provider
test: add e2e tests for checkout flow
chore: update dependencies
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(cart): add quantity selector to cart items
fix(checkout): resolve payment form validation error
docs(readme): add installation instructions
refactor(product): extract price formatting logic
test(cart): add unit tests for cart calculations
```

---

## Code Review Process

1. **Automated checks** run on every PR (tests, linting)
2. **Maintainer review** - At least one maintainer must approve
3. **Address feedback** - Make requested changes
4. **Merge** - Once approved, maintainers will merge

### What We Look For

- **Code quality** - Follows style guide and conventions
- **Tests** - Adequate test coverage
- **Documentation** - Clear and up-to-date
- **Architecture** - Respects layer boundaries
- **Performance** - No unnecessary performance degradation

---

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/mirumee/nimara-ecommerce/discussions)
- **Bug reports** Use [GitHub Issues](https://github.com/mirumee/nimara-ecommerce/issues)
- **Feature requests** Also via GitHub Issues

---

## Code of Conduct

All contributors must adhere to our [Code of Conduct](../CODE_OF_CONDUCT.md).

We are committed to providing a welcoming and inclusive environment for everyone.

---

**Thank you for contributing to Nimara!** 🙏
