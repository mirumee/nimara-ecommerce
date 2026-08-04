---
type: "Implementation Record"
title: "Stripe Payment Application Multi-Tenancy"
description: "Makes one payment-application deployment serve many commerce installations, keyed by commerce domain, gated by a fail-closed domain allowlist, with signing keys and callbacks addressed from the named domain."
tags:
  - "implementation"
  - "payments"
  - "stripe"
  - "saleor-app"
  - "multi-tenancy"
created: "2026-08-03T00:00:00+00:00"
timestamp: "2026-08-03T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "741"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/741"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/741"
verification:
  - criterion: "Only an allowlisted commerce domain may install the application, and wildcard patterns match within their pinned suffix."
    tests:
      - "apps/stripe/src/lib/saleor/config/util.test.ts"
  - criterion: "An unconfigured allowlist refuses every domain, and the refusal names the setting to change."
    tests:
      - "apps/stripe/src/lib/saleor/config/context.test.ts"
  - criterion: "A webhook naming a domain outside the allowlist is rejected before any signing key is fetched."
    tests:
      - "apps/stripe/src/lib/saleor/webhooks/util.test.ts"
rollout: "Set `ALLOWED_DOMAINS` on the deployment before shipping. The application fails closed, so an unset allowlist refuses every installation and webhook, including installations that already exist. Configuration stored by the previous single-installation release is read as a one-entry map, so an existing installation needs no migration."
rollback: "Restore the previous Vercel deployment. This is safe only while exactly one commerce installation exists: the stored configuration is a map keyed by commerce domain, and application code predating this change can read it only when it holds a single entry. With a second installation present, remove the extra entries from the stored value first, or roll forward. See [Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)."
---

# Implementation summary

One deployment now serves any number of commerce installations. The stored configuration changed
from a single object to a map keyed by commerce domain, so each installation holds its own
installation token, application ID, and per-channel gateway keys. The deployment no longer pins a
commerce instance through build-time configuration.

Each request names its tenant with one value, its commerce domain, and everything the application
fetches for that request is addressed from it: the signing keys that authenticate the caller and the
commerce API it calls back. A caller-supplied API URL is validated as a header but is not an input
to verification. The token's own issuer claim is not consulted either.

That single-source arrangement is the load-bearing part. While the signing keys were fetched from a
caller-declared API URL, a valid signature proved only that the sender controlled _some_ commerce
instance; pairing an allowlisted domain with a foreign API URL would have authenticated a forged
webhook against a real tenant's stored credentials. Addressing the keys from the domain removes the
mismatch rather than checking for it.

An allowlist gates which commerce domains may install. It defaults to empty, so an unconfigured
deployment refuses everything rather than accepting an unknown commerce instance and fetching from
a host it names.

Three narrower defects were fixed in the same change, each a consequence of the deployment no longer
being single-tenant:

- Provider webhook cleanup is scoped by commerce domain, so installations sharing one provider
  account no longer delete each other's endpoints.
- The dashboard configuration actions verify the caller before reading or writing configuration. The
  read action previously performed no verification and returned unmasked provider secret keys.
- The in-memory signing-key provider fetched its key set twice on every refresh.

# Deviations

- No PRD, RFC, or ADR precedes this work. The fail-closed allowlist default and the decision to
  address keys from the commerce domain rather than cross-checking two caller-supplied values are
  durable architecture choices with no ADR recording the rationale or the rejected alternatives.
- The domain allowlist replaced an earlier guard that compared a value against itself and therefore
  never rejected anything. The single-installation restriction it was meant to enforce was not in
  effect before this change.
- `*` in an allowlist pattern expands to a dot-spanning wildcard, so `nimara-*.eu.saleor.cloud`
  admits `nimara-a.b.eu.saleor.cloud` as well as `nimara-demo.eu.saleor.cloud`. Both stay under the
  pinned suffix. This is recorded as expected behavior in the pattern tests.
- All installations share a single stored value that is read, modified, and written whole, so
  concurrent configuration saves across installations are last-write-wins. No locking was added.
- A follow-up replaced the per-channel webhook endpoints with one endpoint per provider account and
  moved the installation into the endpoint address, as
  [PR 743](https://github.com/mirumee/nimara-ecommerce/pull/743). Without it, two installations
  sharing a provider account fail each other's deliveries permanently, because each endpoint signs
  with its own secret. That work is open at the time of writing and carries its own record.
- Provider accounts are distinguished by secret key rather than by account identity, so two keys
  issued by one account produce two endpoints. That costs a redundant endpoint and never misroutes
  an event.

# Verification evidence

Unit coverage exists for the three rules that decide whether an unknown commerce instance can reach
this deployment: allowlist pattern matching including the deny-by-default state, tenant rejection,
and webhook rejection ahead of any key fetch. At the anchored commit the application suite is 171
passing, with type-checking, linting, and a production build clean.

Verification against two live commerce installations on one deployment has not been performed. That
is the acceptance criterion the change exists to satisfy, and it needs a deployed environment with
two installations; until it runs, multi-installation isolation is evidenced by unit tests and code
review only.

Rollback has not been exercised. The constraint recorded above is derived from the stored-value
schema, not from a rehearsed downgrade.

# Related Notes

[Implementation (MOC)](Implementation%20%28MOC%29.md)
[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)
[Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)
