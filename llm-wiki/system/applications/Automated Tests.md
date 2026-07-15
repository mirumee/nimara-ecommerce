---
type: "Application"
title: "Automated Tests"
description: "Playwright black-box suite covering selected storefront journeys across Chromium, Firefox, and WebKit."
tags:
  - "application"
  - "testing"
  - "playwright"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/automated-tests"
  - ".github/workflows/e2e.yaml"
---

# Content

## Current implementation

The automated-tests workspace runs Playwright against an external `TEST_ENV_URL` on Chromium,
Firefox, and WebKit. Its 13 tests cover homepage, sign-in, guest checkout, and authenticated
checkout with saved customer data.

## Gaps

- No black-box coverage exists for marketplace, Stripe App, docs, ACP/UCP, ledger, or payouts.
- Checkout page objects expect an older multi-path checkout while the storefront uses a
  `?step=` state model.
- The E2E workflow is manual and is not part of the normal `pnpm test` gate.
- Some content assertions are disabled by test configuration.

Tests provide confidence only for the exercised journeys; missing tests neither prove nor
disprove an implementation.

## Direction and gaps

Broader E2E/CI expansion remains planned. Full shopper-flow, continuous-integration,
payment-path, and checkout coverage remain incomplete or in refinement. The existing 13-test
suite satisfies several established slices but not the wider scope. Its manual workflow and
known timing/staleness concerns match an unfinished automation direction.

## Evidence

Primary paths: `apps/automated-tests/tests/e2e`, `apps/automated-tests/pages`,
`apps/automated-tests/playwright.config.ts`, `.github/workflows/e2e.yaml`, and `turbo.json`.

# Related Notes

[Quality And Testing](../../quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Commerce Storefront](../capabilities/Commerce%20Storefront.md)
