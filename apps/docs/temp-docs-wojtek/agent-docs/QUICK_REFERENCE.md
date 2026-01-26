# Quick Reference for AI Agents

This is a quick reference guide for AI agents working with the Nimara project. Use this for fast lookups of common patterns and rules.

## 🚫 Critical Rules (Never Violate)

### Architecture Boundaries

```typescript
// ❌ FORBIDDEN: Packages importing from apps
import { something } from "@/app/...";
import { something } from "apps/storefront/...";

// ✅ CORRECT: Apps importing from packages
import { Component } from "@nimara/features/product-detail-page";
```

### Dependency Injection

```typescript
// ❌ FORBIDDEN: Direct provider imports in features
import { SaleorCommerce } from "@nimara/integrations-saleor";

// ✅ CORRECT: Use injected providers
import { useNimara } from "@nimara/core";
const { commerce } = useNimara();
```

### Routing

```typescript
// ❌ FORBIDDEN: App-specific routing in packages
import { LocalizedLink } from "@/components/LocalizedLink";

// ✅ CORRECT: Use routing injection
import { Link } from "@nimara/core-routing";
```

## ✅ Common Patterns

### Action Factory Pattern

```typescript
// packages/features/{feature}/shared/actions/{action}.core.ts
export function createAction({ service }: { service: ServicePort }) {
  return async (input: Input, ctx: Context) => {
    return await service.method(input);
  };
}

// apps/storefront/src/app/.../actions.ts
"use server";
const impl = createAction({ service: providers.service });
export async function action(input: Input) {
  const userId = cookies().get("uid")?.value;
  return await impl(input, { userId });
}
```

### Feature Component Structure

```typescript
// packages/features/{feature}/shop-basic-{feature}/standard.tsx
export function StandardView({ services, ...props }: ViewProps) {
  const { commerce } = services;
  // Component logic
}

// apps/storefront/src/app/.../page.tsx
import { StandardView } from "@nimara/features/{feature}";
const services = await getServiceRegistry();
return <StandardView services={services} {...props} />;
```

### Provider Wiring

```typescript
// apps/storefront/src/providers.ts
import { SaleorCommerce } from "@nimara/integrations-saleor";

export function createProviders() {
  return {
    commerce: new SaleorCommerce({ apiUrl: process.env.API_URL }),
  };
}
```

## 📁 File Locations

### Key Directories

- **Features**: `packages/features/{feature-name}/`
- **Integrations**: `packages/integrations-{provider}/`
- **UI Components**: `packages/ui/src/components/`
- **Domain Models**: `packages/domain/src/objects/`
- **App Routes**: `apps/storefront/src/app/[locale]/(main)/`
- **Overrides**: `apps/storefront/src/nimara/**`
- **Recipe**: `nimara.recipe.yaml`

### Configuration Files

- **Environment**: `.env` (root)
- **Regions**: `apps/storefront/src/foundation/regions/config.ts`
- **i18n**: `apps/storefront/src/i18n/routing.ts`
- **Theme**: `packages/ui/src/styles/globals.css`
- **Tailwind**: `packages/config/src/tailwind.config.ts`

## 🔧 Common Commands

```bash
# Development
pnpm run dev:storefront

# Build
pnpm run build

# Codegen
pnpm run codegen

# Format
pnpm run format

# Test
pnpm run test
```

## 📝 Code Style Quick Rules

### Variables

```typescript
// ✅ Use const
const items = [];

// ✅ Prefix unused with _
const [_first, second] = array;
```

### Imports

```typescript
// ✅ Type imports
import type { Product } from "@nimara/domain";
import { fetchProduct } from "./api";

// ✅ Inline type imports
import { fetchProduct, type Product } from "./api";
```

### Exports

```typescript
// ✅ Named exports
export function Component() {}

// ❌ No default exports
export default function Component() {}
```

### React

```typescript
// ✅ Component structure
interface ComponentProps {
  id: string;
}

export function Component({ id }: ComponentProps) {
  return <div>{id}</div>;
}
```

## 🎯 Decision Tree

### Where Should This Code Go?

```
Is it reusable across apps?
├─ YES → Is it UI?
│   ├─ YES → packages/ui/
│   └─ NO → Is it a feature?
│       ├─ YES → packages/features/{feature}/
│       └─ NO → Is it an integration?
│           ├─ YES → packages/integrations-{provider}/
│           └─ NO → packages/{appropriate}/
└─ NO → Is it Next.js specific?
    ├─ YES → apps/storefront/
    └─ NO → Re-evaluate (might be reusable)
```

### Should I Override or Modify?

```
Need to customize?
├─ Is it in a package?
│   ├─ YES → Use override pattern (apps/storefront/src/nimara/**)
│   └─ NO → Modify directly
└─ Is it app-specific?
    └─ YES → Modify directly
```

## 🔍 Common Issues

### TypeScript Errors

1. Run `pnpm run codegen`
2. Restart TS server
3. Check environment variables

### Import Errors

1. Check if importing from app in package (forbidden)
2. Verify package exports in `index.ts`
3. Check import order (auto-sorted)

### Build Failures

1. Check for circular dependencies
2. Verify all environment variables set
3. Run `pnpm install`
4. Clear `.next` cache

## 📚 Documentation Links

- [Getting Started](./01-getting-started.md)
- [Contributing](./02-contributing.md)
- [Customization](./03-customization.md)
- [Code Style](./05-code-style.md)
- [Architecture](../architecture.md)

## 🎨 Recipe Structure

```yaml
apps:
  - name: storefront
    recipe:
      pages:
        - home: {provider: "shop-basic-home"}
        - pdp: {provider: "shop-basic-pdp"}
      infra:
        - search: {provider: "search-saleor"}
        - payments: {provider: "payments-dummy"}
```

## 💡 Quick Tips

1. **Always check architecture boundaries** before adding imports
2. **Use dependency injection** for all service access
3. **Follow the action factory pattern** for server actions
4. **Use override pattern** for customization
5. **Keep packages framework-agnostic**
6. **Update recipe** when adding features/integrations
