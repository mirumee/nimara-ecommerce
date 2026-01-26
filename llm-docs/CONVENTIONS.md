# Development Conventions

**Last Updated:** January 26, 2026
**Version:** 1.0

This document defines the coding standards, patterns, and best practices for the Nimara e-commerce project. Following these conventions ensures consistency, maintainability, and enables effective collaboration with AI coding assistants.

---

## Table of Contents

1. [File Naming](#file-naming)
2. [Folder Structure](#folder-structure)
3. [Import Organization](#import-organization)
4. [Component Structure](#component-structure)
5. [TypeScript Guidelines](#typescript-guidelines)
6. [Error Handling](#error-handling)
7. [Testing Patterns](#testing-patterns)
8. [GraphQL Patterns](#graphql-patterns)
9. [Styling](#styling)
10. [Code Organization](#code-organization)

---

## File Naming

Consistent file naming improves discoverability and reduces cognitive load.

### Rules

| Type | Convention | Example |
|------|-----------|---------|
| **React Components** | PascalCase | `ProductCard.tsx`, `CheckoutForm.tsx` |
| **Utility Functions** | camelCase | `formatPrice.ts`, `validateEmail.ts` |
| **Type Definitions** | PascalCase + `.types.ts` | `Product.types.ts`, `Cart.types.ts` |
| **Constants** | camelCase + `constants.ts` | `apiConstants.ts`, `constants.ts` |
| **Server Actions** | kebab-case (inline in components) | `add-to-bag.ts`, `handle-filters-form-submit.ts` |
| **API Routes** | kebab-case | `route.ts` in `app/api/webhooks/stripe/` |
| **Tests** | Same as source + `.test.ts` | `formatPrice.test.ts`, `ProductCard.test.tsx` |
| **GraphQL Files** | PascalCase + `.graphql` | `GetProducts.graphql`, `AddToCart.graphql` |
| **Page Files** | `page.tsx` | `app/products/page.tsx` |
| **Layout Files** | `layout.tsx` | `app/layout.tsx` |
| **Loading States** | `loading.tsx` | `app/products/loading.tsx` |
| **Error Boundaries** | `error.tsx` | `app/products/error.tsx` |

### Examples

#### ✅ Good
```
src/
├── components/
│   ├── ProductCard.tsx           # Component
│   ├── ProductCard.test.tsx      # Test
│   └── ProductCard.types.ts      # Types
├── utils/
│   ├── formatPrice.ts            # Utility
│   └── formatPrice.test.ts       # Test
├── constants/
│   └── apiConstants.ts           # Constants
└── app/
    └── products/
        ├── page.tsx              # Page component
        ├── loading.tsx           # Loading state
        └── error.tsx             # Error boundary
```

#### ❌ Bad
```
src/
├── components/
│   ├── product-card.tsx          # Should be PascalCase
│   ├── ProductCardComponent.tsx  # Redundant "Component" suffix
│   └── productCard.tsx           # Inconsistent casing
├── utils/
│   ├── FormatPrice.ts            # Should be camelCase
│   └── format_price.ts           # Snake case not used
```

---

## Folder Structure

### Apps Structure

Each app in `apps/` follows Next.js App Router conventions:

```
apps/storefront/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/             # Internationalized routes
│   │   │   ├── (main)/           # Route group
│   │   │   │   ├── products/
│   │   │   │   │   ├── [slug]/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   └── error.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                   # API routes
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/                # App-specific components
│   ├── features/                  # Feature modules
│   ├── foundation/                # App utilities
│   ├── infrastructure/            # App integrations
│   ├── services/                  # Service layer
│   ├── i18n/                      # Internationalization
│   ├── auth.ts                    # NextAuth config
│   ├── middleware.ts              # Next.js middleware
│   └── config.ts                  # App configuration
├── messages/                      # Translation files
│   ├── en.json
│   └── pl.json
├── public/                        # Static assets
└── package.json
```

### Package Structure

Packages in `packages/` follow a consistent structure:

```
packages/domain/
├── src/
│   ├── objects/                   # Domain objects
│   │   ├── Product.ts
│   │   ├── Cart.ts
│   │   └── User.ts
│   ├── consts.ts                  # Package constants
│   └── index.ts                   # Public API
└── package.json

packages/features/
├── src/
│   ├── cart/                      # Feature module
│   │   ├── components/           # React components
│   │   ├── hooks/                # React hooks
│   │   ├── utils/                # Utilities
│   │   ├── types.ts              # Type definitions
│   │   └── index.ts              # Public API
│   ├── checkout/
│   ├── product/
│   └── index.ts
└── package.json

packages/infrastructure/
├── src/
│   ├── cart/
│   │   ├── queries/              # GraphQL queries
│   │   │   ├── GetCart.graphql
│   │   │   └── queries.generated.ts  # Codegen output
│   │   ├── mutations/            # GraphQL mutations
│   │   │   ├── AddToCart.graphql
│   │   │   └── mutations.generated.ts
│   │   ├── api.ts                # API functions
│   │   └── types.ts              # Type definitions
│   └── index.ts
└── package.json
```

### Key Principles

1. **Route Groups:** Use `(groupName)` for logical grouping without affecting URLs
2. **Colocation:** Keep related files together (components, tests, types)
3. **Feature Modules:** Organize by feature, not by file type
4. **Public API:** Export only necessary items through `index.ts`
5. **Separation:** Keep business logic in packages, UI in apps

---

## Import Organization

Consistent import order improves readability and reduces merge conflicts.

### Order

```typescript
// 1. React and Next.js imports
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. External libraries (alphabetically)
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Internal packages (@nimara/*)
import { Product } from '@nimara/domain/objects/Product';
import { formatPrice } from '@nimara/foundation/formatting';
import { ProductCard } from '@nimara/ui/product-card';
import { getProducts } from '@nimara/infrastructure/product';

// 4. Relative imports - parent directories
import { Layout } from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';

// 5. Relative imports - current directory
import { ProductFilters } from './ProductFilters';
import { ProductSort } from './ProductSort';

// 6. Type imports (always last)
import type { ProductVariant } from '@nimara/domain/objects/Product';
import type { FilterOptions } from './types';

// 7. CSS/Style imports (very last)
import './styles.css';
```

### ESLint Configuration

```javascript
// .eslintrc.js
{
  "rules": {
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index",
        "type"
      ],
      "pathGroups": [
        {
          "pattern": "react",
          "group": "builtin",
          "position": "before"
        },
        {
          "pattern": "@nimara/**",
          "group": "internal"
        }
      ],
      "alphabetize": {
        "order": "asc"
      }
    }]
  }
}
```

---

## Component Structure

### Server Components (Default)

Server Components are the default in Next.js App Router. They run only on the server.

#### Characteristics
- ✅ Can be async
- ✅ Direct database/API access
- ✅ Zero JavaScript to client
- ✅ Props must be serializable
- ❌ No React hooks
- ❌ No browser APIs
- ❌ No event handlers

#### Example

```typescript
// app/products/page.tsx
import { Suspense } from 'react';
import { getProducts } from '@nimara/infrastructure/product';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductFilters } from '@/components/ProductFilters'; // Client Component

// ✅ Server Component - async, fetches data
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  // Direct API call in Server Component
  const products = await getProducts({
    category: searchParams.category,
    page: Number(searchParams.page) || 1,
  });

  return (
    <div className="container">
      <h1>Products</h1>

      {/* Client Component for interactivity */}
      <ProductFilters />

      {/* Server Component for data display */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  );
}
```

### Client Components

Use `'use client'` directive when you need:
- Interactivity (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Event listeners
- Third-party libraries that use browser APIs

#### Example

```typescript
// components/ProductFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nimara/ui/button';

// ✅ Client Component - interactive
export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [category, setCategory] = useState(searchParams.get('category') || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    params.set('minPrice', String(priceRange[0]));
    params.set('maxPrice', String(priceRange[1]));

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="filters">
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <Button onClick={handleApplyFilters}>Apply Filters</Button>
    </div>
  );
}
```

### Composition Pattern

Compose Client Components within Server Components for optimal performance.

```typescript
// ✅ Good: Server Component wraps Client Components
// app/products/[slug]/page.tsx
import { getProduct, getRelatedProducts } from '@nimara/infrastructure/product';
import { AddToCartButton } from '@/components/AddToCartButton'; // Client
import { ProductGallery } from '@/components/ProductGallery'; // Client

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Fetch data on server
  const [product, relatedProducts] = await Promise.all([
    getProduct(params.slug),
    getRelatedProducts(params.slug),
  ]);

  return (
    <div>
      {/* Most content is Server Component */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Client Components only where needed */}
      <ProductGallery images={product.images} />
      <AddToCartButton productId={product.id} />

      {/* Related products can be Server Component */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
```

```typescript
// ❌ Bad: Everything is Client Component
'use client';

export default function ProductPage() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch on client - slower, less SEO-friendly
    fetchProduct().then(setProduct);
  }, []);

  // Everything runs on client
  return <div>{/* ... */}</div>;
}
```

---

## TypeScript Guidelines

### Strict Mode

TypeScript strict mode is enabled project-wide:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Types vs Interfaces

**Use `interface` for:**
- Object shapes
- Classes
- When declaration merging is needed
- Public API boundaries

```typescript
// ✅ Good: Interface for objects
interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
}

interface Category {
  id: string;
  name: string;
}
```

**Use `type` for:**
- Unions
- Intersections
- Primitives
- Tuples
- Utility types

```typescript
// ✅ Good: Type for unions
type PaymentStatus = 'pending' | 'completed' | 'failed';

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type Point = [number, number];
```

### Type Inference

Let TypeScript infer types when obvious:

```typescript
// ✅ Good: Inference is clear
const products = await getProducts();
const count = products.length;
const isAvailable = product.stock > 0;

// ❌ Bad: Unnecessary annotations
const count: number = products.length;
const isAvailable: boolean = product.stock > 0;
```

### Explicit Return Types

Add explicit return types for public functions:

```typescript
// ✅ Good: Public function with explicit return type
export function formatPrice(
  amount: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// ✅ Good: Private function can use inference
function calculateDiscount(price: number, percentage: number) {
  return price * (1 - percentage / 100);
}
```

### Const Assertions

Use const assertions for immutable values:

```typescript
// ✅ Good: Const assertion for literal types
export const PAYMENT_METHODS = ['card', 'paypal', 'bank_transfer'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const CONFIG = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  },
  features: {
    enableSearch: true,
  },
} as const;
```

### Utility Types

Leverage TypeScript utility types:

```typescript
// Partial - make all properties optional
type PartialProduct = Partial<Product>;

// Pick - select specific properties
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;

// Omit - exclude specific properties
type ProductWithoutInternal = Omit<Product, 'internalId' | 'createdAt'>;

// Required - make all properties required
type RequiredProduct = Required<PartialProduct>;

// Record - create object type with specific keys
type ProductMap = Record<string, Product>;

// Extract - extract union members
type SuccessStatus = Extract<PaymentStatus, 'completed'>;

// Exclude - remove union members
type NonFailedStatus = Exclude<PaymentStatus, 'failed'>;
```

---

## Error Handling

### Server Actions

Server Actions should return a result object:

```typescript
// ✅ Good: Return success/error object
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
});

export async function addToCart(formData: FormData) {
  try {
    // 1. Validate input
    const data = addToCartSchema.parse({
      productId: formData.get('productId'),
      quantity: Number(formData.get('quantity')),
    });

    // 2. Check authentication
    const session = await auth();
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to add items to cart',
      };
    }

    // 3. Perform action
    const result = await saleorAPI.addToCart({
      productId: data.productId,
      quantity: data.quantity,
    });

    // 4. Revalidate cache
    revalidatePath('/cart');

    // 5. Return success
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Log error for monitoring
    console.error('Add to cart failed:', error);

    // Return user-friendly error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to cart',
    };
  }
}
```

### Client Components

Use Error Boundaries for catching rendering errors:

```typescript
// app/products/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@nimara/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Custom Error Types

Define specific error types:

```typescript
// packages/domain/src/errors.ts
export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class OutOfStockError extends Error {
  constructor(productName: string) {
    super(`${productName} is out of stock`);
    this.name = 'OutOfStockError';
  }
}

export class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PaymentError';
  }
}
```

### Error Messages

Use translation keys for user-facing errors:

```typescript
// ✅ Good: Translated error messages
import { useTranslations } from 'next-intl';

export function CheckoutForm() {
  const t = useTranslations('checkout.errors');

  const handleSubmit = async () => {
    const result = await processPayment();

    if (!result.success) {
      // Display translated error
      toast.error(t('paymentFailed', { reason: result.error }));
    }
  };
}
```

---

## Testing Patterns

### File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts` (in `apps/automated-tests/tests/`)

### Unit Tests

Test pure functions and utilities:

```typescript
// packages/foundation/src/formatting/formatPrice.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(19.99, 'USD', 'en-US')).toBe('$19.99');
  });

  it('formats EUR correctly', () => {
    expect(formatPrice(19.99, 'EUR', 'pl-PL')).toBe('19,99 €');
  });

  it('handles zero amount', () => {
    expect(formatPrice(0, 'USD', 'en-US')).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatPrice(-10, 'USD', 'en-US')).toBe('-$10.00');
  });
});
```

### Component Tests

Test component behavior:

```typescript
// components/ProductCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 19.99,
    image: '/test.jpg',
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('renders product image', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', '/test.jpg');
  });
});
```

### E2E Tests

Use Page Object Model pattern:

```typescript
// apps/automated-tests/tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Flow', () => {
  test('completes purchase successfully', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Add product to cart
    await page.goto('/products/test-product');
    await page.click('[data-testid="add-to-cart"]');

    // Go to checkout
    await cartPage.goto();
    await cartPage.clickCheckout();

    // Fill shipping info
    await checkoutPage.fillShippingInfo({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      address: '123 Main St',
      city: 'New York',
      zipCode: '10001',
    });

    // Complete payment
    await checkoutPage.fillPaymentInfo({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
    });

    await checkoutPage.submitOrder();

    // Verify success
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
```

### Test Data Management

Use fixtures for consistent test data:

```typescript
// apps/automated-tests/fixtures/products.ts
export const mockProducts = {
  tshirt: {
    id: 'prod_1',
    name: 'Classic T-Shirt',
    price: 29.99,
    category: 'clothing',
    stock: 100,
  },
  laptop: {
    id: 'prod_2',
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'electronics',
    stock: 5,
  },
};
```

---

## GraphQL Patterns

### File Structure

Organize GraphQL operations in dedicated files:

```
packages/infrastructure/src/product/
├── queries/
│   ├── GetProduct.graphql
│   ├── GetProducts.graphql
│   └── queries.generated.ts       # Generated by codegen
├── mutations/
│   ├── CreateProduct.graphql
│   └── mutations.generated.ts
└── fragments/
    ├── ProductFragment.graphql
    └── fragments.generated.ts
```

### Query Example

```graphql
# packages/infrastructure/src/product/queries/GetProducts.graphql
query GetProducts($first: Int!, $after: String, $channel: String!) {
  products(first: $first, after: $after, channel: $channel) {
    edges {
      node {
        id
        name
        slug
        thumbnail {
          url
          alt
        }
        pricing {
          priceRange {
            start {
              gross {
                amount
                currency
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Fragments

Use fragments for reusable field selections:

```graphql
# packages/infrastructure/src/product/fragments/ProductFragment.graphql
fragment ProductDetails on Product {
  id
  name
  slug
  description
  thumbnail {
    url
    alt
  }
  media {
    url
    alt
  }
  category {
    id
    name
  }
  pricing {
    priceRange {
      start {
        gross {
          amount
          currency
        }
      }
    }
  }
}
```

```graphql
# Use fragment in query
query GetProduct($slug: String!, $channel: String!) {
  product(slug: $slug, channel: $channel) {
    ...ProductDetails
  }
}
```

### Code Generation

After creating/modifying `.graphql` files, run codegen:

```bash
pnpm run codegen
```

### Using Generated Types

```typescript
// packages/infrastructure/src/product/api.ts
import { GetProductsDocument } from './queries/queries.generated';
import { saleorClient } from '../graphql/client';

export async function getProducts(variables: {
  first: number;
  after?: string;
  channel: string;
}) {
  const { data } = await saleorClient.query({
    query: GetProductsDocument,
    variables,
  });

  return data.products;
}
```

---

## Styling

### Tailwind CSS

Nimara uses Tailwind CSS for styling. Follow utility-first approach.

#### Component Classes

```typescript
// ✅ Good: Tailwind utilities
export function ProductCard({ product }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 w-full object-cover rounded-md"
      />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {product.name}
      </h3>
      <p className="mt-2 text-xl font-bold text-blue-600">
        {formatPrice(product.price)}
      </p>
    </div>
  );
}
```

#### Responsive Design

Mobile-first approach:

```typescript
<div className="
  w-full            // Mobile: full width
  md:w-1/2          // Tablet: half width
  lg:w-1/3          // Desktop: third width
  px-4              // Padding on all screens
  md:px-6           // More padding on tablet+
">
  {/* Content */}
</div>
```

### Shadcn UI Components

Use Shadcn components for consistency:

```typescript
import { Button } from '@nimara/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@nimara/ui/card';

export function ProductDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Product description...</p>
        <Button variant="default" size="lg" className="mt-4">
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
```

### CSS Modules (When Needed)

For complex, component-specific styles:

```typescript
// ProductCard.module.css
.card {
  @apply rounded-lg border p-4;
}

.card:hover {
  @apply shadow-lg;
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}

// ProductCard.tsx
import styles from './ProductCard.module.css';

export function ProductCard() {
  return <div className={styles.card}>{/* ... */}</div>;
}
```

### Dynamic Classes

Use `cn` utility for conditional classes:

```typescript
import { cn } from '@nimara/foundation/utils';

export function Button({
  variant = 'default',
  size = 'md',
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        // Base styles
        'rounded font-medium transition-colors',
        // Variant styles
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'default',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 hover:bg-gray-50': variant === 'outline',
        },
        // Size styles
        {
          'px-3 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        // Custom classes
        className
      )}
      {...props}
    />
  );
}
```

---

## Code Organization

### Single Responsibility Principle

Each function/component should have one reason to change:

```typescript
// ✅ Good: Separated concerns
function ProductList({ products }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Card>
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo product={product} />
      <AddToCartButton productId={product.id} />
    </Card>
  );
}

// ❌ Bad: Too many responsibilities
function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <img src={product.image} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <span>{formatPrice(product.price)}</span>
          <button onClick={() => addToCart(product.id)}>Add to Cart</button>
          {/* Too much in one component */}
        </div>
      ))}
    </div>
  );
}
```

### Composition Over Inheritance

Build complex components by composing simpler ones:

```typescript
// ✅ Good: Composition
function CheckoutPage() {
  return (
    <CheckoutLayout>
      <CheckoutSteps />
      <CheckoutForm>
        <ShippingSection />
        <PaymentSection />
        <ReviewSection />
      </CheckoutForm>
      <CheckoutSummary />
    </CheckoutLayout>
  );
}
```

### Keep Components Small

Aim for components under 200 lines. Extract when larger:

```typescript
// Before: 300 lines
function CheckoutForm() {
  // Validation logic
  // Form state
  // Submit handler
  // Render huge form
}

