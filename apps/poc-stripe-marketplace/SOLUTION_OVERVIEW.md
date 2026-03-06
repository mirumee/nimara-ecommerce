# POC Stripe Marketplace - Solution Overview

## Summary

`poc-stripe-marketplace` is a Next.js-based external Saleor app proving a Stripe marketplace payment flow with explicit Saleor transaction lifecycle updates.

The current implementation focuses on three operational paths:

1. Installation and registration against a single configured Saleor domain.
2. Payment orchestration across multiple orders using a single Stripe PaymentIntent.
3. Refund handling from Saleor synchronous webhook events back to Stripe.

This is intentionally a POC integration: it prioritizes correctness of core flow and signature validation over production-grade observability, persistence model maturity, and broader compatibility concerns.

## Problem And Objective

### Problem

A marketplace checkout may produce multiple orders that still need one customer-facing card payment while keeping Saleor transaction state consistent per order.

### Objective

Provide a working external app that:

- completes checkouts into orders,
- creates one Stripe PaymentIntent for grouped orders,
- reflects authorization and charge state in Saleor transaction records,
- processes Saleor refund requests by creating Stripe refunds,
- verifies webhook authenticity from both Stripe and Saleor.

### Non-goals

- Full production orchestration and reliability guarantees.
- Multi-tenant/domain dynamic routing (current logic is pinned to configured domain).
- Advanced payout/transfer execution beyond tagging metadata for marketplace model.
- Rich monitoring, tracing, and operational dashboards.

## Integration Context

### External systems

- **Saleor GraphQL API**: source of truth for checkout/order/transaction state.
- **Stripe REST API**: PSP for PaymentIntent creation and refunds.
- **AWS Secrets Manager**: storage for installation configuration (`authToken`, app identity metadata) keyed by Saleor domain.

### Internal modules

- `src/lib/saleor/client.ts`: GraphQL operations (`checkoutComplete`, `transactionCreate`, `getOrderTransactions`, `fetchSaleorAppId`).
- `src/lib/stripe/client.ts`: minimal Stripe HTTP client wrapper (`paymentIntents.create`, `refunds.create`).
- `src/lib/saleor/app-config.ts`: config load/save over Secrets Manager.
- `src/lib/saleor/webhook-signature.ts`: Saleor detached JWS verification against remote JWKS.
- `src/lib/stripe/webhook-signature.ts`: Stripe HMAC verification with timestamp tolerance.

## Public API Surface (Current State)

### Active endpoints

- `GET /api/saleor/manifest`
  - Returns Saleor app manifest including permissions, token target URL, app URL, and `TRANSACTION_REFUND_REQUESTED` webhook registration.

- `POST /api/saleor/register`
  - Validates Saleor headers and domain match.
  - Exchanges token context by calling Saleor (`app { id }`) and persists app config in AWS Secrets Manager.

- `POST /api/payments/checkout-complete`
  - Accepts `checkoutIds[]`, runs `checkoutComplete` mutation per checkout, and returns:
    - `completedOrders[]` with amount/currency/order metadata,
    - `failedCheckouts[]` with structured failures.
  - Returns `409` if all requested checkouts fail.

- `POST /api/payments/payment-intents`
  - Accepts `orders[]` (and optional `buyerId`), enforces single currency, creates one Stripe PaymentIntent, and writes initial Saleor `transactionCreate` (`amountAuthorized`) for each order.
  - Returns `clientSecret`, `paymentIntentId`, `transferGroup`, `currency`, total amount in minor units, and source orders.

- `POST /api/payments/stripe/webhooks`
  - Verifies `stripe-signature`, processes only `payment_intent.succeeded`, parses PaymentIntent metadata (`suborders`, `order_amounts`), and writes Saleor charged transactions (`amountCharged`) per order.
  - Includes dedup guard: skips `transactionCreate` when a transaction for same `pspReference` already has charged amount.

- `POST /api/saleor/webhooks/payment/transaction-refund-requested`
  - Verifies Saleor signature and domain headers.
  - Accepts raw event or wrapped `{ event }` payload.
  - Creates Stripe refund for referenced PaymentIntent and maps Stripe refund status into Saleor transaction event result.

- `GET /app`
  - Minimal informational app page.

### Verified README vs implementation drift

