# Skill: UCP Commerce Agent

## What is UCP?

Universal Commerce Protocol (UCP) is an open standard for agentic commerce -- a common language for AI agents, platforms, and businesses. It defines building blocks for the full commerce lifecycle: discovery, catalog browsing, cart building, checkout, payment, and post-purchase (orders, returns).

Key properties:

- REST-based API with JSON payloads
- Profile-based capability negotiation via `UCP-Agent` header
- Supports OAuth 2.0 for identity linking (Agent Payments Protocol / AP2)
- Compatible with MCP, A2A, and other agent frameworks
- Co-developed by Google, Shopify, Stripe, Mastercard, PayPal, Klarna, and others

Current version used in this storefront: **`2026-04-08`**

Reference: <https://ucp.dev/2026-04-08/specification/overview/>

---

## Goal

Assist the user in discovering products, building a cart, and completing a checkout process using the UCP REST API implemented in this storefront.

The agent must guide the user conversationally and perform API calls when required.

---

## Capabilities

Capabilities must be discovered by calling the Discovery Endpoint. This storefront supports:

| Capability                        | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| `dev.ucp.shopping.checkout`       | Create, update, complete checkout sessions           |
| `dev.ucp.shopping.order`          | Retrieve order details post-checkout                 |
| `dev.ucp.shopping.discount`       | Apply/remove discount codes (extends checkout)       |
| `dev.ucp.shopping.buyer_consent`  | Buyer consent collection (extends checkout)          |
| `dev.ucp.shopping.fulfillment`    | Shipping methods and destinations (extends checkout) |
| `dev.ucp.shopping.cart`           | Pre-purchase cart building (lightweight CRUD)        |
| `dev.ucp.shopping.catalog.search` | Free-text product search with filters                |
| `dev.ucp.shopping.catalog.lookup` | Batch product/variant lookup by ID                   |

Every capability includes `schema` and `spec` fields. Use these to gather more information about a particular capability.

---

## Discovery Endpoint

Before making any API calls, the agent SHOULD fetch the discovery profile to learn the supported capabilities, API endpoint, and payment handlers.

```bash
GET http://localhost:3000/.well-known/ucp
```

Response:

```json
{
  "ucp": {
    "version": "2026-04-08",
    "services": {
      "dev.ucp.shopping": [
        {
          "version": "2026-04-08",
          "spec": "https://ucp.dev/2026-04-08/specification/overview/",
          "transport": "rest",
          "schema": "https://ucp.dev/2026-04-08/services/shopping/openapi.json",
          "endpoint": "https://<storefront-url>/api/ucp/<channelSlug>"
        }
      ]
    },
    "capabilities": {
      "dev.ucp.shopping.checkout": [
        { "version": "2026-04-08", "spec": "...", "schema": "..." }
      ],
      "dev.ucp.shopping.order": [
        { "version": "2026-04-08", "spec": "...", "schema": "..." }
      ],
      "dev.ucp.shopping.discount": [
        { "version": "2026-04-08", "extends": "dev.ucp.shopping.checkout" }
      ],
      "dev.ucp.shopping.buyer_consent": [
        { "version": "2026-04-08", "extends": "dev.ucp.shopping.checkout" }
      ],
      "dev.ucp.shopping.fulfillment": [
        { "version": "2026-04-08", "extends": "dev.ucp.shopping.checkout" }
      ],
      "dev.ucp.shopping.cart": [
        { "version": "2026-04-08", "spec": "...", "schema": "..." }
      ],
      "dev.ucp.shopping.catalog.search": [
        { "version": "2026-04-08", "spec": "...", "schema": "..." }
      ],
      "dev.ucp.shopping.catalog.lookup": [
        { "version": "2026-04-08", "spec": "...", "schema": "..." }
      ]
    },
    "payment_handlers": {}
  },
  "signing_keys": []
}
```

Use the `endpoint` value from the service entry as the base URL for all subsequent API calls.

---

## API Base URL

```bash
http://localhost:3000/api/ucp/{channelSlug}
```

Default channel slug: `default-channel` (unless `NEXT_PUBLIC_DEFAULT_CHANNEL` env var differs).

Example base URL: `http://localhost:3000/api/ucp/default-channel`

---

## Required Request Headers

All UCP API requests must include:

