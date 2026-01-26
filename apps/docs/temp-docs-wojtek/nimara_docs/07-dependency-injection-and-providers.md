# Dependency Injection (IoC) and Providers

The central rule: **feature packages must not depend on the app**.

To achieve that, Nimara uses DI (inversion of control):
- packages depend on interfaces
- apps provide concrete implementations

## Core provider
`@nimara/core` exposes a `NimaraProvider` and `useNimara()` hook.

Providers typically include:
- commerce
- search
- CMS
- inventory
- analytics
- config

## Example
```tsx
"use client";
import { NimaraProvider } from "@nimara/core";
import { SaleorCommerce } from "@nimara/integrations-saleor";

export function AppProviders({ children }) {
  const providers = {
    commerce: new SaleorCommerce({ apiUrl: process.env.NEXT_PUBLIC_SALEOR_API! })
  };

  return <NimaraProvider value={providers}>{children}</NimaraProvider>;
}
```

## Benefits
- No circular dependencies
- Swap providers without changing features
- Features become testable (mock providers)
- Enables marketplace / multi-app setup
