---
type: "Integration Contract"
title: "Marketplace Payment Group Contract"
description: "Provider-neutral contract a Saleor payment application implements so that one provider payment funds every vendor checkout of a marketplace order."
tags:
  - "integration"
  - "payments"
  - "marketplace"
  - "saleor-app"
created: "2026-10-09T00:00:00+00:00"
status: "candidate"
owner: "engineering"
availability:
  since: null
  deprecated_since: null
---

# Purpose

A marketplace order is one Saleor checkout per vendor, paid with one provider payment. Saleor has
no transaction that spans checkouts, so each checkout keeps its own transaction and the payment
application divides one provider payment between them. This record states what any payment
application must do to take part. The
[Stripe Payment Application](INT-0005%20Stripe%20Payment%20Application.md) is the current
implementation; the decision behind the design is
[ADR-0004](../../tech/ADR/ADR-0004%20Marketplace%20Checkouts%20Pay%20As%20One%20Group%20Through%20The%20Payment%20Application.md).

A group has one leader checkout and one or more follower checkouts. A single checkout is not a
group and uses a plain payment session.

# Authentication and permissions

- The application needs only `HANDLE_PAYMENTS` for the group: it reads each checkout, its total,
  channel, customer, charge and authorization status, and its transactions.
- The group request arrives through Saleor's public `transactionInitialize` mutation, so the
  caller is untrusted. Every claim in the request is verified against Saleor before any provider
  payment exists.
- The application must not let caller metadata set any key it uses to route or divide events.

# Events and operations

1. **Request.** The storefront sends `data.paymentGroup` with `transactionInitialize`:
   `{ "role": "follower" }` for each follower, then
   `{ "role": "leader", "followers": [{ "checkoutId", "transactionId" }] }` for the leader. The
   leader request comes only after every follower request has returned a transaction.
2. **Follower.** The application requires a charge action and an amount equal to the checkout
   total, compared in the currency's minor units. It creates no provider payment and answers
   `CHARGE_ACTION_REQUIRED` with that amount and no provider reference. Saleor accepts that event
   without a reference.
3. **Leader verification.** Before creating anything the application reads every group checkout
   from Saleor and refuses the group as `CHARGE_FAILURE` unless:
   - no checkout is listed twice and the follower count is within the application's limit;
   - the leader's amount equals its checkout total;
   - every checkout shares the leader's channel, currency, customer, and e-mail;
   - no checkout is already charged or authorized;
   - each follower transaction belongs to its checkout, was created by this application, has no
     provider reference and no charge, and awaits exactly the checkout's current total.
4. **Provider payment.** The application creates one payment for the sum of the shares with
   automatic capture, and records every share as transaction ID plus amount in minor units on the
   provider payment, where only the server can write. For a signed-in buyer the payment carries
   the buyer's gateway customer, and it is set up for future use when the buyer asks to save a new
   method; a guest's save request is dropped. The provider idempotency key derives from the
   shares, the customer, and the save choice. The leader is answered with its own share as the
   amount, the provider reference, and whatever the storefront needs to confirm. A saved method
   sent with the leader request is ignored.
5. **Confirmation.** The storefront confirms the provider payment on the client, with a new method
   from the payment form or with one of the buyer's saved methods named at confirmation. The
   provider refuses a saved method that belongs to another customer. Nothing is payable before
   step 4, which is what keeps a payment from landing before every checkout has a transaction.
6. **Events.** For each provider event about the group payment the application reports to every
   share's transaction with that share's amount and the shared provider reference, never the
   payment total. Success maps to `CHARGE_SUCCESS`, pending to `CHARGE_REQUEST`, failure to
   `CHARGE_FAILURE`, and cancellation to `CANCEL_SUCCESS`; action-required events are not
   reported per share. A follower receives its provider reference from the first success or
   pending event, because Saleor fills an empty reference then. Only a charged share offers a
   refund action; no share offers cancel, so one vendor's transaction cannot cancel the whole
   payment.
7. **Process.** `transactionProcess` never changes a group payment from caller data. It answers
   each transaction with its own share and the payment's state, and a transaction outside the
   shares, or without a provider reference, stays `ACTION_REQUIRED`.
8. **Completion.** The storefront waits until every checkout is fully charged and then completes
   each one into an order.

# Failure handling and idempotency

- The storefront sends a Saleor idempotency key with each initialization: for a follower derived
  from the checkout and amount, for the leader also from the follower transactions and the save
  choice. Saleor then reuses the same transaction and calls the application again, and the
  provider idempotency key returns the same payment, so reloading the payment step creates nothing
  new. Changing the save choice opens a different payment; changing it back returns the first one.
- Paying with a saved method confirms the payment the payment step already opened, so a retry
  after a decline uses the same payment and transactions.
- A group event whose shares are malformed, or do not add up to the event amount, reports nothing
  and is acknowledged, because a redelivery cannot correct it. It is logged as an error.
- Shares are reported independently. A share Saleor refuses is logged and the others are still
  reported. Only a share that cannot reach Saleor fails the response so the provider redelivers;
  Saleor deduplicates the shares that already landed by transaction, provider reference, and event
  type.
- A failed payment leaves every share with a failure event. A retry on the same provider payment
  succeeds and reports success to the same transactions.

# Limitations

- Charge only. Authorization would need one capture per vendor transaction on a payment that can
  be captured once.
- A checkout changed after the provider payment exists is still payable at the old amount; it then
  stays partly paid and is not completed.
- A new group attempt does not cancel the previous group payment.
- The Saleor leader key does not include the gateway customer. When resolving the customer fails
  once and succeeds on a reload, the same leader transaction receives a second provider payment.
- An asynchronous payment that fails after it was pending leaves every follower transaction with
  a provider reference, so a new group over those transactions is refused as already used.
- Refunds, cancellation, and chargebacks of a shared payment have no group-specific handling yet.
- Provider metadata limits bound the group size; the Stripe implementation allows up to 20
  followers.
