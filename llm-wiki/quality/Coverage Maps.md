---
type: "QA Reference"
title: "Coverage Maps"
description: "A code-grounded map of current automated coverage and high-value equivalence partitions for the storefront, marketplace, payment app, and shared packages."
tags:
  - "qa"
  - "coverage"
  - "equivalence"
  - "checkout"
  - "addresses"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

Design tests by equivalence partitioning: enumerate the implementation branches and product
contracts, select a representative for each, then state what remains uncovered. Test source
proves intended coverage; only execution results prove that a revision passed.

### Current browser coverage

The Playwright suite under `apps/automated-tests/tests/e2e` currently contains:

| Surface                | Covered representatives                                                                               | Material gaps visible in the suite                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Homepage               | section visibility and navigation to search                                                           | responsive layout, locale variation, metadata, failure states                             |
| Authentication         | page UI, password visibility, sign-in, account creation and reset navigation                          | invalid credentials, expired session, authorization boundaries                            |
| Guest checkout         | one configured product, address, delivery option, card payment, same billing address, order placement | invalid inputs, declined or challenged payment, different billing address, other channels |
| Authenticated checkout | saved address and saved payment happy path                                                            | missing or stale saved data, new address or payment, authorization expiry                 |

`apps/automated-tests/playwright.config.ts` defines desktop Chrome, Firefox, and Safari-like
projects. It does not define a mobile project. The checkout routes and data default to one
channel in `apps/automated-tests/utils/constants.ts`; configured projects do not create
channel or locale coverage by themselves.

### Checkout partitions

Build a coverage matrix across these independent dimensions:

- guest versus authenticated account;
- empty, single-line, multi-line, and multi-vendor cart where supported;
- physical versus non-shipping-required product;
- same, new, and saved billing address;
- successful, declined, challenged, unavailable, and interrupted payment;
- each configured channel, currency, and locale;
- forward progression, back-navigation, refresh, duplicate submission, and session expiry.

The current two checkout specifications cover only the happy-path guest and saved-account
representatives. Do not infer the other cells from those runs.

### Address-form partitions

Current implementation branches are defined in
`packages/infrastructure/src/address/saleor/address-form/parse-address-form-rows.ts` and the
field helpers beside it:

- supported versus ignored address-format tokens;
- allowed versus omitted fields;
- required versus optional fields;
- country-area validation enabled for the explicit country allowlist versus disabled;
- country-area choices present, empty, or containing incomplete values;
- postal matchers absent, one matcher, or multiple matchers;
- valid, invalid, empty-required, and empty-optional values;
- country changes that replace the generated field set and validation schema.

Select representatives from the validation data returned by the target API at test time.
The repository contains no execution record proving a complete multi-country sweep.

### Other repository surfaces

The current unit-test inventory covers selected storefront integration resolution, search
filter handling, localization utilities, marketplace webhooks and connected-account actions,
and payment-app utilities, security, API, and webhook helpers. There is no committed browser
specification for marketplace workflows or the payment application. Use this inventory to
prioritize risk-based additions, not as proof that unlisted behavior is defective.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md)
[Test Method Playbooks](Test%20Method%20Playbooks.md)
[Defect Taxonomy & Severity](Defect%20Taxonomy%20%26%20Severity.md)
