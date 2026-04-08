---
name: Project Guidelines & Architecture
description: Guide for working with Nimara's layered monorepo architecture. Use when adding new features, choosing which package to use, understanding data flow, or making architectural decisions. Covers domain/infrastructure/foundation/features layers and their responsibilities.
metadata:
  author: Nimara Engineering
  version: "1.0.0"
  triggers:
    - "Add a new feature"
    - "Where should I put this code?"
    - "Understanding package layers"
    - "Data flow architecture"
    - "Package dependencies"
---

# Nimara Project Guidelines & Architecture

This skill helps you navigate Nimara's **layered monorepo architecture** and make correct decisions about where code belongs and how layers interact.

## Quick Layer Reference

```
apps/                          # User-facing applications
├── storefront/                # Next.js 15 customer-facing storefront
├── stripe/                    # Stripe payment integration app
└── automated-tests/           # Playwright E2E tests

packages/                      # Shared, reusable code
├── domain/                    # Pure business logic (no framework deps)
├── infrastructure/            # External integrations (APIs, GraphQL)
├── foundation/                # Utilities, hooks, helpers
├── features/                  # Feature implementations (UI + logic)
├── ui/                        # Shared UI components (Shadcn-style)
└── config/                    # Shared configs (Tailwind, ESLint, etc.)
```

---

## Package Layers Explained

### 1. Domain Layer (`@nimara/domain`)

**Responsibility:** Pure business logic, types, constants, entities—zero external dependencies.

**What belongs here:**

- TypeScript types and interfaces (Product, Order, User, etc.)
- Enums and constants (PaymentStatus, OrderStatus, etc.)
- DTOs (Data Transfer Objects) for serialization
- Pure utility functions with no side effects
- Error types and Result<T, E> pattern
- Business rules and validators

**What does NOT belong here:**

- Framework imports (React, Next.js, Node APIs)
- External API clients (Saleor, ButterCMS)
- Database operations
- HTTP requests
- Environment variables

**Example structure:**

```
packages/domain/
├── objects/
│   ├── Result.ts          # Result<T, E> type
│   └── Product.ts         # Product entity
├── types/
│   ├── Cart.types.ts
│   └── Order.types.ts
├── constants/
│   ├── paymentStatus.ts
│   └── orderStatus.ts
└── validators/
    └── emailValidator.ts
```

**Key rule:** Domain is a **leaf package**—it imports nothing from other Nimara packages.

---

### 2. Foundation Layer (`@nimara/foundation`)

**Responsibility:** Core utilities, React hooks, helpers—framework-aware but integration-agnostic.

**What belongs here:**

- React hooks (useLocalStorage, usePagination, etc.)
- Utility functions (formatPrice, formatDate, slugify, etc.)
- Constants and helpers used across apps
- Custom error classes
- Shared adapters for third-party libraries
- Shared type utilities and helpers

**What does NOT belong here:**

- Feature-specific logic (belongs in `features` or `infrastructure`)
- API clients or external integrations
- UI components (those go in `ui`)
- App-specific configurations

**Example structure:**

```
packages/foundation/
├── hooks/
│   ├── usePagination.ts
│   └── useLocalStorage.ts
├── utils/
│   ├── formatPrice.ts
│   ├── formatDate.ts
│   └── slugify.ts
└── types/
    └── common.types.ts
```

**Key rule:** Foundation is a **leaf package**—it depends only on `domain`.

---

### 3. Infrastructure Layer (`@nimara/infrastructure`)

**Responsibility:** External integrations (Saleor, ButterCMS, Algolia, Stripe, etc.) and GraphQL operations.

**What belongs here:**

- GraphQL queries and mutations (.graphql files + generated types)
- External API clients and service adapters
- Data providers (Saleor product provider, CMS provider, etc.)
- Serializers and transformers (raw API response → domain types)
- Use-cases that coordinate infrastructure calls
- Result-based error handling for external operations

**What does NOT belong here:**

- React components
- UI logic
- App-specific routing
- Server Actions (those live in apps)

**Example structure:**

```
packages/infrastructure/
├── saleor/
│   ├── queries/
│   │   ├── GetProducts.graphql
│   │   └── GetProducts.generated.ts
│   ├── mutations/
│   │   └── AddToCart.graphql
│   ├── client.ts           # Saleor client config
│   └── providers/
│       └── ProductProvider.ts
├── butter-cms/
│   ├── client.ts
│   └── providers/
│       └── PageProvider.ts
├── algolia/
│   ├── client.ts
│   └── search.ts
└── use-cases/
    ├── getProduct.ts
    ├── searchProducts.ts
    └── addToCart.ts
```

