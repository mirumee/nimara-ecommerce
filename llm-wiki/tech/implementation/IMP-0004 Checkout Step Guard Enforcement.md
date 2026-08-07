---
type: "Implementation Record"
title: "Checkout Step Guard Enforcement"
description: "Enforces checkout step selection against checkout completeness on every request, so a step reached directly by URL can no longer skip the ones before it or open a gateway transaction the checkout cannot complete."
tags:
  - "implementation"
  - "storefront"
  - "checkout"
  - "payments"
created: "2026-08-07T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "757"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/757"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Guided Storefront Checkout](../../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/757"
verification:
  - criterion: "A step requested directly by URL whose earlier steps are unanswered redirects to the first incomplete step, matching what the Continue-driven flow enforces."
    tests:
      - "apps/storefront/src/foundation/checkout/steps.test.ts"
      - "apps/automated-tests/tests/e2e/checkout/checkout-step-guard.spec.ts"
  - criterion: "The payment section does not render on a checkout that cannot be ordered, so no gateway transaction is opened for it."
    tests:
      - "apps/automated-tests/tests/e2e/checkout/checkout-step-guard.spec.ts"
  - criterion: "An unknown step query value falls back to the first incomplete step instead of rendering a page with no section open."
    tests:
      - "apps/storefront/src/foundation/checkout/steps.test.ts"
      - "apps/automated-tests/tests/e2e/checkout/checkout-step-guard.spec.ts"
  - criterion: "On a checkout that requires no shipping, the shipping and delivery steps are unreachable and payment opens once the email is known."
    tests:
      - "apps/storefront/src/foundation/checkout/steps.test.ts"
      - "apps/automated-tests/tests/e2e/checkout/checkout-step-guard.spec.ts"
  - criterion: "An already-answered step stays reachable, so a shopper can go back and correct an earlier answer."
    tests:
      - "apps/storefront/src/foundation/checkout/steps.test.ts"
      - "apps/automated-tests/tests/e2e/checkout/checkout-step-guard.spec.ts"
rollout: "No action is required for a deployment. The change alters which step the checkout route serves for a given URL and adds no setting, migration, or stored state. A shopper mid-checkout on a link to a step they have not reached is redirected to the first incomplete step on their next request rather than being served that step."
rollback: "Restore the previous deployment. Nothing is persisted by this change, so a release predating it serves the same checkouts with the pre-existing behavior, in which a step reached by URL is trusted. Reverting reinstates the defect described in NIM-51, including the gateway transactions opened for checkouts that cannot be ordered."
---

# Implementation summary

The checkout route resolved its step by trusting the `step` query value and ran its completeness
chain only when that value was absent. A URL naming a later step therefore skipped every step before
it. Rendering the payment section is not passive: its element opens a gateway transaction on mount,
so a checkout with no shipping address and no delivery method produced a live PaymentIntent that
could never be charged, while client-side billing validation was what actually blocked the order.

The step chain moved out of the route into `getFirstIncompleteCheckoutStep`, joined by
`isCheckoutStepReachable`, which compares the requested step against the first incomplete one on an
explicit walk order. The route now resolves the query value through `resolveCheckoutStep` and
redirects whenever the value is unknown or names a step the checkout has not reached. Because the
redirect happens before the payment section data is fetched and before the sections mount, no
gateway transaction is opened for a checkout that cannot be ordered.

Reachability is deliberately not "the first incomplete step only". Every answered step stays
reachable so a shopper can go back and correct an earlier answer, which is the behavior the section
headers already offered as links. A checkout that requires no shipping is the one case where a rank
comparison alone is wrong: payment is its first incomplete step, so the shipping steps would rank as
reachable while the sections that render them are conditioned out. They are rejected explicitly.

`resolveCheckoutStep` already existed, unused, and was wrong: it looked values up by map key, so
`resolveCheckoutStep("payment")` returned `null` and only the uppercase key resolved. It now matches
against the step values.

# Deviations

- No PRD, RFC, or ADR precedes this work. It restores behavior CAP-0003 already documented rather
  than deciding anything new, so no decision record was filed.
- The guard reads the marketplace checkout summary rather than each vendor checkout. That summary
  derives email, shipping address, and delivery method with the same all-checkouts-answered rule the
  section component applies, so the two agree; the record notes it because a future divergence
  between them would produce a redirect loop rather than a visible error.
- The ticket's second reported concern, orphaned PaymentIntents, is only narrowed, not closed. This
  change stops intents being opened for checkouts that cannot be ordered. A complete checkout still
  opens a fresh intent on every mount and remount of the payment element, which is untouched here.
- The ticket records an unconfirmed variant in which the payment step rendered for an empty
  zero-value checkout. That path was already guarded: both the standard and marketplace checkout
  loaders redirect to the cart when no line remains. No change was made for it.
- `digitalProduct` in the end-to-end constants carries a URL slug only. Price and quantity were left
  out rather than guessed, because no test asserts an order summary for it yet.

# Verification evidence

The guard's decision function is covered by 22 unit cases in `steps.test.ts`, spanning each stage of
completeness, the unknown and empty step values, the answered-step allowance, and the checkout that
requires no shipping. The storefront suite is 47 passing across 5 files at the anchored commit, with
`tsc --noEmit` and lint clean in both the storefront and the end-to-end workspace.

Nine end-to-end tests in `checkout-step-guard.spec.ts` cover the same behavior through the browser
for a guest shopper, a logged-in shopper, and a checkout that requires no shipping, asserting the
absence of the Place order control on every blocked case as the observable proxy for the payment
section not mounting.

Those end-to-end tests have not been observed passing against this change. Three of them were run
against the deployed `main` at `https://stage.nimara.store`, which does not carry the fix. The
no-shipping Continue-driven test passed there, confirming the fixture product is genuinely
shipping-free; the two guard tests failed with exactly the reported defect — `?step=payment` on a
checkout with no email stayed on payment, and `?step=shipping-address` on a shipping-free checkout
stayed on a page with no section open. That establishes the tests detect the defect, not that the
fix clears them. Running them against the fix needs a preview deployment: the local storefront
starts, but the commerce backend its environment points at does not carry either fixture product.
This is why the record is `in_progress`.

The logged-in coverage deliberately stops short of reaching the payment step. Doing so meets the
server-side render failure that already holds the saved-payment-method checkout test at
`test.fixme`, which is unrelated to this change.

# Related Notes

[Guided Storefront Checkout](../../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)
[Cart to Confirmed Order](../../product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md)
