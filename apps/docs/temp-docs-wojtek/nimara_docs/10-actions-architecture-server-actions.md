# Actions Architecture (Next.js Server Actions)

## Problem
Packages should be framework-agnostic, but Next.js server actions require `"use server"` and may use:
- cookies()
- headers()
- revalidateTag()

These belong to the app.

## Pattern
1) In packages: export action factories (pure)
- no `"use server"`
- depends on interfaces/providers

2) In app: wrap as server actions
- `"use server"`
- inject providers + per-request context
- run revalidation/cookies/etc.

## Example
Package:
```ts
export function createAddToBag({ cart }) {
  return async (input, ctx) => cart.addItem(...);
}
```

App wrapper:
```ts
"use server";
const impl = createAddToBag({ cart: providers.cart });
export async function addToBagAction(input) {
  const userId = cookies().get("uid")?.value;
  const res = await impl(input, { userId });
  revalidateTag(`cart:${userId}`);
  return res;
}
```

## Optional: ActionsProvider
If features should call actions via hooks, add `@nimara/core-actions`.
