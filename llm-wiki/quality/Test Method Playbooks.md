---
type: "QA Playbook"
title: "Test Method Playbooks"
description: "For a given class of defect, the cheapest reliable technique to verify it — throttling for races, response inspection for API contracts, geometry for visual bugs, Lighthouse for perf, code inspection for dev-only warnings."
tags:
  - "qa"
  - "methods"
  - "playbook"
  - "techniques"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

Pick the **cheapest reliable** method per bug class. All of these are proven on Nimara.

### Timing / race conditions (e.g. lost add-to-cart, slow updates)
- Throttle with CDP: `Network.emulateNetworkConditions` via a Playwright CDP session (slow-3G/4G + high latency) to widen the race window.
- **Always run a control**: the "fast/aggressive" path AND a "wait-for-completion" path. If the control succeeds but the fast path fails, it's a real race — not a broken feature.
- Probe permanence: after a failed fast path, wait + reload — distinguishes a dropped write from a stale read.

### API / server-action contract (e.g. wrong HTTP status)
- Attach a Playwright `response` listener; capture the POST/server-action **status + body**. (Next.js server actions are POSTs to the route.)

### Visual / layout (e.g. misalignment, overlap)
- Measure `getBoundingClientRect()` of the elements; compare top/left numerically. Turn "looks off" into a px delta + a clear threshold.

### SEO / structural (meta tags, sitemap, robots)
- `curl` the server-rendered HTML and grep — e.g. `<meta property="og:*">`, `/sitemap.xml`. Deterministic, no browser flake. Verify generated assets resolve (e.g. og:image endpoint returns an image).

### Performance (mobile/desktop scores)
- Run **local Lighthouse** (`npx lighthouse <url> --form-factor=mobile`) using the system Chrome (`CHROME_PATH`). Default mobile profile = throttled mobile, which is what perf tickets mean.
- The **PageSpeed Insights public API has a keyless daily quota** that runs out (429) — keep local Lighthouse as the default.
- nimara.store is a landing page — measure the real storefronts (dev/stage/demo), Home + PLP + PDP.

### Dev-only console warnings / code patterns (e.g. RSC `params` misuse)
- These are stripped in production builds, so the deployed console won't show them. Verify by **code inspection** (`grep`/read the component). Caveat: repo HEAD may differ from the deployed build — state that in the verdict.

### Backend signals (e.g. `checkout.user`, order transactions, ERP state)
- Need Saleor GraphQL / dashboard / ERP access. Usually **not available** → route to a developer (see [Known Flaky, Blocked & Backend-Only](quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md)).

### Multi-country / data-driven UI (e.g. address fields)
- Equivalence-partition against the data source (see [Coverage Maps](quality/Coverage%20Maps.md) and [Test Data & Fixtures](quality/Test%20Data%20%26%20Fixtures.md)); inspect the rendered control per representative (select vs text, required, sorted).

### Tooling available to agents
Playwright MCP (navigate/snapshot/click/type/fill_form/screenshot/navigate_back/**run_code_unsafe** for CDP + DOM eval), Jira MCP, Bash+curl, local Lighthouse, repo grep/read.

## Related Notes
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](quality/Coverage%20Maps.md)
[Test Data & Fixtures](quality/Test%20Data%20%26%20Fixtures.md)
[Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md)
