---
type: "Capability"
title: "Tracking Consent And Observability"
description: "Cookie preferences, Google Consent Mode, analytics events, logging, error reporting, tracing, and performance telemetry."
tags:
  - "capability"
  - "consent"
  - "analytics"
  - "observability"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "mixed"
implementation_status: "conditional"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/foundation/cookie-consent"
  - "apps/storefront/src/foundation/consent"
  - "apps/storefront/src/instrumentation.ts"
  - "packages/infrastructure/src/tracking"
  - "apps/storefront/sentry.common.config.ts"
---

# Content

## Current implementation

Cookie consent and privacy settings are wired into the storefront. Google Tag Manager and
commerce tracking events are optional and gated by consent. Storefront observability includes
structured logging, Sentry, optional OpenTelemetry, and consent-gated Vercel Speed Insights.
Stripe App has logging and Sentry configuration; marketplace uses structured logging but lacks
the same Sentry/OTel surface in the reviewed snapshot.

## Direction and gaps

The observability foundation is established, while tracking/event taxonomy, consent strategy,
and accessibility/performance monitoring remain planned or in refinement. Code already contains
consent UI, Consent Mode, ecommerce events, Sentry, and OpenTelemetry, but that does not prove the
full taxonomy, acceptance criteria, or score-degradation alerts are complete.

## Evidence

Primary paths: storefront cookie-consent/consent foundations, tracking infrastructure,
instrumentation, Sentry configs, and locale layout.

# Related Notes

[PRD Cookie Consent](../../product/prds/PRD%20Cookie%20Consent.md)
[Deployment And Observability](../../tech/integrations/Deployment%20And%20Observability.md)
[Storefront](../applications/Storefront.md)
