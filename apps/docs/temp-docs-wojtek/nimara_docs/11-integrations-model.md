# Integrations Model: Providers, Manifests, Saleor Apps

## Terminology
- **Providers**: replaceable integrations (payments/search/CMS/commerce)
- **Adapters**: implementation packages (SaleorCommerce, StripePayments, AlgoliaSearch)
- **Saleor Apps**: installable apps that connect to Saleor (nimara-mailer, nimara-stripe)

## Why “providers not apps”
Features should never import Stripe/Algolia directly.
They import interfaces and call injected providers.

## Manifests
Each integration should have a manifest describing:
- id
- type (payments/search/cms)
- required env vars
- packages to install
- docs steps
- optional Saleor app installation steps

Manifests power:
- `nimara add`
- validation
- the future builder

## Swapping
Swap providers without changing features.
Example: Algolia → Meilisearch by changing provider selection and env vars.