// After: Multiple small components
function CheckoutForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <ShippingForm />
      <PaymentForm />
      <ReviewForm />
    </Form>
  );
}
```

### Extract Complex Logic

Move complex logic to utility functions:

```typescript
// ✅ Good: Extracted logic
// utils/cart.ts
export function calculateCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const discount = item.discount || 0;
    return total + (itemTotal - discount);
  }, 0);
}

export function calculateTax(subtotal: number, taxRate: number) {
  return subtotal * taxRate;
}

// components/CartSummary.tsx
function CartSummary({ items, taxRate }) {
  const subtotal = calculateCartTotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const total = subtotal + tax;

  return <div>{/* Display totals */}</div>;
}
```

### Avoid Prop Drilling

Use composition instead of passing props through multiple levels:

```typescript
// ❌ Bad: Prop drilling
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} setUser={setUser} />;
}

function Layout({ user, setUser }) {
  return <Header user={user} setUser={setUser} />;
}

function Header({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}

// ✅ Good: Composition
function App() {
  const [user, setUser] = useState(null);

  return (
    <Layout>
      <Header>
        <UserMenu user={user} onLogout={() => setUser(null)} />
      </Header>
    </Layout>
  );
}
```

---

## Best Practices Summary

### Do's ✅

- Use Server Components by default
- Add `'use client'` only when necessary
- Follow naming conventions consistently
- Write tests for business logic
- Use TypeScript strict mode
- Validate inputs with Zod
- Document complex code with JSDoc
- Keep components focused and small
- Extract reusable logic
- Use Tailwind utility classes
- Leverage GraphQL code generation

### Don'ts ❌

- Don't mix naming conventions
- Don't fetch data in Client Components
- Don't ignore TypeScript errors
- Don't skip error handling
- Don't use `any` type
- Don't create God components
- Don't prop drill excessively
- Don't write inline styles
- Don't manually write GraphQL types
- Don't commit with linting errors

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

---

**Questions?** Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) or reach out to the team.