**Key rule:** Infrastructure depends on `domain` + `foundation`. Services in infrastructure should return `Result<T, E>` for operations that can fail.

---

### 4. Features Layer (`@nimara/features`)

**Responsibility:** Feature implementations—combining UI, state, and business logic into cohesive features.

**What belongs here:**

- Feature-specific React components
- Feature state management (Context, hooks)
- Feature-specific Server Actions
- Feature forms and validation
- Feature-specific utilities
- Feature documentation

**What does NOT belong here:**

- Shared UI primitives (those go in `ui`)
- Core utilities (those go in `foundation`)
- Business logic (that's `domain`)

**Example structure:**

```
packages/features/
├── checkout/
│   ├── Checkout.tsx
│   ├── CheckoutProvider.tsx
│   ├── useCheckout.ts
│   ├── checkoutFormSchema.ts
│   └── _actions/
│       └── completeCheckout.ts
├── product-search/
│   ├── ProductSearch.tsx
│   ├── SearchFilters.tsx
│   └── useProductSearch.ts
└── user-account/
    ├── AccountSettings.tsx
    ├── useUserProfile.ts
    └── _actions/
        └── updateProfile.ts
```

**Key rule:** Features depends on all packages (`domain`, `foundation`, `infrastructure`, `ui`). This is the **only** layer that depends on everything.

---

### 5. UI Layer (`@nimara/ui`)

**Responsibility:** Reusable UI components and design system—presentational, not business logic.

**What belongs here:**

- UI primitives (Button, Input, Card, Modal, etc.)
- Form components
- Layout components
- Icons and SVGs
- Design tokens and theme utilities
- Shared styles and Tailwind extensions

**What does NOT belong here:**

- Business logic
- Feature-specific components
- State management
- Server Actions

**Example structure:**

```
packages/ui/
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   └── Form/
│       ├── FormField.tsx
│       └── FormError.tsx
├── icons/
│   ├── ChevronDown.tsx
│   └── ShoppingCart.tsx
├── layouts/
│   ├── Container.tsx
│   └── Grid.tsx
└── theme/
    └── colors.ts
```

**Key rule:** UI is a **leaf package** or minimal-dependency—imports only `domain` and `foundation` if needed.

---

## Dependency Flow (CRITICAL)

The dependency direction is **unidirectional**:

```
domain (leaf)
   ↑
foundation (leaf)
   ↑
infrastructure ─┐
   ↑             │
   └─ domain    │
   └─ foundation│
                ├→ features
   ui (leaf)    │
   ↑            │
ui ─────────────┘
   ↑
   └─ domain, foundation

apps (storefront, stripe)
   ↑
   └─ features, infrastructure, ui, foundation, domain
```

**In practice:**

- Apps import from: `features`, `infrastructure`, `ui`, `foundation`, `domain`
- Features import from: `infrastructure`, `ui`, `foundation`, `domain` (all packages!)
- Infrastructure imports from: `domain`, `foundation`
- Foundation imports from: `domain` only
- Domain imports from: nothing (pure business logic)
- UI imports from: `domain`, `foundation` (minimal)

**What NEVER happens:**

- ❌ Domain imports anything else
- ❌ Infra imports from Features, UI, or apps
- ❌ Foundation imports from Infra, Features, or UI
- ❌ Apps import from other apps

---

## Decision Tree: Where Does This Code Belong?

### Question 1: Is it pure business logic (no framework, no API calls)?

- **Yes → `domain`**
  - Type definitions, constants, validators
- **No → Next question**

### Question 2: Is it a utility/helper function or React hook?

- **Yes → `foundation`**
  - Helper functions, hooks, adapters
- **No → Next question**

### Question 3: Is it an external API integration or GraphQL operation?

- **Yes → `infrastructure`**
  - API clients, GraphQL, data providers
- **No → Next question**

### Question 4: Is it a reusable UI component (no business logic)?

- **Yes → `ui`**
  - Buttons, inputs, modals, layouts
- **No → Next question**

### Question 5: Is it a feature combining UI + logic?

- **Yes → `features`**
  - Checkout form, product search, account settings
- **No → It's app-specific → Put in `apps/storefront/` or `apps/stripe/`**

---

## Common Scenarios

### Scenario 1: Add a new payment method integration

1. **Domain:** Add payment type/status constants

   ```typescript
   // packages/domain/constants/paymentStatus.ts
   export const PAYMENT_METHODS = {
     CREDIT_CARD: "credit_card",
     DIGITAL_WALLET: "digital_wallet",
   } as const;
   ```

2. **Infrastructure:** Create the payment provider + GraphQL mutations

   ```
   packages/infrastructure/payments/
   ├── mutations/CreatePayment.graphql
   ├── mutations/CreatePayment.generated.ts
   └── providers/PaymentProvider.ts
   ```

3. **Features:** Create the payment form component

   ```
   packages/features/payment-form/
   ├── PaymentForm.tsx
   └── usePayment.ts
   ```

4. **App:** Use in checkout page

   ```typescript
   // apps/storefront/src/app/[locale]/(checkout)/payment/page.tsx
   import { PaymentForm } from '@nimara/features';
   export default function PaymentPage() {
     return <PaymentForm />;
   }
   ```

### Scenario 2: Add a utility function

1. **Check if it's domain logic (pure business rules):** If yes → `domain`
2. **Check if it's a helper used across features:** If yes → `foundation`
3. **If feature-specific:** Keep it in the feature folder

---

## Dependency Management (CRITICAL)

**RULE: NEVER automatically install new dependencies. ALWAYS require explicit user approval first.**

### Why This Matters

- Dependencies affect bundle size, security, and maintenance burden
- Each package adds complexity and potential conflicts
- Alternatives exist and should be evaluated first
- Team should agree on tech choices

### Approval Workflow

1. **Identify the need** — You need a library for a feature
2. **Ask for approval** — List the dependency and explain why
3. **Provide alternatives** — Show other options the user could consider
4. **Wait for confirmation** — User must explicitly approve
5. **Install after approval** — Only then run `pnpm add` or `pnpm add -D`

### Template for Asking Approval

```
I need to add a new dependency to [package-name]:

Package: library-name
Version: X.Y.Z
Purpose: Brief description of what it's used for

Reasons to choose this:
- Reason 1
- Reason 2

Alternatives considered:
- Alternative 1 (pros/cons)
- Alternative 2 (pros/cons)

Where it will be used:
- packages/infrastructure/...
- apps/storefront/...

Should I proceed with installation?
```

### Examples

**❌ WRONG: Automatically installing**

```bash
pnpm add lodash-es
# Package added without asking!
```

**✅ RIGHT: Asking for approval first**

```
I need to add `zod` to `@nimara/domain` for schema validation.

Reasons:
- Runtime validation with TypeScript integration
- Already used in the project
- Lightweight (~8kb gzipped)

Alternatives:
- io-ts (more complex, better for complex validations)
- joi (heavier, more features)

Should I add zod to packages/domain/package.json?
```

### When You DO Have Approval

Once the user approves, proceed:

```bash
# Navigate to the correct package
cd packages/domain

# Install the dependency
pnpm add zod

# Or dev dependency
pnpm add -D vitest

# Verify it was added to package.json
git diff package.json
```

### Common Dependency Scenarios

#### Scenario 1: Adding a UI component library

**Ask for approval because:**

- Affects bundle size significantly
- May introduce styling conflicts
- Should be evaluated for design system alignment

**Before adding:**

```
Should I add shadcn-ui@next to packages/ui?
- Already used in the project
- Gives access to pre-built accessible components
- Can be customized with Tailwind

Approve? (yes/no)
```

#### Scenario 2: Adding a validation library

**Ask for approval because:**

- Core architectural decision
- Affects how data is validated across the app
- Should align with existing patterns

**Before adding:**

```
Should I add zod to @nimara/domain?
- Runtime validation with TS types
- Lightweight and performant
- Already partially used in infrastructure

Approve? (yes/no)
```

#### Scenario 3: Adding a utility library

**Ask for approval because:**

- Can often be replaced with native JS/TS
- Adds to dependency tree
- May have better alternatives

**Before adding:**

```
Should I add date-fns to @nimara/foundation?
- For date formatting and manipulation
- More tree-shakeable than moment.js
- Smaller bundle than other alternatives

Approve? (yes/no)
```

### Exception: Dependencies Already in Project

If a dependency is **already installed and used** elsewhere in the project, you don't need approval to use it in a new package—but you still cannot install it without asking.

```
✅ OK to use: "I'll use the existing zod dependency"
❌ NOT OK: "I'll add zod" (without asking)
```

### Verifying Installation

After installing, always verify:

```bash
# Check package.json was updated
cat packages/your-package/package.json | grep "dependency-name"

# Verify pnpm.lock was updated
git diff pnpm.lock | head -20

# Ensure it's in the right place (dependencies vs devDependencies)
```

### Adding to Package.json Directly

If you're editing `package.json` manually (not recommended), still ask first:

```
I need to add "zod": "^3.22.0" to packages/domain/package.json

Should I proceed? (yes/no)
```

### Monorepo Dependency Rules

**Root workspace:**

- Only devDependencies (turbo, prettier, eslint, etc.)
- Version management tools

**App/package package.json:**

- Only dependencies that app/package actually uses
- No "just in case" dependencies

**Shared packages:**

- Careful about adding to `@nimara/domain` (it should be minimal)
- Infrastructure can have more dependencies (it talks to APIs)
- Foundation utilities should be lightweight

---

## Architecture Best Practices

### 1. Keep Domain Pure

- Domain should be the most stable, reusable layer
- No framework, no external dependencies
- Easy to test, easy to share

### 2. Use Result Pattern in Infrastructure

```typescript
// packages/infrastructure/saleor/products/getProduct.ts
import { Result } from "@nimara/domain/objects/Result";

export async function getProduct(id: string): Promise<Result<Product, Error>> {
  try {
    const product = await saleorClient.getProduct(id);
    return { ok: true, data: product };
  } catch (error) {
    return { ok: false, error };
  }
}
```

### 3. Consume Infrastructure in Features

```typescript
// packages/features/product-detail/useProduct.ts
import { getProduct } from "@nimara/infrastructure/saleor/products";

export function useProduct(id: string) {
  const [result, setResult] = useState<Result<Product, Error>>({ ok: false });
  // ...
  useEffect(() => {
    getProduct(id).then(setResult);
  }, [id]);
  return result;
}
```

### 4. Server Actions Belong in App or Features

```typescript
// packages/features/checkout/_actions/completeCheckout.ts
"use server";

import { completeCheckoutUseCase } from "@nimara/infrastructure";

export async function completeCheckout(data: CheckoutData) {
  const result = await completeCheckoutUseCase(data);
  if (!result.ok) return { error: result.error };
  revalidatePath("/orders");
  return { success: true };
}
```

### 5. Avoid Circular Dependencies

- Feature A imports from Infrastructure ✅
- Infrastructure should NOT import from Feature A ❌
- If you need circular data flow, use Context or lift state

---

## Common Gotchas

### Gotcha 1: Putting API client logic in `domain`

```typescript
// ❌ WRONG: domain should not have external deps
// packages/domain/services/ProductService.ts
import axios from "axios";
export function getProduct(id: string) {
  return axios.get(`/api/products/${id}`);
}

// ✅ RIGHT: move to infrastructure
// packages/infrastructure/saleor/products/getProduct.ts
```

### Gotcha 2: Importing Features from Infrastructure

```typescript
// ❌ WRONG: Creates circular dependency
// packages/infrastructure/use-cases/checkout.ts
import { CheckoutForm } from "@nimara/features";

// ✅ RIGHT: Infrastructure provides data, features consume it
```

### Gotcha 3: App-specific code in shared packages

```typescript
// ❌ WRONG: This is storefront-specific
// packages/features/StorefrontHeader.tsx

// ✅ RIGHT: Keep in app
// apps/storefront/src/components/StorefrontHeader.tsx
```

### Gotcha 4: UI components with business logic

```typescript
// ❌ WRONG: Business logic in UI
// packages/ui/ProductCard.tsx
const ProductCard = ({ productId }) => {
  const product = await fetchProduct(productId); // ❌
  return <div>{product.name}</div>;
};

// ✅ RIGHT: UI receives data as prop
// packages/ui/ProductCard.tsx
const ProductCard = ({ product }: { product: Product }) => {
  return <div>{product.name}</div>;
};
```

---

## When Adding a New Feature

Follow this checklist:

1. **Create domain types** (if new entity type)
   - `packages/domain/types/YourEntity.types.ts`
   - Add to domain constants if needed

2. **Add infrastructure integration** (if external API call)
   - `packages/infrastructure/your-provider/`
   - Create GraphQL queries if Saleor
   - Implement Result-based error handling

3. **Create feature package**
   - `packages/features/your-feature/`
   - Implement components and hooks
   - Add Server Actions if mutations

4. **Use in app**
   - Import from `@nimara/features`
   - Wire up in routing/layouts

5. **Add tests**
   - Unit tests in each package
   - E2E tests in `apps/automated-tests`

---

## Resources

- **Monorepo workflow:** See `AGENTS.md` section "Lead Developer"
- **React/Next.js patterns:** See `.agents/skills/vercel-react-best-practices`
- **Composition patterns:** See `.agents/skills/vercel-composition-patterns`
- **Global rules:** See `.cursor/rules/global.mdc`
