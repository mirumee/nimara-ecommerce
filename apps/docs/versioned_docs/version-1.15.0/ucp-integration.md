---
id: ucp-integration
sidebar_position: 6
title: UCP Integration
---

# Universal Commerce Protocol (UCP)

Nimara includes a built-in implementation of the [Universal Commerce Protocol (UCP)](https://ucp.dev/2026-04-08/specification/overview/), an open standard for agentic commerce. UCP enables AI agents, platforms, and businesses to interact through a shared API for product discovery, cart building, checkout, and order management.

Current version: **`2026-04-08`**

## Overview

The UCP integration exposes a set of REST API endpoints that allow external platforms and AI agents to:

- **Discover** capabilities and payment handlers via a well-known profile
- **Search and browse** the product catalog
- **Build carts** before purchase intent is established
- **Create and manage checkout sessions** with full payment lifecycle
- **Retrieve orders** after checkout completion

All UCP endpoints are served from the storefront under `/api/ucp/{channelSlug}/`.

## Architecture

UCP is implemented across three layers of the Nimara monorepo:

| Layer          | Location                                   | Responsibility                  |
| -------------- | ------------------------------------------ | ------------------------------- |
| Discovery      | `apps/storefront/src/app/.well-known/ucp/` | Business profile endpoint       |
| API Routes     | `apps/storefront/src/app/api/ucp/`         | REST route handlers             |
| Infrastructure | `packages/infrastructure/src/ucp/`         | Saleor integration, serializers |

The infrastructure layer handles all communication with the Saleor backend, translating between Saleor's GraphQL API and UCP's REST/JSON contract.

## Supported Capabilities

| Capability                        | Description                                                   |
| --------------------------------- | ------------------------------------------------------------- |
| `dev.ucp.shopping.checkout`       | Create, update, complete, and cancel checkout sessions        |
| `dev.ucp.shopping.order`          | Retrieve order details post-checkout                          |
| `dev.ucp.shopping.discount`       | Apply/remove discount codes (extends checkout)                |
| `dev.ucp.shopping.buyer_consent`  | Buyer consent collection (extends checkout)                   |
| `dev.ucp.shopping.fulfillment`    | Shipping methods and destination selection (extends checkout) |
| `dev.ucp.shopping.cart`           | Pre-purchase cart building                                    |
| `dev.ucp.shopping.catalog.search` | Free-text product search with filters and pagination          |
| `dev.ucp.shopping.catalog.lookup` | Batch product/variant lookup by identifier                    |

## Discovery

The discovery profile is available at:

```
GET /.well-known/ucp
```

This endpoint returns the business profile describing supported services, capabilities, and payment handlers. Platforms use this profile for capability negotiation before making API calls.

The profile follows the UCP 2026-04-08 format with capabilities as a registry (map of arrays) rather than a flat array. Each capability entry includes `version`, `spec`, and `schema` fields. Extension capabilities (discount, buyer_consent, fulfillment) declare which root capability they extend.

## Capability Negotiation

UCP uses profile-based capability negotiation. Platforms include a `UCP-Agent` header pointing to their own discovery profile:

```
UCP-Agent: profile="https://platform.example/.well-known/ucp"
```

When a request arrives, the storefront:

1. Extracts the profile URL from the `UCP-Agent` header
2. Fetches the platform's profile (HTTPS only, no redirects, 3-second timeout)
3. Validates the platform's UCP version matches `2026-04-08`
4. Computes the intersection of business and platform capabilities
5. Selects the highest compatible version for each shared capability
6. Prunes orphaned extension capabilities (e.g., discount without checkout)

The resulting negotiated capability set is included in every response under `ucp.capabilities`.

## API Endpoints

### Catalog

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| POST   | `/catalog/search`  | Search products by query and filters |
| POST   | `/catalog/lookup`  | Batch lookup products by ID          |
| POST   | `/catalog/product` | Get single product detail            |

### Cart

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/carts`             | Create a new cart          |
| GET    | `/carts/{id}`        | Get cart by ID             |
| PUT    | `/carts/{id}`        | Update cart (full replace) |
| POST   | `/carts/{id}/cancel` | Cancel a cart              |

### Checkout

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/checkout-sessions`               | Create checkout session   |
| GET    | `/checkout-sessions/{id}`          | Get checkout session      |
| PUT    | `/checkout-sessions/{id}`          | Update checkout session   |
| POST   | `/checkout-sessions/{id}/cancel`   | Cancel checkout session   |
| POST   | `/checkout-sessions/{id}/complete` | Complete checkout session |

### Order

| Method | Endpoint       | Description |
| ------ | -------------- | ----------- |
| GET    | `/orders/{id}` | Get order   |

## Response Envelope

All UCP responses include a standard metadata envelope:

```json
{
  "ucp": {
    "version": "2026-04-08",
    "status": "success",
    "capabilities": {
      "dev.ucp.shopping.checkout": [{ "version": "2026-04-08" }]
    },
    "payment_handlers": {}
  },
  "id": "...",
  "status": "incomplete",
  "..."
}
```

- `ucp.status` is the primary success/error discriminator (`"success"` or `"error"`)
- `ucp.capabilities` contains only the capabilities relevant to the current operation
- `ucp.payment_handlers` is present on checkout responses, absent on cart and catalog responses

## Error Handling

Error responses follow the UCP message format:

```json
{
  "ucp": { "version": "2026-04-08", "status": "error", "capabilities": { "..." } },
  "messages": [
    {
      "type": "error",
      "code": "out_of_stock",
      "content": "Item is no longer available",
      "severity": "recoverable"
    }
  ],
  "status": "incomplete",
  "continue_url": "https://storefront.example.com/checkout"
}
```

### Error Severities

| Severity                | Meaning                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `recoverable`           | Platform can fix by modifying inputs and retrying             |
| `requires_buyer_input`  | Merchant needs info their API cannot collect programmatically |
| `requires_buyer_review` | Buyer must authorize before order placement                   |
| `unrecoverable`         | No valid resource exists; retry with new resource or inputs   |

When errors have `requires_buyer_input` or `requires_buyer_review` severity, the checkout status becomes `requires_escalation` and a `continue_url` is provided for handoff to the storefront UI.

## Checkout Status Lifecycle

| Status                 | Meaning                                      |
| ---------------------- | -------------------------------------------- |
| `incomplete`           | Data still being collected                   |
| `ready_for_complete`   | All required data present, ready for payment |
| `complete_in_progress` | Payment/completion in progress               |
| `completed`            | Order created                                |
| `canceled`             | Session cancelled                            |
| `requires_escalation`  | Buyer action needed via `continue_url`       |

## Configuration

The UCP integration uses these environment variables:

| Variable                      | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_STOREFRONT_URL`  | Base URL for generating `continue_url` and links |
| `NEXT_PUBLIC_DEFAULT_CHANNEL` | Default Saleor channel slug for the API endpoint |
| `NEXT_PUBLIC_SALEOR_API_URL`  | Saleor GraphQL API URL                           |

No additional environment variables are required. The UCP API endpoint is automatically constructed from the storefront URL and default channel.

## Prices and Currency

All monetary amounts in UCP are expressed in **ISO 4217 minor units**. For example, `12900` in USD represents $129.00. The `currency` field always accompanies amounts to indicate the denomination.

## Cart-to-Checkout Conversion

When the cart capability is negotiated, platforms can convert a cart to a checkout by including `cart_id` in the create-checkout request:

```json
{
  "cart_id": "cart_abc123",
  "line_items": []
}
```

The business uses the cart contents to initialize the checkout session. If an incomplete checkout already exists for the given `cart_id`, the existing session is returned (idempotent conversion).

## Required Headers

All UCP endpoints expect the following headers:

| Header            | Required | Description                                                                                          |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `Content-Type`    | Yes      | Must be `application/json` for all POST/PUT requests                                                 |
| `UCP-Agent`       | Yes      | Platform profile URL, e.g. `profile="https://platform.example/.well-known/ucp"`                      |
| `Idempotency-Key` | No       | Unique key for safe retries on checkout-session create. Same key + same body returns cached response  |
| `Request-Id`      | No       | Correlation ID echoed back in the response for request tracing                                       |
| `Authorization`   | No       | Reserved for future use. Not currently validated (see Known Limitations)                              |
| `Signature`       | No       | Reserved for future use. Not currently validated (see Known Limitations)                              |
| `Api-Version`     | No       | Reserved for future use. Version is negotiated via the `UCP-Agent` profile                           |

## Known Limitations

The following limitations apply to the current UCP implementation. These represent intentional trade-offs or items planned for future work.

### Authentication and Authorization

UCP endpoints do not currently verify `Authorization` or `Signature` headers. The `UCP-Agent` header validates the platform's _discovery profile_ (capabilities and version), but does not authenticate the caller's identity. Any client with a valid profile URL can operate on any checkout, cart, or order by ID.

The AP2 (Agent Payment Protocol 2) mandate verification functions -- `verifyMerchantAuthorizationDummy`, `verifyCheckoutMandateDummy`, and `validateCheckoutTermsDummy` -- are placeholder stubs. They return success unconditionally and do not perform cryptographic verification.

### Idempotency

Idempotency is supported on checkout-session creation via the `Idempotency-Key` header. However, the current storage is **in-memory only** with a 24-hour TTL. This is not safe for multi-instance or serverless deployments where requests may be routed to different instances.

Cart endpoints do not support idempotency keys.

**Recommendation:** Replace the in-memory idempotency storage with Redis or another distributed cache for production deployments.

### Rate Limiting

No rate limiting is applied to UCP or discovery endpoints. The profile-fetch step during version negotiation amplifies this concern, as each inbound request triggers an outbound HTTP fetch to the platform's profile URL.

### Input Validation

Request bodies are not validated with a schema validation library. Invalid JSON on most endpoints results in an unhandled 500 error rather than a structured 400 response. Exceptions:

- `catalog/lookup` validates array length (max 50 items)
- `catalog/search` checks for the presence of `query` or `filters` but not their internal structure

### Single-Channel Discovery

The discovery profile at `/.well-known/ucp` is statically generated and uses `NEXT_PUBLIC_DEFAULT_CHANNEL` for the endpoint URL. Multi-channel setups require the platform to know channel slugs independently; the discovery profile only advertises one channel.

### Version Negotiation

- Version matching is **strict** -- the platform must support exactly `2026-04-08`. Semver-range matching is not implemented.
- Profile fetching uses HTTPS only in production. HTTP is allowed only when `NODE_ENV` is `development`.
- Profile fetch timeout is 3 seconds. Slow profile hosts may cause request failures.

### Checkout Complete Fallback

When `completeCheckoutSession` succeeds but the subsequent checkout re-fetch fails, a fallback session is built with hardcoded `currency: "USD"`, empty line items, and zero totals. The order data is still attached, but the checkout portion of the response is degraded.

### Error Shape Inconsistencies

- `checkout-sessions/{id}` PUT with an empty body may return a raw JSON array rather than the standard UCP error envelope.
- `catalog/product` returns HTTP 200 with an error payload when the product is not found (per UCP spec convention), rather than HTTP 404.

## Saleor-Specific Behaviors

The UCP implementation is backed by Saleor's GraphQL API, which introduces some Saleor-specific behaviors that integrators should be aware of.

### Cart and Checkout Equivalence

In Saleor, there is no separate "cart" object. UCP carts are implemented as Saleor checkouts under the hood. This means:

- Cart IDs and checkout session IDs follow the same format (Saleor checkout global IDs)
- Creating a cart creates a Saleor checkout
- Converting a cart to a checkout session reuses the same underlying Saleor checkout

### Checkout Cancellation

Saleor does not have a native checkout cancellation API. Cancellation is implemented by:

1. Setting a `ucp.cancelled` metadata key to `"true"` on the checkout
2. Zeroing out all line item quantities to trigger Saleor's built-in checkout expiration

The `canceled` status is determined by reading the `ucp.cancelled` metafield. Updates and completions are blocked on cancelled checkouts, returning a `410 Gone` HTTP status.

### Buyer Data Persistence

Buyer data (email, name, consent flags) is stored in a `ucp.buyer.json` metadata field on the Saleor checkout. This data is **replaced in full** when the `buyer` field is present in an update request -- it is not merged with existing data.

If the `buyer` field is omitted from an update, the existing buyer metadata is preserved unchanged.

### Checkout Handoff (continue_url)

When a checkout requires buyer escalation (e.g., for address input or payment), the response includes a `continue_url`. This URL routes through a proxy middleware that:

1. Sets a checkout session cookie with the Saleor checkout ID
2. Redirects the buyer to the storefront checkout page

The proxy is activated on requests to `/checkout` that include `checkoutID` and `redirectPath` query parameters.

## AI Agent Skill

For AI agent developers, a detailed agent skill file is available at `.agents/skills/ucp-agent/SKILL.md` (or `.claude/skills/ucp-agent/SKILL.md`). This file contains step-by-step conversation flows, request/response examples, and decision logic for building a commerce agent on top of the UCP API.

## Further Reading

- [UCP Specification (2026-04-08)](https://ucp.dev/2026-04-08/specification/overview/)
- [Checkout Capability](https://ucp.dev/2026-04-08/specification/checkout/)
- [Cart Capability](https://ucp.dev/2026-04-08/specification/cart/)
- [Catalog Capability](https://ucp.dev/2026-04-08/specification/catalog/)
- [Order Capability](https://ucp.dev/2026-04-08/specification/order/)