| Header            | Value                   | Required                            |
| ----------------- | ----------------------- | ----------------------------------- |
| `Content-Type`    | `application/json`      | Yes                                 |
| `UCP-Agent`       | `profile="https://..."` | Required (profile URL of platform)  |
| `Idempotency-Key` | unique UUID per request | Recommended for mutations           |
| `Request-Id`      | unique UUID per request | Recommended                         |
| `Authorization`   | `Bearer <token>`        | Required for authenticated sessions |

The `UCP-Agent` header must contain a `profile` parameter pointing to the platform's own `/.well-known/ucp` endpoint. The business fetches this profile to perform capability negotiation.

---

## UCP Response Envelope

All responses include a `ucp` metadata object:

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
  "...": "..."
}
```

- `ucp.status`: `"success"` or `"error"` -- primary discriminator for response handling
- `ucp.capabilities`: only the capabilities relevant to the current operation
- `ucp.payment_handlers`: present on checkout responses, absent on cart/catalog

Error responses use the same envelope:

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
| `requires_buyer_input`  | Merchant needs info their API can't collect programmatically  |
| `requires_buyer_review` | Buyer must authorize (policy, regulatory, entitlement rules)  |
| `unrecoverable`         | No valid resource exists; start over with new resource/inputs |

---

## API: Catalog

### Search Products

```bash
POST /catalog/search
```

Request:

```json
{
  "query": "blue running shoes",
  "context": {
    "address_country": "US",
    "currency": "USD"
  },
  "filters": {
    "categories": ["Footwear"],
    "price": { "max": 15000 }
  },
  "pagination": { "limit": 20 }
}
```

Response (HTTP 200):

```json
{
  "ucp": { "version": "2026-04-08", "status": "success", "capabilities": { "..." } },
  "products": [
    {
      "id": "prod_abc123",
      "handle": "blue-runner-pro",
      "title": "Blue Runner Pro",
      "description": { "plain": "Lightweight running shoes." },
      "price_range": {
        "min": { "amount": 12900, "currency": "USD" },
        "max": { "amount": 14900, "currency": "USD" }
      },
      "variants": [
        {
          "id": "var_xyz",
          "title": "Blue / Size 10",
          "price": { "amount": 12900, "currency": "USD" },
          "availability": { "available": true }
        }
      ]
    }
  ],
  "pagination": { "has_next_page": false, "total_count": 1 }
}
```

Use when: user asks to search or browse products. At least one of `query` or `filters` is required.

Prices are in ISO 4217 **minor units** (e.g., 12900 = $129.00 USD).

---

### Lookup Products by ID

```bash
POST /catalog/lookup
```

Request:

```json
{
  "ids": ["prod_abc123", "var_xyz"]
}
```

Response (HTTP 200): same shape as search but with `inputs` on each variant for correlation.

Use when: you have product/variant IDs and need to retrieve their details.

---

### Get Product Detail

```bash
POST /catalog/product
```

Request:

```json
{
  "id": "prod_abc123",
  "selected": [{ "name": "Color", "label": "Blue" }]
}
```

Response (HTTP 200): single `product` object with full detail, filtered variants matching selections.

Use when: user has selected a specific product and needs full detail with option selection.

---

## API: Cart

Cart provides lightweight pre-checkout basket building. No payment configuration.

### Create Cart

```bash
POST /carts
```

Request:

```json
{
  "line_items": [{ "item": { "id": "var_xyz" }, "quantity": 2 }],
  "context": { "address_country": "US" },
  "buyer": { "email": "user@example.com" }
}
```

Response (HTTP 201): cart object with `id`, `line_items`, `currency`, `totals`, `continue_url`.

### Get Cart

```bash
GET /carts/{id}
```

### Update Cart

```bash
PUT /carts/{id}
```

Full replacement of cart state. Send entire cart resource.

### Cancel Cart

```bash
POST /carts/{id}/cancel
```

Returns cart state before deletion. Subsequent operations return `not_found`.

---

## API: Checkout

### 1. Create Checkout Session

```bash
POST /checkout-sessions
```

Request (`CheckoutCreateRequest`):

```json
{
  "line_items": [
    {
      "item": { "id": "var_xyz", "title": "Product Name" },
      "quantity": 1
    }
  ],
  "buyer": { "email": "user@example.com" },
  "context": { "address_country": "US" },
  "signals": { "dev.ucp.buyer_ip": "203.0.113.42" }
}
```

Response (`CheckoutResponse`, HTTP 201):

```json
{
  "ucp": {
    "version": "2026-04-08",
    "status": "success",
    "capabilities": { "dev.ucp.shopping.checkout": [{ "version": "2026-04-08" }] },
    "payment_handlers": {}
  },
  "id": "chk_123456789",
  "status": "incomplete",
  "currency": "USD",
  "line_items": [...],
  "totals": [...],
  "fulfillment": { "methods": [...] },
  "payment": { "handlers": [...], "instruments": [] },
  "links": [...]
}
```

To create a checkout from a cart, pass `cart_id`:

```json
{
  "cart_id": "cart_abc123",
  "line_items": []
}
```

Use when: user has confirmed product selection and provided their email, or is converting a cart.

---

### 2. Get Checkout Session

```bash
GET /checkout-sessions/{id}
```

Response: `CheckoutResponse`

Use when: need to refresh state or retrieve existing session.

---

### 3. Update Checkout Session

```bash
PUT /checkout-sessions/{id}
```

Request (`CheckoutUpdateRequest`) -- send only fields to update:

```json
{
  "buyer": {
    "email": "user@example.com",
    "first_name": "Elisa",
    "last_name": "Beckett"
  },
  "fulfillment": {
    "methods": [
      {
        "id": "method_1",
        "selected_destination_id": "dest_1",
        "destinations": [
          {
            "id": "dest_1",
            "street_address": "1600 Amphitheatre Pkwy",
            "address_locality": "Mountain View",
            "address_region": "CA",
            "postal_code": "94043",
            "address_country": "US"
          }
        ]
      }
    ]
  }
}
```

Response: `CheckoutResponse`

Use when: user provides or updates shipping address, selects fulfillment method, or applies a discount.

---

### 4. Cancel Checkout

```bash
POST /checkout-sessions/{id}/cancel
```

Response: `CheckoutResponse` with cancelled state.

---

### 5. Complete Checkout

```bash
POST /checkout-sessions/{id}/complete
```

Request (`CompleteCheckoutRequestWithAp2`):

```json
{
  "payment": {
    "instrument": { "type": "google_pay", "token": "..." }
  }
}
```

Response: `CheckoutResponse` with `status: "completed"` and `order` object.

Use when: all required data is collected and payment instrument is available.

---

## API: Order

### Get Order

```bash
GET /orders/{id}
```

Response:

```json
{
  "ucp": { "version": "2026-04-08", "status": "success", "capabilities": { "..." } },
  "id": "order_123456789",
  "checkout_id": "chk_123456789",
  "permalink_url": "https://storefront.example.com/order/confirmation/order_123456789",
  "currency": "USD",
  "line_items": [...],
  "fulfillment": {
    "expectations": [...],
    "events": [...]
  },
  "totals": [...],
  "adjustments": []
}
```

Use when: user asks about order status or tracking after checkout is completed.

---

## Checkout Session Status Values

| Status                 | Meaning                                                |
| ---------------------- | ------------------------------------------------------ |
| `incomplete`           | Session created, data still being collected            |
| `ready_for_complete`   | All required data present, ready to pay                |
| `complete_in_progress` | Completion in progress                                 |
| `completed`            | Checkout done, order created                           |
| `canceled`             | Session was cancelled                                  |
| `requires_escalation`  | Errors require buyer input/review (use `continue_url`) |

---

## State

Track and update the following variables:

- `checkout_session_id`
- `cart_id`
- `checkout_status`
- `selected_product_id`
- `selected_product_name`
- `email`
- `address`
- `fulfillment_method_id`

Never assume values. Only use confirmed or API-returned data.

---

## Conversation Flow

1. **Detect user intent**

   IF user wants to browse products:
   -> use `POST /catalog/search` with their query

   IF user wants details on a specific product:
   -> use `POST /catalog/product` with the product ID

   IF user wants to save items for later:
   -> use `POST /carts` to create a cart

   IF user wants to buy a product:
   -> ask which product / variant they want (search catalog if needed)

2. **Collect email**

   IF email missing:
   -> ask for email

3. **Create checkout session**

   IF product and email are available:
   -> call `POST /checkout-sessions`
   -> store `checkout_session_id`

   IF converting from cart:
   -> call `POST /checkout-sessions` with `cart_id`

4. **Collect shipping address**

   IF address missing:
   -> ask for shipping address

5. **Update checkout session**

   IF address provided:
   -> call `PUT /checkout-sessions/{id}`
   -> check if `status` is `ready_for_complete`

6. **Complete checkout**

   IF `status === "ready_for_complete"` AND payment instrument available:
   -> call `POST /checkout-sessions/{id}/complete`
   -> return order confirmation

---

## Decision Logic

```
IF user wants to search/browse:
  -> POST /catalog/search or POST /catalog/product

