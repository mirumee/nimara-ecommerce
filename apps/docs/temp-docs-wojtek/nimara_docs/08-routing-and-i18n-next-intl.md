# Routing & i18n (next-intl) in a Modular Monorepo

## Problem: LocalizedLink dependency
Features used app-local `LocalizedLink` heavily.
This blocked extraction to packages.

## Solution: routing injection
Introduce `@nimara/core-routing`:
- defines `LinkProps`, `Routing` interface
- provides `RoutingProvider` and `<Link />`

The app injects `LocalizedLink`:
```tsx
<RoutingProvider value={{ Link: LocalizedLink, href: buildHref }}>
  {children}
</RoutingProvider>
```

Packages use:
```tsx
import { Link } from "@nimara/core-routing";
```

## next-intl config location
next-intl requires `request.ts` and `routing.ts` by convention, but the app should keep them.
Packages must not own framework config.

Recommended:
- keep `apps/storefront/src/i18n/*` (framework-required)
- packages keep only translations & helper functions

## Translations strategy
- colocate translations per feature in packages
- app merges bundles at runtime
- optional type generation for keys
