# Configuration Model: Recipes

Nimara uses YAML recipes to describe the selected composition of apps, features, infra, and Saleor apps.

## Why recipes?
- Deterministic project composition
- CLI and builder can generate the project from the same source of truth
- Enables swapping providers without rewriting features

## Example: platform recipe (monorepo)
```yaml
meta:
  name: "My Platform"
  environments: ["dev", "prod"]

apps:
  - name: storefront
    path: "frontend/storefront"
    recipe:
      meta:
        name: "My Store"
        type: storefront
      pages:
        - home: e-commerce-basic-home
        - plp: e-commerce-basic-plp
        - pdp: e-commerce-basic-pdp
        - cart: e-commerce-basic-cart
      infra:
        - search: { provider: "search-saleor" }
        - payments: { provider: "payments-dummy" }
        - content: { provider: "content-saleor" }
      saleor:
        apps: []
    generate: true

services: []

saleor:
  defaults:
    url: "${SALEOR_API}"
    channel: "default-channel"
  apps: []

infra:
  modules: []
  vercel:
    projects:
      - name: "${VERCEL_PROJECT_STORE}"
        path: "frontend/storefront"
```

## App recipe vs platform recipe

- `monorepo.recipe.yaml`: describes multiple apps + shared infra.
- `storefront.recipe.yaml`: describes the storefront composition only.

## Validation
Add `nimara validate` that checks:
- required env vars for selected providers/apps
- provider compatibility
- missing page blocks
