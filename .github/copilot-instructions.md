# Nimara E-commerce - AI Assistant Context

This file provides comprehensive context for AI coding assistants (GitHub Copilot, Cursor, etc.) working on the Nimara e-commerce project. It enables AI to understand the project structure, conventions, and patterns to generate accurate, contextual code.

---

## Project Type

Full-stack e-commerce platform using Next.js 15 with Saleor headless commerce backend. Built with a monorepo architecture for multi-region, global brands.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **React:** Version 19
- **TypeScript:** Strict mode enabled
- **Styling:** Tailwind CSS 3.x with utility-first approach
- **UI Components:** Shadcn UI (built on Radix UI primitives)
- **Forms:** React Hook Form with Zod validation

### Backend & APIs
- **Commerce Backend:** Saleor GraphQL API
- **Payment Processing:** Stripe Payment Element
- **Authentication:** NextAuth.js v5 (Auth.js)
- **CMS:** Saleor (default) or ButterCMS (optional)
- **Search:** Saleor (default) or Algolia (optional)

### Monorepo & Tools
- **Monorepo:** Turborepo with pnpm workspaces
- **Package Manager:** pnpm 9.x
- **Code Generation:** GraphQL Code Generator
- **Testing:** Vitest (unit), Playwright (E2E)
- **Linting:** ESLint with custom configs
- **Formatting:** Prettier with Tailwind plugin

### Deployment
- **Hosting:** Vercel (multi-environment setup)
- **Error Tracking:** Sentry
- **Logging:** Pino structured logging

---

## Project Structure

```
nimara-ecommerce/
├── apps/
│   ├── storefront/        # Main customer-facing Next.js app
│   ├── stripe/            # Stripe integration Next.js app
│   ├── automated-tests/   # Playwright E2E test suite
│   └── docs/              # Documentation site (Nextra)
├── packages/
│   ├── domain/            # Business logic and entities (no external deps)
│   ├── features/          # Feature implementations (cart, checkout, products)
│   ├── infrastructure/    # External API integrations (Saleor, Stripe)
│   ├── foundation/        # Core utilities, hooks, helpers
│   ├── ui/                # Shared UI components (Shadcn-based)
│   ├── translations/      # i18n message catalogs
│   ├── codegen/           # GraphQL code generation config
│   ├── config/            # Shared configurations
│   └── tsconfig/          # TypeScript configurations
└── terraform/             # Infrastructure as Code
```

**Package Dependencies:**
- `domain` & `foundation` are leaf packages (no internal dependencies)
- `infrastructure` depends on `domain` and `foundation`
- `features` depends on `domain`, `infrastructure`, `foundation`, and `ui`
- Apps can depend on any package

---

## Key Principles

### 1. Server Components First
- **Default:** All components are Server Components
- **Rule:** Only add `'use client'` when you need:
  - Interactivity (onClick, onChange, event handlers)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window, document)
  - Third-party libraries that use browser features
- **Benefits:** Better performance, SEO, smaller bundle size

### 2. Type Safety First
- **TypeScript strict mode** is enabled across all packages
- **GraphQL types** are generated via codegen - never write them manually
- **Validation** uses Zod schemas for runtime type checking
- **Public functions** must have explicit return types

### 3. Composition Over Configuration
- Build complex UIs from simple, focused components
- Prefer component composition over prop drilling
- Server Components wrap Client Components for optimal performance
- Keep components under 200 lines

### 4. Performance Matters
- Leverage Next.js caching (Router Cache, Full Route Cache, Data Cache)
- Use ISR (Incremental Static Regeneration) for frequently updated content
- Implement streaming with Suspense boundaries
- Optimize images with Next/Image component
- Code-split heavy components with dynamic imports

### 5. Internationalization Ready
- All user-facing text must use translation keys
- Use `next-intl` for internationalization
- Support multiple currencies and locales
- Format dates, numbers, and prices according to locale

---

## Common Patterns

### Data Fetching

**Server Components (default):**
```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  // Direct API call in Server Component
  const products = await getProducts();

  return <ProductList products={products} />;
}
```

**Server Actions (mutations):**
```typescript
// actions/cart.ts
'use server';

export async function addToCart(productId: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await saleorAPI.addToCart(productId);
  revalidatePath('/cart');

  return { success: true, data: result };
}
```

**GraphQL Queries:**
```typescript
// 1. Define query in .graphql file
// infrastructure/product/queries/GetProducts.graphql

// 2. Run codegen
// pnpm run codegen

// 3. Use generated types
import { GetProductsDocument } from './queries.generated';

const { data } = await saleorClient.query({
  query: GetProductsDocument,
  variables: { first: 10 },
});
```

### State Management

