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

- **Saleor internals**: order/transaction counts (MS-308), `checkout.user` attachment (MS-1096), channel-specific attributes query (MS-1065). Need Saleor dashboard/GraphQL.
- **ERP**: fulfilment sync (MS-750), stock calculations (MS-790), order entry status (MS-765). ERP envs are often **disabled/inactive**; route to dev/PO.
- Pattern: if the expected result lives in Saleor/ERP records, not the UI → mark `routed_to_dev`, add `dev_verify` label, move to `Open`/To Fix.

### Access-blocked

- **Docs site** (`dev.docs.nimara.store`): Vercel SSO → un-testable without Vercel access / bypass token / public URL (MS-1092).
- **Saleor dashboard setup** for preconditions (unpublish a product on one channel → MS-807; toggle a discount → MS-1102; mark a product unavailable → MS-1097). Need dashboard access or a pre-made fixture.

### Known-flaky storefront behaviours (don't over-trust a single run)

- **GB delivery methods sometimes fail to load** on the delivery step ("Failed to update delivery method" / empty radiogroup). Reload or proceed; not the same as a full-shell crash.
- **Stripe Element** can be slow/fail to load on second mount or under heavy throttle; only initialises after a delivery method/amount is set.
- **Cache/channel leaks** (MS-807-class): intermittent by nature — failing to reproduce is not proof of a fix (see [Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)).

### Not-the-storefront

- `nimara.store` is a marketing/landing page (no `/search`, `/products`). Don't test it as the store.

### What to do when blocked

Leave the ticket in place, mark `blocked_needs_human` in `worklist.json`, comment what's needed (env URL, creds in code blocks, dashboard access, a decision), ASK, and move on. Batch requests so one human pass unblocks many.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md)
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)
