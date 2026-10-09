---
id: marketplace-payment-apps
title: Marketplace Payment Apps
---

# Payment Apps for Marketplace Checkout

In marketplace mode the storefront keeps one Saleor checkout per vendor, and the buyer pays for all
of them at once. Nimara does this with a **payment group**: one provider payment funds every vendor
checkout, and each checkout keeps its own Saleor transaction.

This page explains how the flow works and what a Saleor payment app must implement to support it.
The Nimara Stripe App is the reference implementation.

## How the flow works

1. The buyer reaches the payment step with checkouts for vendors A, B, and C.
2. The storefront picks the first checkout as the **leader**. The others are **followers**.
3. Each follower calls `transactionInitialize` in parallel with
   `data.paymentGroup = { role: "follower" }`. The payment app creates no provider payment and
   answers `CHARGE_ACTION_REQUIRED` for the checkout total.
4. The leader calls `transactionInitialize` with
   `data.paymentGroup = { role: "leader", followers: [{ checkoutId, transactionId }] }`. The
   payment app checks every checkout in Saleor, creates **one** provider payment for the sum, and
   records each checkout's share on it.
5. The storefront shows the provider's payment form with the leader's session and the buyer pays.
6. The provider notifies the payment app. The payment app reports the result to every transaction,
   each with its own share.
7. When every checkout is fully charged, the storefront turns each one into an order. The buyer
   gets one order per vendor.

The provider payment exists only after every checkout has a transaction, so the buyer cannot pay
too early.

## Configure a store

1. Install the payment app on the Saleor instance and configure it for the marketplace channel.
2. In the marketplace channel settings, set the transaction flow strategy to **Charge**. Payment
   groups do not support authorization.
3. Keep **Turn fully paid checkouts into orders automatically** off. The storefront completes the
   checkouts itself.
4. Set `NEXT_PUBLIC_MARKETPLACE_ENABLED=true` and `NEXT_PUBLIC_PAYMENT_APP_ID=<payment app ID>` in
   the storefront environment, then rebuild it. Without a payment app ID the storefront uses the
   legacy marketplace payment routes.

## Implement the contract in a payment app

A payment app supports marketplace checkout when it does all of the following.

### Follower initialization

- Read `data.paymentGroup.role === "follower"` from `TRANSACTION_INITIALIZE_SESSION`.
- Refuse with `CHARGE_FAILURE` when the action is not a charge or the amount is not the checkout
  total. Compare amounts in the currency's minor units.
- Create nothing at the provider. Answer `CHARGE_ACTION_REQUIRED` with the checkout total and no
  `pspReference`.

### Leader initialization

- Read the follower list from `data.paymentGroup`. Treat it as untrusted.
- Query every checkout, including the leader's, with `checkout(id)`. `HANDLE_PAYMENTS` is enough.
- Refuse with `CHARGE_FAILURE` unless all of these are true:
  - no checkout appears twice, and the group is within your provider's size limit;
  - the leader's amount equals its checkout total;
  - all checkouts share the channel, currency, customer, and e-mail;
  - no checkout is already charged or authorized;
  - each follower transaction is on its checkout, was created by your app, has no
    `pspReference` and no charged amount, and its `CHARGE_ACTION_REQUIRED` amount equals the
    current checkout total.
- Create one provider payment for the sum of the shares, with automatic capture.
- Store every share (transaction ID and amount) on the provider payment, somewhere only your
  server can write.
- For a signed-in buyer, attach the buyer's gateway customer, and set the payment up for future
  use when the request asks to save a new method. Drop the save request of a guest.
- Ignore a saved payment method sent with the leader request. The storefront names it when it
  confirms, and the provider must refuse a method of another customer.
- Derive the provider's idempotency key from the shares, the customer, and the save choice.
- Answer with the **leader's share** as the amount, never the payment total, plus the provider
  reference and the client data the storefront needs.

### Provider events

- Recognize a group payment from the data stored on it.
- Check that the shares add up to the event amount. If they do not, report nothing, log an
  error, and acknowledge the event.
- Report to every share's transaction with `transactionEventReport`, using the share's amount and
  the shared provider reference:

  | Provider state | Saleor event     | Available actions |
  | -------------- | ---------------- | ----------------- |
  | succeeded      | `CHARGE_SUCCESS` | `REFUND`          |
  | processing     | `CHARGE_REQUEST` | none              |
  | failed         | `CHARGE_FAILURE` | none              |
  | canceled       | `CANCEL_SUCCESS` | none              |

- Do not report action-required events per share.
- Answer with an error only when a share could not reach Saleor, so the provider retries. Saleor
  deduplicates the shares that already landed.

### Saved payment methods

- Signed-in buyers see their saved methods and a save checkbox, as in standard checkout.
- The group payment is opened once on the payment step. Paying with a saved method confirms that
  payment with the method's ID, so a retry after a decline uses the same payment.
- Changing the save checkbox opens a different payment; changing it back returns the first one.

### Process session

- Never update a group payment from `transactionProcess` caller data.
- Answer each transaction with its own share. A transaction without a provider reference, or
  outside the shares, stays `ACTION_REQUIRED`.

### Metadata safety

- Ignore caller metadata keys that you use to route events or to store shares.

## Acceptance tests

Run these against a real Saleor instance and the provider's test mode before you enable the app
for a marketplace channel. Use a different customer name per run so the orders are easy to find.

| Test | Scenario                                     | Expected result                                                           |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------- |
| 1    | Two vendors, plain card                      | One provider payment, two orders, both fully paid                         |
| 2    | Card with 3-D Secure                         | Payment succeeds after the challenge, no second confirmation              |
| 3    | Three vendors                                | One payment, the sum of three shares, three orders                        |
| 4    | Redirect payment method                      | Payment succeeds after the redirect                                       |
| 5    | Production build of the storefront           | The buyer lands on the order confirmation and the cart is empty           |
| 6    | Development build                            | The confirmation runs once and the buyer lands on the order confirmation  |
| 7    | Declined card, then a valid card             | Failure on every share, then success on the same payment and transactions |
| 8    | Reload the payment step several times        | No new provider payment and no new transactions                           |
| 9    | Asynchronous method, such as a direct debit  | Pending on every share, then success, then orders                         |
| 10   | Signed-in buyer, new card, save checked      | Payment succeeds and the card is saved for the buyer                      |
| 11   | Signed-in buyer, saved card                  | Payment succeeds without the payment form                                 |
| 12   | Guest                                        | No saved methods and no save checkbox; payment works                      |
| 13   | Toggle the save checkbox off and on          | A second payment, then the first one again                                |
| 14   | Declined saved card, then another saved card | Success on the same payment                                               |
| 15   | Saved method of another customer             | The provider refuses the confirmation                                     |

## Limitations

- Charge only.
- A checkout changed after the provider payment exists can still be paid at the old amount.
- A new attempt does not cancel the previous group payment.
- Refunds and cancellations of a shared payment have no group-specific handling yet.
