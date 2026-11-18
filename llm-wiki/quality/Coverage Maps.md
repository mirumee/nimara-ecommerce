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
---

## Content

Design tests by equivalence partitioning: enumerate the implementation branches and product
contracts, select a representative for each, then state what remains uncovered. Test source
proves intended coverage; only execution results prove that a revision passed.

### Current browser coverage

The CodeceptJS suite under `apps/automated-tests/codecept` currently contains:

| Surface                | Covered representatives                                                                                                                 | Material gaps                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Homepage               | storefront title and product carousel render, the products link opens the listing                                                       | hero banner, responsive layout, locale variation, metadata, failure states                     |
| Newsletter subscribe   | purpose text and address-only form, the consent link reaches the privacy policy, an invalid address is rejected with no success message | the section is absent without a provider, provider acceptance, provider rejection, timeout     |
| Authentication         | sign-in with configured credentials                                                                                                     | page UI, password visibility, invalid credentials, expired session, authorization boundaries   |
| Guest checkout         | two cart entry points to order placement, a two-item cart, stolen-card and expired-card declines                                        | order-summary price and delivery assertions, different billing address, other channels         |
| Category page          | none                                                                                                                                    | the entire surface: breadcrumb, listing, sorting, filters, pagination, unknown slug            |
| Checkout steps         | none                                                                                                                                    | the entire step guard, including whether payment renders for a checkout that cannot be ordered |
| Authenticated checkout | none                                                                                                                                    | the entire surface, including saved address and saved payment                                  |

`apps/automated-tests/codecept.conf.ts` configures a single chromium helper. There is no
Firefox, WebKit, or mobile coverage, and no retries. The URL prefix comes from `LOCALE`
through `apps/automated-tests/codecept/data/locales.ts`, defaulting to `us` with no prefix.
Routes, addresses, and card data live in `apps/automated-tests/codecept/data/constants.ts`.
Running one locale does not create channel or locale coverage by itself.

The newsletter scenarios carry the `@newsletter` tag, because the subscribe section renders only
where a newsletter provider is configured. Run them with `--grep @newsletter` against such an
environment and exclude the tag elsewhere. Two limits follow from the suite running against one
environment: the mirror case — no provider, no section — needs a deployment without one and stays a
manual check, and no scenario submits an address the provider would accept, because a passing run
must not write a profile into the merchant's list. Provider acceptance, rejection, and timeout are
covered by unit tests instead.

**Accepted coverage loss.** The category page, the checkout step guard, the authenticated
checkout, and the cross-browser matrix were covered by a Playwright suite that was deleted
rather than ported when CodeceptJS became the only engine. Order-summary price assertions went
with it. Treat every one of those as unexercised, not as inferred from a passing run. The
decision and its full loss list are recorded in
[ADR-0003 CodeceptJS Is The End-To-End Test Engine](../tech/ADR/ADR-0003%20CodeceptJS%20Is%20The%20End-To-End%20Test%20Engine.md).

### Checkout partitions

Build a coverage matrix across these independent dimensions:

- guest versus authenticated account;
- empty, single-line, multi-line, and multi-vendor cart where supported;
- physical versus non-shipping-required product;
- same, new, and saved billing address;
- successful, declined, challenged, unavailable, and interrupted payment;
- each configured channel, currency, and locale;
- forward progression, back-navigation, refresh, duplicate submission, and session expiry.

The current guest-checkout scenarios cover two happy-path cart entry points, a two-item cart,
and two card declines. No scenario covers an authenticated checkout. Do not infer the other
cells from those runs.

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
