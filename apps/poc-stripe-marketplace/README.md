# POC Stripe Marketplace Saleor App

REST-only Saleor external app used for installation flow experiments.

## Endpoints

- `GET /api/saleor/manifest` - Saleor installation manifest
- `POST /api/saleor/register` - Saleor token exchange + app registration persistence
- `POST /api/payments/checkout-complete` - best-effort checkout completion for a list of checkout IDs
- `POST /api/payments/payment-intents` - create Stripe PaymentIntent and initial `transactionCreate` for provided orders
- `POST /api/payments/stripe/webhooks` - Stripe webhook endpoint (`payment_intent.succeeded`)
- `POST /api/saleor/webhooks/payment/transaction-refund-requested` - Saleor sync webhook endpoint (`TRANSACTION_REFUND_REQUESTED`)
- `GET /app` - minimal informational app page

Compatibility aliases (legacy):
- `POST /api/payments/checkout-complete-payment-intent` (deprecated all-in-one flow)
- `POST /api/saleor/checkout-complete-payment-intent` (deprecated alias to old path)
- `POST /api/stripe/webhooks`

## Required env vars

- `NEXT_PUBLIC_ENVIRONMENT`
- `NEXT_PUBLIC_SALEOR_API_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional)
- `AWS_REGION`
- `AWS_ENDPOINT_URL` (optional)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `SECRET_MANAGER_APP_CONFIG_PATH` (optional, default: `/poc-stripe-marketplace/app-config`)

## Payments flow (3-step)

1. `POST /api/payments/checkout-complete`
2. `POST /api/payments/payment-intents`
3. Stripe sends `payment_intent.succeeded` to `POST /api/payments/stripe/webhooks`

## Checkout complete

### Request

`POST /api/payments/checkout-complete`

Headers:
- `Content-Type: application/json`

Body:

```json
{
  "checkoutIds": ["Q2hlY2tvdXQ6MQ==", "Q2hlY2tvdXQ6Mg=="]
}
```

### Success response (200)

```json
{
  "completedOrders": [
    {
      "sourceCheckoutId": "Q2hlY2tvdXQ6MQ==",
      "orderId": "T3JkZXI6MQ==",
      "orderNumber": "1001",
      "amount": 30,
      "currency": "USD"
    }
  ],
  "failedCheckouts": []
}
```

## Payment intent create

### Request

`POST /api/payments/payment-intents`

Headers:
- `Content-Type: application/json`

Body:

```json
{
  "buyerId": "buyer_123",
  "orders": [
    { "orderId": "T3JkZXI6MQ==", "amount": 30, "currency": "USD" },
    { "orderId": "T3JkZXI6Mg==", "amount": 20, "currency": "USD" }
  ]
}
```

### Success response (200)

```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_...",
  "transferGroup": "tg_...",
  "currency": "usd",
  "amount": 5000,
  "orders": [
    { "orderId": "T3JkZXI6MQ==", "amount": 30, "currency": "USD" },
    { "orderId": "T3JkZXI6Mg==", "amount": 20, "currency": "USD" }
  ]
}
```

Agregat checkoutów jest identyfikowany przez:
- `transferGroup` (unikalne ID agregatu),
- `metadata.suborders` w Stripe PaymentIntent (lista order IDs),
- `metadata.order_amounts` w Stripe PaymentIntent (mapa `{orderId: amount}`).

### Stripe webhook

`POST /api/payments/stripe/webhooks`

Endpoint przyjmuje eventy Stripe i obsługuje `payment_intent.succeeded`:
- waliduje podpis z headera `stripe-signature` przez `STRIPE_WEBHOOK_SIGNING_SECRET`,
- czyta `metadata.suborders` + `metadata.order_amounts`,
- tworzy `transactionCreate` (`amountCharged`) dla każdego ordera.

### Saleor refund webhook

`POST /api/saleor/webhooks/payment/transaction-refund-requested`

Endpoint obsługuje webhook Saleora `TRANSACTION_REFUND_REQUESTED`:
- wymaga nagłówków `saleor-signature`, `saleor-domain`, `saleor-api-url`,
- weryfikuje podpis JWS przez JWKS (`/.well-known/jwks.json`),
- wykonuje `Stripe refunds.create` dla `event.transaction.pspReference`,
- mapuje status refundu Stripe:
  - `succeeded` => `REFUND_SUCCESS`,
  - `pending`/`requires_action` => `REFUND_REQUEST`,
  - `failed`/`canceled` => `REFUND_FAILURE`,
- zwraca payload eventu transakcyjnego do Saleora.

### Error statuses

- `400` invalid body
- `404` missing app config for domain (app not registered)
- `409` all checkoutComplete calls failed
- `422` successful checkouts have mixed currencies
- `500` Stripe/Saleor/infrastructure errors

## Development

```bash
pnpm --filter poc-stripe-marketplace dev
```

## Installation in Saleor

When app runs on `https://YOUR-APP-DOMAIN`, install with:

`https://YOUR-SALEOR-DOMAIN/dashboard/apps/install?manifestUrl=https://YOUR-APP-DOMAIN/api/saleor/manifest`
