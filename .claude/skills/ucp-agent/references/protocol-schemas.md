# Protocol schemas

Use this reference to interpret Nimara UCP payloads. Prefer the live discovery profile's `spec` and `schema` links for the complete contract.

## Capability registry

Nimara advertises these root capabilities:

| Capability                        | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `dev.ucp.shopping.catalog.search` | Search the product catalog                 |
| `dev.ucp.shopping.catalog.lookup` | Look up products or variants by identifier |
| `dev.ucp.shopping.cart`           | Manage a pre-checkout cart                 |
| `dev.ucp.shopping.checkout`       | Manage checkout sessions                   |
| `dev.ucp.shopping.order`          | Retrieve completed orders                  |

It also advertises discount, buyer-consent, and fulfillment extensions to checkout. Use extensions only when both the extension and its checkout parent are present in the negotiated capabilities.

## Schema source of truth

1. Fetch `/.well-known/ucp`.
2. Select the advertised REST shopping service.
3. Use the service `schema` for the transport contract.
4. Use each capability's `schema` and `spec` for its payload contract.
5. Use `apps/storefront/src/features/ucp/capabilities.ts` and the relevant route handler only when implementing or debugging the repository.

Do not hardcode a protocol version. Echo the negotiated version in UCP metadata where a request schema requires it.

## Common request shapes

### Catalog search

- Provide at least one of `query` or `filters`.
- Use `context` only for provisional localization or relevance hints.
- Use `pagination` to bound result size.

### Catalog lookup and product detail

- Send known product or variant identifiers in `ids` for batch lookup.
- Send one known identifier in `id` for product detail.
- Never derive or fabricate identifiers from product names.

### Cart

- Create with `line_items`; each item needs an identifier and quantity.
- Treat update as full replacement and send the complete intended cart state.
- Use API-returned line item identifiers when updating an existing cart.

### Checkout

- Create with confirmed `line_items` or a `cart_id` supported by the negotiated capabilities.
- Update only fields accepted by the discovered checkout schema.
- Complete only with the required payment instrument and after the resource reports readiness.

## Response envelope

Inspect the `ucp` object on every commerce response:

```json
{
  "ucp": {
    "version": "<negotiated-version>",
    "status": "success",
    "capabilities": {}
  }
}
```

- `ucp.status` is the primary success/error discriminator when present.
- `ucp.capabilities` contains the capabilities relevant to the operation.
- Checkout responses can include `payment_handlers`.
- Business outcomes can arrive with a successful HTTP status and a populated `messages[]` array.

## Checkout statuses

| Status                 | Action                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| `incomplete`           | Collect or correct missing data, then update the session                     |
| `ready_for_complete`   | Ask for final confirmation and complete only with a valid payment instrument |
| `complete_in_progress` | Poll or retrieve the session; do not submit another completion blindly       |
| `completed`            | Return order confirmation or retrieve the order                              |
| `canceled`             | Stop using the session                                                       |
| `requires_escalation`  | Hand off through `continue_url`                                              |

## Message severities

| Severity                | Action                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| `recoverable`           | Correct inputs and retry when safe                               |
| `requires_buyer_input`  | Ask for the required buyer input or use the provided handoff URL |
| `requires_buyer_review` | Require buyer review through the provided handoff URL            |
| `unrecoverable`         | Stop using the resource and explain the outcome                  |

Surface the message's `content` concisely. Preserve its `code` for diagnostics, but do not expose irrelevant internals to the buyer.

## Money and buyer data

- Monetary amounts use ISO 4217 minor units; format them using the accompanying currency.
- Never assume buyer identity, email, address, fulfillment selection, or consent.
- Validate only enough to avoid obviously malformed requests; the API remains authoritative.