`README.md` currently references legacy compatibility aliases (`/api/payments/checkout-complete-payment-intent`, `/api/saleor/checkout-complete-payment-intent`, `/api/stripe/webhooks`) that are not present in current `src/app/api` routes.

## Flow A: Installation

1. Saleor requests `GET /api/saleor/manifest`.
2. Manifest points `tokenTargetUrl` to `POST /api/saleor/register` and declares webhook subscription.
3. Saleor calls `POST /api/saleor/register` with Saleor headers and `auth_token`.
4. Service validates:
   - required headers,
   - header domain equals configured `CONFIG.SALEOR_DOMAIN`,
   - `saleor-api-url` host equals configured domain.
5. Service calls Saleor `app { id }` via token.
6. Service stores config in Secrets Manager under `SECRET_MANAGER_APP_CONFIG_PATH`, keyed by domain.

Result: future payment and webhook operations can load `authToken` and app identity from persisted config.

## Flow B: Payment

### Step 1: Complete checkouts

`POST /api/payments/checkout-complete`

- Input validation:
  - non-empty `checkoutIds[]`,
  - unique IDs.
- Executes Saleor `checkoutComplete` for each ID in parallel (`Promise.allSettled`).
- Produces partial-success response model:
  - successful checkout completion -> entry in `completedOrders[]`,
  - GraphQL/request failures -> entries in `failedCheckouts[]`.
- If no successes, returns `409`.

### Step 2: Create PaymentIntent for orders

`POST /api/payments/payment-intents`

- Input validation:
  - non-empty `orders[]`,
  - unique `orderId` values,
  - positive amounts,
  - 3-letter currency,
  - single-currency guard (`422` on mixed currencies).
- Computes total in minor units using currency-decimal mapping (`getCentsFromAmount`).
- Generates:
  - `transfer_group`: `tg_<timestamp>_<uuid>`,
  - PaymentIntent idempotency key: deterministic SHA-256 hash of canonicalized order list.
- Creates Stripe PaymentIntent with metadata:
  - `suborders`: JSON array of order IDs,
  - `order_amounts`: JSON object `{ orderId: amount }`,
  - `buyer_id`, `marketplace_model`, `env`.
- For each order, creates initial Saleor transaction (`amountAuthorized`, `pspReference=paymentIntent.id`, event message `Waiting for customer action`).
- If any per-order transaction create fails, returns `500` with `failedTransactionCreates[]` and still includes created `paymentIntentId` for diagnostics.

### Step 3: Process Stripe success webhook

`POST /api/payments/stripe/webhooks`

- Verifies `stripe-signature`:
  - HMAC SHA-256 over `<timestamp>.<payload>`,
  - constant-time comparison,
  - 300-second tolerance window.
- Accepts only `payment_intent.succeeded`; other event types return `{ status: "skipped" }`.
- Parses `suborders` and `order_amounts` from metadata; rejects malformed/missing metadata.
- For each order ID:
  - loads existing Saleor transactions,
  - skips if already charged for same `pspReference`,
  - otherwise calls `transactionCreate` with `amountCharged` and event message `Payment successful`.
- If any per-order update fails, returns `500` with failure details.

## Flow C: Refund

`POST /api/saleor/webhooks/payment/transaction-refund-requested`

1. Reads raw payload.
2. Verifies Saleor webhook signature:
   - validates required headers (`saleor-signature`, `saleor-domain`, `saleor-api-url`),
   - enforces configured domain/host,
   - parses detached JWS format (`protected..signature`),
   - fetches JWKS from `https://<saleor-host>/.well-known/jwks.json`,
   - verifies signature using `jose.flattenedVerify`.
3. Validates payload schema (raw event or wrapped `{ event }`).
4. Converts requested amount to Stripe minor units using currency-aware decimal mapping.
5. Calls `stripe.refunds.create` with:
   - `payment_intent = event.transaction.pspReference`,
   - idempotency key `refund-<saleorTransactionId>-<amountMinorUnits>`,
   - metadata containing Saleor transaction ID.
6. Maps Stripe refund status to Saleor result:
   - `succeeded` -> `REFUND_SUCCESS`,
   - `pending` / `requires_action` -> `REFUND_REQUEST`,
   - `failed` / `canceled` -> `REFUND_FAILURE`.

