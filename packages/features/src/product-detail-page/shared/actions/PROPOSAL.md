# Proposal: Using Actions in Features Package with Storefront Dependencies

## Problem

The `add-to-bag.ts` action is in the `packages/features` package but depends on storefront-specific imports:
- `@/auth` - `getAccessToken()`
- `@/config` - `CACHE_TTL`
- `@/nimara/foundation/regions` - `getCurrentRegion()`
- `@/nimara/others/checkout/cart` - `getCheckoutId()`, `revalidateCart()`, `setCheckoutIdCookie()`
- `@/nimara/services/*` - `getCartService()`, `getUserService()`, `storefrontLogger`

These `@/` aliases only work in the storefront app, not in the features package.

## Solution Options

### Option 1: Dependency Injection Pattern (Recommended) ⭐

**Pattern**: Pass the action as a prop or via context to the feature components.

#### Implementation

**1. Create action factory in features package:**

```typescript
// packages/features/src/product-detail-page/shared/actions/add-to-bag-factory.ts
"use server";

import { type User } from "@nimara/domain/objects/User";
import type { CartService } from "@nimara/infrastructure/cart/types";
import type { UserService } from "@nimara/infrastructure/user/types";
import type { Logger } from "@nimara/infrastructure/logging/types";
import type { Region } from "@nimara/foundation/regions/types";

export type AddToBagDependencies = {
  getRegion: () => Promise<Region>;
  getCartService: () => Promise<CartService>;
  getUserService: () => Promise<UserService>;
  getAccessToken: () => Promise<string | null>;
  getCheckoutId: () => Promise<string | null>;
  setCheckoutIdCookie: (cartId: string) => Promise<void>;
  revalidateCart: (cartId: string) => Promise<void>;
  cacheTTL: { cart: number };
  logger: Logger;
};

export const createAddToBagAction = (deps: AddToBagDependencies) => {
  return async ({
    variantId,
    quantity = 1,
  }: {
    quantity?: number;
    variantId: string;
  }) => {
    deps.logger.debug("Adding item to bag", { variantId, quantity });

    const [region, cookieCartId, cartService] = await Promise.all([
      deps.getRegion(),
      deps.getCheckoutId(),
      deps.getCartService(),
    ]);

    let user: User | null = null;
    const token = await deps.getAccessToken();

    if (token) {
      const userService = await deps.getUserService();
      const userGetResult = await userService.userGet(token);

      if (userGetResult.ok) {
        user = userGetResult.data;
      }
    }

    const result = await cartService.linesAdd({
      email: user?.email,
      channel: region.market.channel,
      languageCode: region.language.code,
      cartId: cookieCartId,
      lines: [{ variantId, quantity }],
      options: cookieCartId
        ? {
          next: {
            tags: [`CHECKOUT:${cookieCartId}`],
            revalidate: deps.cacheTTL.cart,
          },
        }
        : undefined,
    });

    if (result.ok) {
      if (!cookieCartId) {
        await deps.setCheckoutIdCookie(result.data.cartId);
      }

      void deps.revalidateCart(cookieCartId ?? result.data.cartId);
    }

    return result;
  };
};
```

**2. Create storefront-specific action:**

```typescript
// apps/storefront/src/nimara/features/product-detail-page/actions/add-to-bag.ts
"use server";

import { createAddToBagAction } from "@nimara/features/product-detail-page/shared/actions/add-to-bag-factory";
import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/nimara/foundation/regions";
import {
  getCheckoutId,
  revalidateCart,
  setCheckoutIdCookie,
} from "@/nimara/others/checkout/cart";
import { getCartService } from "@/nimara/services/cart";
import { storefrontLogger } from "@/nimara/services/logging";
import { getUserService } from "@/nimara/services/user";

export const addToBagAction = createAddToBagAction({
  getRegion: getCurrentRegion,
  getCartService,
  getUserService,
  getAccessToken,
  getCheckoutId,
  setCheckoutIdCookie,
  revalidateCart,
  cacheTTL: CACHE_TTL,
  logger: storefrontLogger,
});
```

**3. Update AddToBag component to accept action as prop:**

```typescript
// packages/features/src/product-detail-page/shared/components/add-to-bag.tsx
"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { type BaseError } from "@nimara/domain/objects/Error";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";
import { TranslationMessage } from "@nimara/foundation/i18n/types.js";
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";

type AddToBagAction = (params: {
  variantId: string;
  quantity?: number;
}) => Promise<import("@nimara/domain/objects/Result").Result<{ cartId: string }>>;

type AddToBagProps = {
  isVariantAvailable: boolean;
  variantId: string;
  cartPath: string;
  addToBagAction: AddToBagAction;
};

export const AddToBag = ({ 
  variantId, 
  isVariantAvailable, 
  cartPath,
  addToBagAction,
}: AddToBagProps) => {
  // ... rest of the component
};
```