| State Type | Solution | Example |
|------------|----------|---------|
| **Server state** | React Server Components | Product catalog, user data |
| **Client state** | `useState`, `useReducer` | UI toggles, temporary form data |
| **URL state** | `searchParams` | Filters, pagination, sorting |
| **Form state** | Server Actions + `useFormState` | Checkout, login forms |

### Error Handling

**Server Actions:**
```typescript
'use server';

export async function updateProfile(data: FormData) {
  try {
    const validated = profileSchema.parse(data);
    await updateUser(validated);
    revalidatePath('/account');
    return { success: true };
  } catch (error) {
    console.error('Profile update failed:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
```

**Client Components:**
```typescript
// app/products/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx`, `CheckoutForm.tsx` |
| Utilities | camelCase | `formatPrice.ts`, `validateEmail.ts` |
| Types | PascalCase + `.types.ts` | `Product.types.ts` |
| Constants | camelCase + `constants.ts` | `apiConstants.ts` |
| Server Actions | Inline in components | `add-to-cart.ts` |
| Tests | Same + `.test.ts` | `formatPrice.test.ts` |
| GraphQL | PascalCase + `.graphql` | `GetProducts.graphql` |

---

## When Adding New Features

Follow this checklist:

1. **Check existing patterns** - Look for similar features first
2. **Choose correct package:**
   - `domain` - Pure business logic, entities, types
   - `features` - Feature implementations with components
   - `infrastructure` - External API integrations
   - `foundation` - Utilities, helpers, hooks
3. **Add types** - Define in `@nimara/domain` if shared across packages
4. **Create GraphQL operations:**
   - Add `.graphql` file in `infrastructure`
   - Run `pnpm run codegen`
5. **Add translations** - All user-facing text in message catalogs
6. **Write tests:**
   - Unit tests for utilities
   - Integration tests for Server Actions
   - E2E tests for critical flows
7. **Update documentation** - Add JSDoc for public APIs

---

## When Fixing Bugs

1. **Understand data flow:**
   - Check if it's Server Component or Client Component
   - Trace from user interaction → component → API
2. **Verify boundaries:**
   - Server vs Client Component boundaries correct?
   - Props serializable when passing Server → Client?
3. **Check types:**
   - Run `pnpm run codegen` if GraphQL schema changed
   - Ensure TypeScript has latest generated types
4. **Verify cache:**
   - Is stale data being served?
   - Add `revalidatePath()` after mutations
5. **Add regression test** - Prevent bug from recurring

---

## Common Gotchas

### Server Components
- ❌ **Cannot** use React hooks (`useState`, `useEffect`, etc.)
- ❌ **Cannot** use browser APIs (`window`, `localStorage`, etc.)
- ❌ **Cannot** use event handlers (`onClick`, `onChange`, etc.)
- ✅ **Can** be async
- ✅ **Can** fetch data directly
- ✅ **Can** access server-only resources

### Client Components
- ❌ **Cannot** receive non-serializable props (functions, Dates, etc.)
- ❌ **Cannot** directly access server resources
- ✅ **Can** use all React hooks
- ✅ **Can** use browser APIs
- ✅ **Can** handle user interactions

### Caching
- Always call `revalidatePath()` or `revalidateTag()` after mutations
- Use `export const dynamic = 'force-dynamic'` for auth-protected pages
- Understand the difference between ISR and dynamic rendering

### Stripe
- Webhook signatures **must** be verified
- Payment Intents need proper metadata for order reconciliation
- Test webhooks locally with Stripe CLI

### GraphQL
- Schema changes require running `pnpm run codegen`
- Never manually write types for GraphQL responses
- Use fragments for reusable field selections

---

## Code Style

### Components
```typescript
// ✅ Preferred: Functional components with explicit types
export function ProductCard({ product }: { product: Product }) {
  return <div>{product.name}</div>;
}

// ❌ Avoid: Class components
class ProductCard extends React.Component { }
```

### Exports
```typescript
// ✅ Preferred: Named exports
export function formatPrice() { }
export const API_URL = '...';

// ❌ Avoid: Default exports (except for pages)
export default function formatPrice() { }
```

### Imports
```typescript
// ✅ Correct order
import { Suspense } from 'react';           // React/Next.js
import { useTranslations } from 'next-intl'; // External
import { Product } from '@nimara/domain';    // Internal
import { formatPrice } from './utils';       // Relative
import type { Props } from './types';        // Types last
```

### TypeScript
```typescript
// ✅ Explicit return types for public functions
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Let inference work for obvious cases
const count = items.length; // Type inferred as number
```

