# Code Style Guide

**Last Updated:** January 26, 2026

Consistent coding standards ensure maintainability and quality across the Nimara codebase.

---

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Conventions](#typescript-conventions)
3. [React Patterns](#react-patterns)
4. [Import Organization](#import-organization)
5. [Naming Conventions](#naming-conventions)
6. [File Structure](#file-structure)
7. [Formatting](#formatting)

---

## General Principles

### Use `const` Over `let`

```typescript
// ✅ GOOD
const items = [];
items.push(newItem);

// ❌ BAD
let items = [];
items.push(newItem);
```

### Prefer `map` or `reduce` Over `forEach`

```typescript
// ✅ GOOD
const doubled = numbers.map((n) => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ❌ BAD
let doubled = [];
numbers.forEach((n) => {
  doubled.push(n * 2);
});
```

### Avoid Default Exports

Use named exports for better refactoring and IDE support:

```typescript
// ✅ GOOD: Named exports
export function MyComponent() {
  return <div>Hello</div>;
}

// ❌ BAD: Default exports (except for Next.js pages)
export default function MyComponent() {
  return <div>Hello</div>;
}
```

---

## TypeScript Conventions

### Type Imports

Use type imports to clarify intent:

```typescript
// ✅ GOOD: Separate type imports
import type { Product } from "@nimara/domain";
import { fetchProduct } from "./api";

// ✅ ALSO GOOD: Inline type imports
import { fetchProduct, type Product } from "./api";
```

### Type Definitions

```typescript
// ✅ GOOD: Interfaces for object shapes
interface ProductProps {
  id: string;
  name: string;
  price: number;
}

// ✅ GOOD: Type aliases for unions/intersections
type Status = "pending" | "completed" | "failed";
type ProductWithStatus = Product & { status: Status };
```

### Avoid `any`

Use `unknown` for better type safety:

```typescript
// ✅ GOOD: Use unknown
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
}

// ❌ BAD: Using any
function processData(data: any) {
  return data.toUpperCase();
}
```

### Unused Variables

Prefix unused variables with underscore:

```typescript
// ✅ GOOD: Prefix with underscore
function handler(_event: Event, data: Data) {
  return processData(data);
}

const [_first, second, _third] = array;
```

### Explicit Return Types

Add return types for public functions:

```typescript
// ✅ GOOD: Explicit return type
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// ✅ OK: Inference for private functions
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## React Patterns

### Component Structure

```typescript
// ✅ GOOD: Named export with proper typing
export function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.price}</p>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}
```

### Server Components (Default)

Server Components are the default in Next.js App Router:

```typescript
export default async function ProductPage() {
  // Direct API call in Server Component
  const services = await getServiceRegistry();
  const storeService = await services.getStoreService()
  const productDetails = await storeService.getProductDetails({ ... });

  return // ... work with productDetails;
}
```

### Client Components

Use `'use client'` only when needed:

```typescript
'use client';
import { useState } from 'react';

export function ProductFilters() {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  return (
    <div>
      {/* Interactive UI */}
    </div>
  );
}
```

**When to use Client Components:**

- Interactivity (onClick, onChange)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window)
- Event listeners

### Composition Pattern

Compose Client Components within Server Components:

```typescript
// ✅ GOOD: Server Component wraps Client Components
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const services = await getServiceRegistry();
  const storeService = await services.getStoreService()
  const productDetails = await storeService.getProductDetails({ ... });

  return (
    <div>
      {/* Server Component content */}
      <ProductInfo product={productDetails} />

      {/* Client Components for interactivity */}
      <AddToCartButton productId={productDetails.id} />
      <ProductGallery images={productDetails.images} />
    </div>
  );
}
```

---

## Import Organization

Imports are automatically sorted. Follow this order:

1. React and Next.js imports
2. External libraries (alphabetically)
3. Internal packages (@nimara/\*)
4. Relative imports - parent directories
5. Relative imports - current directory
6. Type imports
7. CSS/Style imports

```typescript
// 1. React and Next.js
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. External libraries
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

// 3. Internal packages
import { Product } from "@nimara/domain/objects/Product";
import { formatPrice } from "@nimara/foundation/formatting";

// 4. Relative imports - parent
import { Layout } from "../../components/Layout";

// 5. Relative imports - current
import { ProductFilters } from "./ProductFilters";

// 6. Type imports
import type { ProductVariant } from "@nimara/domain/objects/Product";

// 7. Styles
import "./styles.css";
```

---

## Naming Conventions

| Type               | Convention                 | Example                               |
| ------------------ | -------------------------- | ------------------------------------- |
| **Components**     | PascalCase                 | `ProductCard.tsx`, `CheckoutForm.tsx` |
| **Utilities**      | camelCase                  | `formatPrice.ts`, `validateEmail.ts`  |
| **Types**          | PascalCase + `.types.ts`   | `Product.types.ts`                    |
| **Constants**      | camelCase + `constants.ts` | `apiConstants.ts`                     |
| **Server Actions** | kebab-case                 | `add-to-cart.ts`                      |
| **Tests**          | Same + `.test.ts`          | `formatPrice.test.ts`                 |
| **GraphQL Files**  | PascalCase + `.graphql`    | `GetProducts.graphql`                 |

### Examples

```typescript
// ✅ GOOD: Clear naming
export function ProductCard() {} // Component
export function formatPrice() {} // Utility
export const API_BASE_URL = "..."; // Constant
export interface ProductProps {} // Type
```

```typescript
// ❌ BAD: Inconsistent naming
export function productCard() {} // Should be PascalCase
export function FormatPrice() {} // Should be camelCase
export const api_base_url = "..."; // Should be UPPER_CASE or camelCase
```

---

## File Structure

### Feature Module Structure

```
packages/features/cart/
├── shared/
│   ├── components/
│   │   ├── CartItem.tsx
│   │   └── CartItem.types.ts
│   ├── actions/
│   │   └── add-to-cart.core.ts
│   └── utils/
│       └── calculateTotal.ts
├── messages/
│   ├── en-US.json
│   └── en-GB.json
└── index.ts
```

### Colocation

Keep related files together:

```
src/components/ProductCard/
├── ProductCard.tsx
├── ProductCard.test.tsx
├── ProductCard.types.ts
└── ProductCard.module.css
```

---

## Formatting

### Automated Formatting

Use Prettier for consistent formatting:

```bash
# Format all files
pnpm run format

# Check formatting
pnpm run format:check
```

### Linting

Use ESLint to enforce code quality:

```bash
# Lint all files
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

### Configuration Files

- **`.eslintrc.js`** - ESLint rules
- **`prettier.config.js`** - Prettier configuration
- **`tsconfig.json`** - TypeScript configuration

---

## Best Practices

### 1. Keep Functions Small

Functions should do one thing well:

```typescript
// ✅ GOOD: Small, focused function
function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100);
}

// ❌ BAD: Doing too much
function processOrder(order: Order) {
  // Validate
  // Calculate
  // Update database
  // Send email
  // Generate invoice
  // ... 200 lines later
}
```

### 2. Use Descriptive Names

```typescript
// ✅ GOOD: Clear intent
const isUserAuthenticated = checkAuthStatus();
const formattedPrice = formatPrice(product.price, "USD");

// ❌ BAD: Unclear abbreviations
const isAuth = chkSts();
const fmtPrc = fmt(p.p, "USD");
```

### 3. Avoid Deep Nesting

```typescript
// ✅ GOOD: Early returns
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;

  return processActiveUser(user);
}

// ❌ BAD: Deep nesting
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return processActiveUser(user);
      }
    }
  }
  return null;
}
```

### 4. Write Self-Documenting Code

```typescript
// ✅ GOOD: Code explains itself
const STRIPE_AMOUNT_MULTIPLIER = 100; // Stripe uses cents

function convertToStripeAmount(dollars: number): number {
  return Math.round(dollars * STRIPE_AMOUNT_MULTIPLIER);
}

// ❌ BAD: Magic numbers
function convertAmount(d: number): number {
  return Math.round(d * 100); // What is 100?
}
```

### 5. Handle Errors Explicitly

```typescript
// ✅ GOOD: Explicit error handling
async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await api.getProduct(id);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// ❌ BAD: Unhandled errors
async function fetchProduct(id: string): Promise<Product> {
  const response = await api.getProduct(id); // What if this fails?
  return response.data;
}
```

---

## Code Review Checklist

When reviewing code, check for:

- [ ] Follows naming conventions
- [ ] No default exports (except pages)
- [ ] Type imports used correctly
- [ ] Functions have explicit return types (public)
- [ ] No `any` types (use `unknown`)
- [ ] Imports properly organized
- [ ] Tests included for new functionality
- [ ] No console.logs in production code
- [ ] Error handling in place
- [ ] Comments explain "why", not "what"

---

## Linter Configuration

Our ESLint setup enforces these rules automatically:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",

    // React
    "react/jsx-no-leaked-render": "error",
    "react-hooks/rules-of-hooks": "error",

    // Imports
    "import/no-default-export": "warn",
    "simple-import-sort/imports": "error",
  },
};
```

---

**Questions?** Check our [Contributing Guide](./CONTRIBUTING.md) or open a [Discussion](https://github.com/mirumee/nimara-ecommerce/discussions).