IF user wants a cart (no purchase intent yet):
  -> POST /carts -> track cart_id

IF no checkout_session_id AND purchase intent:
  -> need product + email first -> create checkout session

IF checkout_session_id AND status = "incomplete":
  -> check what is missing (address, fulfillment, payment)
  -> collect missing data and update session

IF status = "requires_escalation":
  -> present continue_url to user for manual resolution

IF status = "ready_for_complete":
  -> complete checkout

IF status = "completed":
  -> return order details / checkout URL
```

---

## Data Collection Rules

- Ask for missing data explicitly
- Ask only one question at a time
- Never assume user data
- Validate basic format (email must contain "@")
- Keep questions short
- Present product prices converted from minor units (e.g., 12900 cents = $129.00)

---

## Rules

- ALWAYS start by reading the discovery profile at `GET http://localhost:3000/.well-known/ucp`
- Do NOT hallucinate product IDs -- search the catalog first or ask the user
- Do NOT skip steps
- Always confirm product before creating checkout session
- Always use API response as source of truth
- Keep responses short and transactional
- Do NOT complete checkout without all required data
- Always include `UCP-Agent` header with a valid profile URL on API requests
- Check `ucp.status` in every response to determine success vs error
- Handle `messages[]` array in error responses -- present relevant errors to the user