### Styling
```typescript
// ✅ Preferred: Tailwind utility classes
<div className="rounded-lg border p-4 shadow-sm hover:shadow-md">

// ⚠️ Use sparingly: CSS Modules for complex animations
import styles from './ProductCard.module.css';
<div className={styles.card}>

// ❌ Avoid: Inline styles
<div style={{ padding: '1rem', borderRadius: '0.5rem' }}>
```

---

## Testing

### Unit Tests
- Test pure functions and utilities
- Use Vitest + React Testing Library
- Colocate tests with source: `utils.ts` → `utils.test.ts`

### Integration Tests
- Test Server Actions with full flow
- Mock external APIs (Saleor, Stripe)
- Verify cache revalidation

### E2E Tests
- Use Playwright with Page Object Model
- Cover critical user journeys:
  - Browse → Add to cart → Checkout → Payment
  - User registration → Login → Account management
  - Product search → Filter → Sort
- Fixtures in `automated-tests/fixtures/`

### Running Tests
```bash
pnpm run test              # Run all unit tests
pnpm run test:watch        # Watch mode
pnpm run test:e2e          # Run E2E tests
```

---

## Documentation

### JSDoc
Add JSDoc comments for public APIs:

```typescript
/**
 * Formats a price value according to the specified currency and locale.
 *
 * @param amount - Numeric price (e.g., 19.99)
 * @param currency - ISO 4217 currency code (e.g., "USD", "EUR")
 * @param locale - BCP 47 language tag (e.g., "en-US", "pl-PL")
 * @returns Formatted price string (e.g., "$19.99")
 *
 * @example
 * ```typescript
 * formatPrice(19.99, 'USD', 'en-US') // Returns: "$19.99"
 * formatPrice(19.99, 'EUR', 'de-DE') // Returns: "19,99 €"
 * ```
 */
export function formatPrice(
  amount: number,
  currency: string,
  locale: string
): string {
  // Implementation
}
```

### Complex Logic
Add inline comments for non-obvious code:

```typescript
// Stripe requires amounts in smallest currency unit (cents for USD)
const amountInCents = Math.round(amount * 100);
```

### Architecture Changes
- Update `ARCHITECTURE.md` for structural changes
- Create ADR (Architecture Decision Record) for significant decisions

---

## Environment Variables

### Required
```env
# Saleor
NEXT_PUBLIC_SALEOR_API_URL=
SALEOR_APP_TOKEN=
NEXT_PUBLIC_DEFAULT_CHANNEL=

# NextAuth
AUTH_SECRET=
AUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
NEXT_PUBLIC_PAYMENT_APP_ID=

# Storefront
NEXT_PUBLIC_STOREFRONT_URL=
```

### Optional
```env
# Search (Algolia)
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=

# CMS (ButterCMS)
BUTTER_CMS_API_KEY=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=debug
```

---

## Quick Commands

```bash
# Development
pnpm run dev:storefront     # Start storefront dev server
pnpm run codegen            # Generate GraphQL types
pnpm run build              # Build all apps/packages
pnpm run test               # Run tests

# Linting & Formatting
pnpm run lint               # Lint all packages
pnpm run format             # Format with Prettier

# Specific apps
pnpm run dev:stripe         # Stripe integration app
pnpm run test:e2e           # Run E2E tests
```

---

## Git Workflow

Three-branch strategy:
- `develop` → Development environment (Vercel)
- `staging` → QA environment (Vercel)
- `main` → Production environment (Vercel)

**Workflow:**
1. Create feature branch from `develop`
2. Develop locally with `pnpm run dev:storefront`
3. Open PR to `develop`
4. After review → merge to `develop` (auto-deploys)
5. When ready for QA → merge `develop` → `staging`
6. After QA approval → merge `staging` → `main` (production)

---

## Additional Context

### Performance Targets
- Lighthouse score: 90+ on all metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle size: Monitor and optimize regularly

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly
- Focus management

### SEO
- Semantic HTML
- OpenGraph meta tags
- JSON-LD structured data
- XML sitemap
- robots.txt

---

## Resources

- **Architecture:** See `ARCHITECTURE.md` for system design
- **Conventions:** See `CONVENTIONS.md` for coding standards
- **Troubleshooting:** See `TROUBLESHOOTING.md` for common issues
- **Saleor API:** https://docs.saleor.io/docs/3.x
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs

---

## Remember

1. **Server Components first** - Add `'use client'` only when needed
2. **Run codegen** - After any GraphQL schema changes
3. **Validate inputs** - Always use Zod for user input
4. **Revalidate cache** - After mutations that change data
5. **Translate text** - All user-facing strings through i18n
6. **Write tests** - Especially for business logic
7. **Document complex code** - Help future developers (and AI)

---

**Last Updated:** January 26, 2026
**Version:** 1.0

For questions or issues, refer to project documentation or reach out to the development team.
