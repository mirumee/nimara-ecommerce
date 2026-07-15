---
type: "QA Note"
title: "Known Flaky, Blocked & Backend-Only"
description: "Where NOT to burn cycles or force a verdict — known-flaky areas, things behind access agents don't have, and defects only verifiable in the backend."
tags:
  - "qa"
  - "blocked"
  - "flaky"
  - "backend"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

### Backend-only — cannot be verdicted from the storefront (route to a developer)

- **Saleor internals**: order and transaction counts, `checkout.user` attachment, and channel-specific attribute queries require Saleor dashboard or GraphQL access.
- **ERP**: fulfilment sync, stock calculations, and order-entry status require an active ERP environment. These environments are often disabled or unavailable.
- Pattern: if the expected result lives in Saleor or ERP records rather than the UI, route verification to a developer and state the exact backend evidence required.

### Access-blocked

- **Docs site** (`dev.docs.nimara.store`): Vercel SSO prevents verification without Vercel access, a bypass token, or a public URL.
- **Saleor dashboard setup** for preconditions such as channel publication, discounts, and product availability requires dashboard access or prepared fixtures.

### Known-flaky storefront behaviours (don't over-trust a single run)

- **GB delivery methods sometimes fail to load** on the delivery step ("Failed to update delivery method" / empty radiogroup). Reload or proceed; not the same as a full-shell crash.
- **Stripe Element** can be slow/fail to load on second mount or under heavy throttle; only initialises after a delivery method/amount is set.
- **Cache/channel leaks** are intermittent by nature — failing to reproduce is not proof of a fix (see [Verdict & Evidence Policy](./Verdict%20%26%20Evidence%20Policy.md)).

### Not-the-storefront

- `nimara.store` is a marketing/landing page (no `/search`, `/products`). Don't test it as the store.

### What to do when blocked

Record the verification as blocked or inconclusive, state exactly what is missing (environment URL, credentials, dashboard access, fixture, or a decision), and request it. Batch related requests so one human pass can unblock several checks.

## Related Notes

[Quality & Testing (MOC)](./Quality%20%26%20Testing%20%28MOC%29.md)
[Environments & Access Matrix](./Environments%20%26%20Access%20Matrix.md)
[Verdict & Evidence Policy](./Verdict%20%26%20Evidence%20Policy.md)
