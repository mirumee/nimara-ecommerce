---
type: "QA Reference"
title: "Test Data & Fixtures"
description: "The committed sources, dependencies, and handling rules for reusable browser-test fixtures without treating mutable remote data or credentials as durable facts."
tags:
  - "qa"
  - "testdata"
  - "fixtures"
  - "checkout"
  - "addresses"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

### Committed browser fixtures

`apps/automated-tests/utils/constants.ts` is the current source for the browser suite's
channel routes, product, delivery option, customer address, and payment input. Reference that
file rather than duplicating its values here: the remote catalog and pricing can change
independently of this wiki.

Before a checkout run, verify that the configured product is published in the target
channel, its selected variant is available, and the configured delivery option and prices
still match. A mismatch is a fixture failure until the product behavior itself is the subject
of the test.

### Environment and account inputs

- `TEST_ENV_URL` is mandatory; `apps/automated-tests/playwright.config.ts` rejects a run when
  it is absent.
- Authenticated scenarios read `USER_EMAIL` and `USER_PASSWORD` from the environment through
  `apps/automated-tests/utils/constants.ts` and declare them as pass-through variables in
  `apps/automated-tests/turbo.json`.
- Never copy credentials, session tokens, or private customer data into the wiki, test source,
  screenshots, traces, or result notes.
- Confirm that an account belongs to the target environment and has the state required by the
  scenario, such as a saved address or payment method.

### Address inputs

The storefront does not have one static address shape. It requests validation rules per
country and builds rows from the returned format in
`packages/infrastructure/src/address/saleor/address-form/parse-address-form-rows.ts`.
Required fields and postal-code matchers are enforced by
`packages/foundation/src/address/address-form/schema.ts`.

Choose an address only after observing the rules for the selected country. For a reusable
fixture, record the country, all required fields, why the postal code is valid for that rule
set, and the date or revision at which it was verified. Do not infer country-wide rules from
one successful address.

### Payment and checkout dependencies

The committed guest checkout proceeds through customer details, shipping address, delivery,
payment, billing choice, order summary, and placement. Its payment value is suitable only for
the test integration configured by that suite. The flow in
`apps/automated-tests/tests/e2e/checkout/checkout-guest.spec.ts` selects a delivery option
before entering payment details, so tests should preserve that prerequisite unless they are
explicitly checking out-of-order behavior.

### Fixture maintenance

Treat remote products, prices, delivery options, saved account state, and service-side test
data as mutable. A fixture change should identify its consumer scenarios and update the
source and assertions together. Prefer dedicated, non-production data with deterministic
reset or cleanup behavior.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](Coverage%20Maps.md)
[Test Method Playbooks](Test%20Method%20Playbooks.md)
[Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md)
