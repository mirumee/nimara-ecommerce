---
type: "Architecture Decision Record"
title: "Marketplace Checkouts Pay As One Group Through The Payment Application"
description: "A marketplace buyer pays every vendor checkout with one provider payment that the installable payment application creates only after every checkout has registered its transaction."
tags:
  - "adr"
  - "payments"
  - "stripe"
  - "marketplace"
  - "saleor-app"
created: "2026-10-09T00:00:00+00:00"
status: "accepted"
owner: "engineering"
superseded_by: null
---

## Context

A marketplace buyer's cart becomes one Saleor checkout per vendor, and the buyer pays once for all
of them. Before this decision the marketplace application owned that payment: it called Stripe
through its own client with one deployment-wide key, created the Saleor transactions itself,
trusted caller-supplied amounts, and completed the checkouts from its own webhook. That duplicated
the installable [Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md),
ignored its per-channel configuration, and gave refunds a second owner.

Saleor has no transaction that spans checkouts, so every vendor checkout needs its own transaction
even when one provider payment funds all of them. The provider payment must therefore record how it
divides between those transactions, and nothing may be paid before every checkout has a transaction
to receive its share.

Stripe constrains how that gate can be built:

- `confirmation_method: manual`, the documented way to keep confirmation on the server, is
  rejected together with automatic payment methods. Using it means listing payment methods by
  hand.
- Confirming on the server with a confirmation token works with automatic payment methods, but
  only when the payment form renders before the PaymentIntent exists, and some methods, BLIK among
  them, do not support that mode.
- Anyone who holds a PaymentIntent's client secret can confirm it, and no setting withdraws that
  while automatic payment methods are on.

## Decision

We will pay a group of marketplace checkouts through the payment application and Saleor's native
transaction API, with one provider payment for the whole group:

- Every checkout except one, the followers, initializes a transaction first. The payment
  application answers that it awaits action and creates no provider payment.
- The remaining checkout, the leader, initializes last and names every follower transaction. The
  payment application verifies the group against Saleor and only then creates one PaymentIntent
  for the sum of the shares, listing each share in its metadata. Ordering is the gate: before the
  leader runs, there is nothing to pay.
- The storefront mounts the payment form with the leader's client secret and confirms on the
  client, so every payment method enabled for the account works without a hand-written list.
- The payment application reports every provider event to each transaction with that share's
  amount.
- Groups support the charge flow only. Authorization is out of scope because one PaymentIntent
  can be captured once while Saleor requests a capture per transaction.
- The storefront uses the group path when a payment application is configured, and the
  marketplace payment routes otherwise. There is no separate switch in the payment application;
  every allowed commerce domain can start a group.

The provider-neutral contract a payment application implements is
[Marketplace Payment Group Contract](../../product/integrations/INT-0008%20Marketplace%20Payment%20Group%20Contract.md).

## Consequences

- One payment application owns marketplace payments, with per-channel provider configuration and
  the same transaction, webhook, and refund handling as single-checkout payments.
- Amounts come from Saleor, not from the caller, and a group is refused when a checkout total,
  channel, currency, customer, or transaction does not match.
- Every payment method enabled for the provider account works, including redirect methods and
  asynchronous debits.
- A buyer who holds the client secret can still confirm after a checkout changes in another tab.
  The checkout then stays partly paid and is not completed.
- A new group attempt does not cancel the previous group PaymentIntent, so two open payment forms
  confirmed at the same time can overcharge.
- Saved payment methods are not offered in a group, because the leader creates the PaymentIntent
  without a gateway customer.
- Another payment application can serve the marketplace only by implementing the group contract.
- The marketplace payment routes and their Stripe client remain until their removal is decided.

## Related Notes

- [ADR MOC](ADR%20MOC.md)
- [Marketplace Payment Group Contract](../../product/integrations/INT-0008%20Marketplace%20Payment%20Group%20Contract.md)
- [Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)
- [Marketplace Checkout Payment Orchestration](../../product/integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)
- [Marketplace Checkout to Vendor Orders](../../product/flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md)
