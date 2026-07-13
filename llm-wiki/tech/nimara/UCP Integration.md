---
type: "Technical Reference"
title: "UCP Integration"
description: "Nimara's built-in Universal Commerce Protocol (2026-04-08) implementation — capabilities, discovery/negotiation, REST endpoints, response envelope, Saleor-specific behaviors, and known limitations."
tags:
  - "nimara"
  - "ucp"
  - "agentic-commerce"
  - "api"
  - "reference"
resource: "/sources/nimara-docs/ucp-integration.md"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/ucp-integration.md) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Nimara ships a built-in implementation of the [Universal Commerce Protocol (UCP)](https://ucp.dev/2026-04-08/specification/overview/), an open standard for **agentic commerce** letting AI agents and platforms discover products, build carts, check out, and retrieve orders through a shared API (source: [ucp-integration](/sources/nimara-docs/ucp-integration.md)). Current UCP version: **`2026-04-08`**. See [Emerging Trends 2026](/product/market/Emerging%20Trends%202026.md) for the agentic-commerce / UCP-MCP strategic context.

### Architecture (three layers)
| Layer | Location | Responsibility |
| --- | --- | --- |
| Discovery | `apps/storefront/src/app/.well-known/ucp/` | business profile endpoint |
| API routes | `apps/storefront/src/app/api/ucp/` | REST route handlers |
| Infrastructure | `packages/infrastructure/src/ucp/` | Saleor integration, serializers |

Endpoints are served under `/api/ucp/{channelSlug}/`. The infrastructure layer translates between Saleor's GraphQL API and UCP's REST/JSON contract.

### Capabilities
`checkout`, `order`, `discount` (extends checkout), `buyer_consent` (extends checkout), `fulfillment` (extends checkout), `cart`, `catalog.search`, `catalog.lookup` — namespaced `dev.ucp.shopping.*`.

### Discovery & negotiation
`GET /.well-known/ucp` returns the business profile (services, capabilities as a registry map, payment handlers). Platforms send a `UCP-Agent: profile="…/.well-known/ucp"` header; the storefront fetches that profile (HTTPS only, no redirects, 3s timeout), validates the version is exactly `2026-04-08`, intersects capabilities, picks the highest compatible version per capability, and prunes orphaned extensions. The negotiated set appears in every response under `ucp.capabilities`.

### Endpoints
- **Catalog:** `POST /catalog/search`, `POST /catalog/lookup`, `POST /catalog/product`.
- **Cart:** `POST /carts`, `GET|PUT /carts/{id}`, `POST /carts/{id}/cancel`.
- **Checkout:** `POST /checkout-sessions`, `GET|PUT /checkout-sessions/{id}`, `POST /checkout-sessions/{id}/{cancel|complete}`.
- **Order:** `GET /orders/{id}`.

### Envelope, errors, lifecycle
- Every response carries a `ucp` envelope (`version`, `status`, `capabilities`, and — on checkout — `payment_handlers`); `ucp.status` (`success`/`error`) is the primary discriminator.
- Errors use the UCP message format with severities `recoverable`, `requires_buyer_input`, `requires_buyer_review`, `unrecoverable`; the latter two set checkout status `requires_escalation` and provide a `continue_url`.
- Checkout status: `incomplete` → `ready_for_complete` → `complete_in_progress` → `completed`, plus `canceled` and `requires_escalation`.
- Monetary amounts are in **ISO 4217 minor units** (`12900` USD = $129.00), always with `currency`.

### Configuration
No dedicated variables — the endpoint is derived from `NEXT_PUBLIC_STOREFRONT_URL` + `NEXT_PUBLIC_DEFAULT_CHANNEL`; also reads `NEXT_PUBLIC_SALEOR_API_URL`. Required headers: `Content-Type` and `UCP-Agent` (mandatory); `Idempotency-Key`, `Request-Id` optional; `Authorization`, `Signature`, `Api-Version` reserved/not validated.

### Saleor-specific behaviors
- **Cart = checkout** — Saleor has no separate cart; UCP carts are Saleor checkouts (same global-ID format); cart→checkout conversion reuses the underlying checkout (idempotent if an incomplete one exists for the `cart_id`).
- **Cancellation** — no native Saleor API; implemented by setting `ucp.cancelled` metadata `"true"` and zeroing line quantities to trigger expiration; updates/completes on cancelled checkouts return `410 Gone`.
- **Buyer data** — stored in `ucp.buyer.json` checkout metadata; **replaced in full** when `buyer` is present in an update, preserved when omitted.
- **Handoff** — `continue_url` routes through proxy middleware that sets a checkout cookie and redirects to the storefront `/checkout` (needs `checkoutID` + `redirectPath` query params).

### Known limitations
Intentional trade-offs / future work: **no authn** (`Authorization`/`Signature` unverified; AP2 mandate checks are dummy stubs; any client with a profile URL can operate on any resource by ID); idempotency is **in-memory only** (24h TTL, unsafe multi-instance; carts unsupported) — recommend Redis; **no rate limiting** (amplified by the outbound profile fetch); **no schema validation** (invalid JSON → 500, except `catalog/lookup` max-50 and `catalog/search` presence checks); **single-channel discovery** (static, uses `NEXT_PUBLIC_DEFAULT_CHANNEL`); **strict version matching** (no semver ranges; HTTP only in dev; 3s fetch timeout); a **complete fallback** hardcodes `currency: "USD"` with empty lines/zero totals when re-fetch fails; and some **error-shape inconsistencies** (empty-body PUT may return a raw array; `catalog/product` returns 200 with an error payload, not 404).

An AI-agent skill file lives at `.agents/skills/ucp-agent/SKILL.md` (or `.claude/skills/ucp-agent/SKILL.md`).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
[Emerging Trends 2026](/product/market/Emerging%20Trends%202026.md)
