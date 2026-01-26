# Overrides: Customizing Without Forking

## Goal
Let users override only what they need without forking the entire repo.

## Strategy
- package code is the default baseline
- app contains override folder (e.g. `apps/storefront/src/nimara/**`)
- CLI copies selected modules from packages into overrides

## Typical override targets
- UI components (from `@nimara/ui`)
- feature components (from `@nimara/features`)
- pages/layouts
- action wrappers
- providers/adapters

## Command examples
```bash
nimara override feature product-detail-page
nimara override component ProductGallery
nimara override action add-to-bag
```

## Rule
Overrides must preserve folder structure to keep future sync possible.
