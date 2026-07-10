---
type: "Technical Flow"
title: "Marketplace Authentication Flow"
description: "How marketplace login and App Bridge tokens become UI sessions, GraphQL authorization context, and vendor isolation."
tags:
  - "architecture"
  - "marketplace"
  - "authentication"
  - "authorization"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "marketplace"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:apps/marketplace/src/providers/auth-provider.tsx"
  - "repo:apps/marketplace/src/lib/auth/server.ts"
  - "repo:apps/marketplace/src/lib/auth/jwt.ts"
  - "repo:apps/marketplace/src/lib/graphql/server/auth.ts"
  - "repo:apps/marketplace/src/app/(authenticated)/layout.tsx"
---

# Content

## Session sources

The client auth provider accepts a Saleor Dashboard App Bridge token or a marketplace login
token. It stores the active access token in client state and local storage and mirrors it to an
`auth_token` cookie for Server Components and Server Actions. The authenticated layout redirects
unauthenticated users and can gate the application until Stripe Connect onboarding is complete.

API routes prefer an `Authorization: Bearer` token and fall back to the cookie. This avoids
depending on iframe cookie behavior when the marketplace is opened through Saleor Dashboard.

## GraphQL authorization

The marketplace GraphQL proxy classifies root operations as public, domain-only, app-token-only,
or authenticated. Unknown operations default to authenticated. The Saleor domain is taken from
`x-saleor-domain` or the JWT issuer, then mapped to the installed app configuration.

For authenticated operations, the current layer decodes the JWT, checks expiration and
`user_id`, then resolves `vendor.id` from Saleor user metadata using the installed app token.
Vendor resolution is cached for 60 seconds and carries an explicit throttled state. Resolvers
that require vendor isolation call `requireVendorID`.

## Invariants

- Vendor identity is the vendor profile ID from Saleor metadata, not the Saleor user ID.
- App-token-only operations must have an installed app configuration.
- Unknown GraphQL operations require authentication.
- Vendor-scoped resolvers must fail when vendor identity is unavailable.
- Token clearing removes local tokens and the server cookie.

## Security limitation to preserve visibly

The inspected marketplace auth helpers use `jose.decodeJwt` and expiration checks but do not
cryptographically verify the JWT signature in this layer. The Saleor proxy ultimately receives
the bearer token, but local trust decisions based on decoded claims must not be described as
signature-verified. A future verification change is ADR-worthy because it changes the trust
boundary and key-discovery behavior.

# Related Notes

[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Marketplace Vendor](product/personas/Marketplace%20Vendor.md)
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
[Environments & Access Matrix](quality/Environments%20%26%20Access%20Matrix.md)