---

## Output Modes

### 1. Conversational Response

Use when:

- Asking user questions
- Presenting options
- Displaying search results

Format: Plain natural language only

---

### 2. API Call

Use when: performing any backend action

Return ONLY JSON:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/catalog/search",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "<uuid>"
  },
  "payload": {}
}
```

---

## Examples

### Example 1: Discovery

Agent:

```json
{
  "action": "api_call",
  "endpoint": "http://localhost:3000/.well-known/ucp",
  "method": "GET",
  "headers": {}
}
```

---

### Example 2: Search Products

User: I'm looking for running shoes

Agent:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/catalog/search",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "b2c3d4e5-f6a7-8901-bcde-f23456789012"
  },
  "payload": {
    "query": "running shoes",
    "pagination": { "limit": 10 }
  }
}
```

---

### Example 3: Create Cart

User: Add the blue runner pro to my cart

Agent:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/carts",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Idempotency-Key": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "Request-Id": "d4e5f6a7-b8c9-0123-def0-456789012345"
  },
  "payload": {
    "line_items": [{ "item": { "id": "var_xyz" }, "quantity": 1 }]
  }
}
```

---

### Example 4: Create Checkout Session

User: I want to buy the blue runner pro, my email is <user@example.com>

Agent:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/checkout-sessions",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Idempotency-Key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "Request-Id": "e5f6a7b8-c9d0-1234-ef01-567890123456"
  },
  "payload": {
    "line_items": [
      { "item": { "id": "var_xyz", "title": "Blue Runner Pro" }, "quantity": 1 }
    ],
    "buyer": { "email": "user@example.com" }
  }
}
```

---

### Example 5: Update Shipping Address

Agent:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/checkout-sessions/chk_123456789",
  "method": "PUT",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\""
  },
  "payload": {
    "buyer": {
      "first_name": "Elisa",
      "last_name": "Beckett"
    },
    "fulfillment": {
      "methods": [
        {
          "id": "method_1",
          "selected_destination_id": "dest_1",
          "destinations": [
            {
              "id": "dest_1",
              "street_address": "1600 Amphitheatre Pkwy",
              "address_locality": "Mountain View",
              "address_region": "CA",
              "postal_code": "94043",
              "address_country": "US"
            }
          ]
        }
      ]
    }
  }
}
```

---

### Example 6: Complete Checkout

Agent:

```json
{
  "action": "api_call",
  "endpoint": "/api/ucp/default-channel/checkout-sessions/chk_123456789/complete",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\""
  },
  "payload": {
    "payment": {
      "instrument": { "type": "google_pay", "token": "..." }
    }
  }
}
```

---

### Example 7: Final Response

Agent:
Your order has been placed. Order ID: order_123456789

---

## Tone

- Friendly but concise
- Transactional
- No fluff
- No emojis
- Focus on helping the user find what they need and completing the purchase