Response returns mapped result, refund reference, normalized amount, optional failure message, and Stripe dashboard link.

## Security And Integrity

### Stripe webhook authenticity

- Enforced by HMAC verification with shared secret (`STRIPE_WEBHOOK_SIGNING_SECRET`).
- Timestamp replay window protection (300 seconds).
- Constant-time comparison prevents timing leak on signature checks.

### Saleor webhook authenticity

- Enforced by detached JWS validation against Saleor JWKS.
- Domain pinning prevents cross-domain webhook spoofing.
- Header schema validation ensures required transport metadata is present.

### Idempotency and duplicate protection

- PaymentIntent creation uses deterministic idempotency key derived from order payload.
- Refund creation uses deterministic idempotency key per transaction+amount.
- Stripe success webhook checks existing charged transaction state before emitting another charge event.

## Error Handling And HTTP Semantics

Common statuses used by routes:

- `400`: malformed body/headers/signature errors.
- `403`: disallowed domain during registration.
- `404`: missing stored app configuration where required.
- `409`: all checkout completion attempts failed.
- `422`: semantically invalid payload (for example mixed currency, invalid refund event schema).
- `500`: upstream failures, malformed required metadata, or partial per-order transaction update failures.

The design favors explicit per-item failure reporting in batch operations (`failedCheckouts`, `failedTransactionCreates`, webhook `failed[]`) instead of collapsing all errors into one generic message.

## Technical Decisions And Tradeoffs

1. **Batch-friendly orchestration via `Promise.allSettled`**
   - Pros: supports partial success and complete error visibility.
   - Tradeoff: consumer must handle mixed outcomes.

2. **Minimal custom Stripe client over direct REST calls**
   - Pros: small footprint, explicit payload control.
   - Tradeoff: less feature coverage than official SDK.

3. **Secret-based config store keyed by domain**
   - Pros: simple bootstrap and low operational overhead for POC.
   - Tradeoff: no richer querying/versioning/concurrency safeguards.

4. **Strict domain pinning (`CONFIG.SALEOR_DOMAIN`)**
   - Pros: reduces trust boundary and accidental cross-tenant use.
   - Tradeoff: single-domain runtime model.

5. **POC-level failure policy**
   - Pros: fails loudly on uncertain state.
   - Tradeoff: some recoverable scenarios still return `500` without compensation workflow.

## POC Risks And Limitations

1. **Documentation drift risk**
   - `README.md` lists route aliases that are not currently implemented.

2. **Limited observability**
   - No correlation IDs, structured event taxonomy, or metrics for webhook lag/retry/error-rate.

3. **Coarse persistence model**
   - Single secret JSON map for app configs can become operationally brittle with scale/concurrency.

4. **Partial-failure handling is caller-dependent**
   - Batch flows expose failed subsets but do not provide internal retry/compensation orchestration.

5. **Strict single-currency per PaymentIntent aggregation**
   - Correct by Stripe constraints, but requires upstream batching discipline and explicit currency partitioning.

6. **Runtime dependency on external JWKS availability**
   - Saleor signature verification requires live JWKS fetch path; outages impact webhook processing.

## Recommended Next Steps

1. **Align route documentation with runtime reality**
   - Remove or restore legacy aliases to eliminate operator confusion.

2. **Improve observability baseline**
   - Add structured logs with correlation IDs (`checkoutId`, `orderId`, `paymentIntentId`, webhook event IDs).
   - Add metrics for route latency, webhook verify failures, upstream error classes.

3. **Harden reliability around partial failures**
   - Introduce retry strategy and/or compensating job for per-order transaction update failures.

4. **Evolve configuration storage for production readiness**
   - Consider dedicated persistence model with explicit versioning and update conflict handling.

5. **Expand contract tests to protect integration behavior**
   - Add tests for malformed metadata edge cases, replay-like webhook scenarios, and multi-currency upstream partitioning behavior.

## Validation Checklist For This Document

- All documented endpoints exist in `src/app/api` and behavior is derived from route handlers/tests.
- Payment flow includes all three steps and matches webhook processing logic.
- Security section covers both Stripe HMAC and Saleor JWS/JWKS validation.
- Refund status mapping matches implemented mapping function.
- Risk section contains concrete, code-backed limitations.

