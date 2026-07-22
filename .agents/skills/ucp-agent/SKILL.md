---
name: ucp-agent
description: Operate Nimara's UCP REST commerce API. Use when an agent must discover UCP capabilities, search or look up products, manage a cart, create or update a checkout, complete or cancel a checkout, or retrieve an order through the storefront's UCP endpoints. Do not use for ordinary storefront UI work or commerce flows that do not use UCP.
---

# UCP Commerce Agent

Use Nimara's storefront UCP API to guide a buyer from product discovery through cart, checkout, and order retrieval. Treat the discovery profile and API responses as the source of truth; do not infer protocol details from this skill when the live profile provides them.

## Core workflow

1. Fetch `GET /.well-known/ucp` from the target storefront before any UCP operation.
2. Read the REST service `endpoint`, protocol version, supported capabilities, schemas, specifications, and payment handlers from that profile.
3. Confirm the requested capability is advertised before using it.
4. Follow the relevant flow in [flows.md](references/flows.md), collecting only missing buyer data.
5. Build the request from the discovered schema and [protocol-schemas.md](references/protocol-schemas.md).
6. Call the operation listed in [endpoints.md](references/endpoints.md).
7. Inspect `ucp.status`, resource status, and `messages[]` before choosing the next action.
8. Update tracked state only from confirmed user input or API responses.

## Non-negotiable rules

- Never invent product, variant, cart, checkout, order, fulfillment, or payment identifiers.
- Confirm the selected product and quantity before creating a checkout.
- Do not complete checkout until the buyer has explicitly confirmed purchase intent, the session is ready, and a valid payment instrument is available.
- Never expose payment tokens, authorization credentials, or buyer secrets in prose or logs.
- Include a valid `UCP-Agent` profile on every commerce request. Use HTTPS profiles outside local development.
- Generate a new request ID for each request and a stable idempotency key only where the endpoint supports retry deduplication.
- Treat `requires_buyer_input` and `requires_buyer_review` as handoff conditions. Present the returned `continue_url`; do not bypass the required buyer action.
- Treat business errors as response data. Read `messages[]` even when the HTTP request succeeds.
- Keep buyer-facing responses concise, transactional, and free of internal protocol details unless the user asks for them.

## State to track

Track only values needed by the active flow:

- selected product and variant identifiers, title, quantity, and displayed price
- cart identifier
- checkout session identifier and status
- confirmed buyer contact and fulfillment data
- selected fulfillment method
- order identifier

Do not reuse state across buyers or storefronts.

## Response modes

Use natural language when asking for missing data, presenting products, confirming choices, reporting errors, or returning order details.

When the surrounding system expects a structured API instruction rather than executing the request directly, return one JSON object with `action`, `endpoint`, `method`, `headers`, and `payload`. See [examples.md](references/examples.md) for the format. Do not wrap that object in commentary.

## Reference router

- Read [protocol-schemas.md](references/protocol-schemas.md) for capability names, request and response shapes, status values, severities, money representation, and schema-source rules.
- Read [endpoints.md](references/endpoints.md) for discovery, headers, supported REST operations, implementation locations, and current Nimara limitations.
- Read [flows.md](references/flows.md) before running catalog, cart, checkout, cancellation, completion, escalation, or order workflows.
- Read [examples.md](references/examples.md) only when constructing a concrete request or structured API instruction.

For fields not documented here, follow the `spec` and `schema` URLs advertised by the discovered capability. Verify behavior against the route handlers under `apps/storefront/src/app/api/ucp/` when changing or debugging Nimara's implementation.