**4. Pass action from VariantSelectorWrapper:**

```typescript
// packages/features/src/product-detail-page/shared/components/variant-selector-wrapper.tsx
import { VariantSelector } from "./variant-selector";
import { AddToBag } from "./add-to-bag";

// In VariantSelectorWrapper, pass action to VariantSelector
// VariantSelector then passes it to AddToBag
```

**Pros:**
- ✅ Features package is decoupled from storefront
- ✅ Testable with mock dependencies
- ✅ Reusable across different apps
- ✅ Type-safe

**Cons:**
- ⚠️ Requires passing action through component tree
- ⚠️ More boilerplate

---

### Option 2: Service Registry Pattern (Alternative)

**Pattern**: Extend the existing `ServiceRegistry` to include action factories.

#### Implementation

**1. Extend ServiceRegistry type:**

```typescript
// packages/infrastructure/src/types.ts (extend existing)
export interface ServiceRegistry {
  // ... existing services
  actions: {
    addToBag: (params: { variantId: string; quantity?: number }) => Promise<Result<{ cartId: string }>>;
  };
}
```

**2. Create action in storefront and add to registry:**

```typescript
// apps/storefront/src/nimara/services/registry.ts
import { addToBagAction } from "@/nimara/features/product-detail-page/actions/add-to-bag";

export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
  // ... existing services
  return {
    // ... existing services
    actions: {
      addToBag: addToBagAction,
    },
  };
};
```

**3. Use from registry in components:**

```typescript
// In VariantSelectorWrapper or other server components
const { actions } = services;

// Pass to client component
<VariantSelector actions={actions} ... />
```

**Pros:**
- ✅ Consistent with existing ServiceRegistry pattern
- ✅ Centralized service management
- ✅ Easy to extend

**Cons:**
- ⚠️ Actions mixed with services in registry
- ⚠️ Server components need to pass actions to client components

---

### Option 3: Storefront-Specific Action Export (Simplest)

**Pattern**: Keep action implementation in storefront, import from features package only for types.

#### Implementation

**1. Move action to storefront:**

```typescript
// apps/storefront/src/nimara/features/product-detail-page/actions/add-to-bag.ts
"use server";

// ... existing implementation (same as current add-to-bag.ts)
```

**2. Export types from features package:**

```typescript
// packages/features/src/product-detail-page/shared/actions/types.ts
export type AddToBagActionParams = {
  variantId: string;
  quantity?: number;
};

export type AddToBagActionResult = Result<{ cartId: string }>;
```

**3. Update AddToBag to accept action as prop:**

```typescript
// packages/features/src/product-detail-page/shared/components/add-to-bag.tsx
type AddToBagProps = {
  isVariantAvailable: boolean;
  variantId: string;
  cartPath: string;
  addToBagAction: (params: AddToBagActionParams) => Promise<AddToBagActionResult>;
};
```

**Pros:**
- ✅ Simplest solution
- ✅ No abstraction needed
- ✅ Storefront-specific logic stays in storefront

**Cons:**
- ⚠️ Less reusable (action not in features package)
- ⚠️ Each app needs its own action implementation

---

## Recommendation

**Use Option 1 (Dependency Injection Pattern)** because:

1. **Aligns with extraction strategy**: The `FEATURES_EXTRACTION_ANALYSIS.md` recommends dependency injection
2. **Testable**: Easy to mock dependencies for testing
3. **Reusable**: Can be used in multiple apps (storefront, admin, etc.)
4. **Type-safe**: Full TypeScript support
5. **Maintainable**: Clear separation of concerns

## Migration Path

1. Create `add-to-bag-factory.ts` in features package
2. Create storefront-specific action using factory
3. Update `AddToBag` component to accept action as prop
4. Pass action through component tree (VariantSelectorWrapper → VariantSelector → AddToBag)
5. Update storefront to use new action

## Example Usage

```typescript
// In storefront app
import { addToBagAction } from "@/nimara/features/product-detail-page/actions/add-to-bag";

// In VariantSelectorWrapper (server component)
<VariantSelector 
  addToBagAction={addToBagAction}
  // ... other props
/>

// In VariantSelector (client component)
<AddToBag 
  addToBagAction={addToBagAction}
  // ... other props
/>
```

