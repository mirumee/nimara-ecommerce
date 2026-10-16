---
type: "Strategic Initiative"
title: "Rate Limiting for Public Storefront Endpoints"
description: "Deferred idea: rate limiting for unauthenticated storefront write paths on serverless hosting."
tags:
  - "strategy"
  - "initiatives"
  - "storefront"
  - "abuse-protection"
  - "serverless"
created: "2026-08-20T00:00:00+00:00"
---

## Content

Nimara has no rate limiting anywhere in the repository. The storefront exposes unauthenticated
write paths, and every new one calls a paid third-party API sooner or later. Newsletter capture is
the first such path. This note holds the idea for later, so the next design does not repeat the
research.

The idea is deferred, not rejected. It is not scheduled and it has no owner yet.

### Why an in-process counter is not the answer

The storefront target host is serverless. Function instances scale out and run in several regions,
so a counter held in one process sees only the traffic that reaches that process. A per-instance
counter stops an accidental repeated submit. It does not stop a script, and it must never be
presented as if it did.

### The three grounded options

1. A firewall rate-limit rule, configured by the operator, with no application code. The Vercel WAF
   matches over 15 request parameters, and since Next.js 15.5 it can match a named Server Action.
   That condition is available on all plans at no extra cost, so a Server Action is a legitimate
   target and no dedicated route handler is needed for this reason alone.
2. A platform rate-limit call inside the application, through the `@vercel/firewall` package. The
   platform holds the counter and the application decides the response, so the shopper can receive a
   message that names the limit. This adds a dependency and a dashboard rule whose rate-limit ID
   must match the code.
3. An application limiter behind one internal boundary, with a shared store supplied by the
   adopter. This is the only portable option, and it is the only one that serves a self-hosted
   deployment.

### The constraint that decides the shape

A firewall denial answers `429` at the edge. The request never reaches the application, so the
application cannot render a message that names the limit. Any requirement that asks for a
user-visible limit message rules out a firewall-only answer. Option 2 or option 3 is then
mandatory, and the firewall rule becomes an outer wall rather than the whole answer.

A second constraint applies to every option. Firewall rate-limit counters are tracked per region,
so traffic spread across regions can exceed the configured limit in total.

### What a future design must settle

- Whether Nimara ships a portable limiter, or documents an operator configuration step instead.
- Whether a Vercel-specific dependency is acceptable in an open-source starter that adopters
  self-host.
- The threshold and the window, which no record currently states.
- Whether bot protection is in scope, which is a separate decision from rate limiting.

### Sources

- [WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) — per-region
  counters, fixed window from 10s to 10min on Hobby and Pro, IP and JA4 counting keys on those
  plans, one rule per project on Hobby. Captured 2026-08-20; page dated 2026-06-16. Re-verify before
  a design depends on the plan limits.
- [Manage Next.js Server Actions in the Vercel Firewall](https://vercel.com/changelog/manage-next-js-server-actions-in-the-vercel-firewall)
  — Server Action Name condition, Next.js 15.5 and later, all plans at no extra cost. Captured
  2026-08-20; changelog dated 2025-10-24.
- [Rate Limiting SDK](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk) —
  `checkRateLimit` in `@vercel/firewall`, a matching dashboard rule, and custom rate-limit keys.
  Captured 2026-08-20; page dated 2026-07-23.

## Related Notes

[Initiative Prioritization](Initiative%20Prioritization.md)
[PRD-004 Newsletter Subscriptions](../../../prd/PRD-004%20Newsletter%20Subscriptions.md)
