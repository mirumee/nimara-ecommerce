# Example ADR — the quality bar

A compact, self-contained DERBY-style design ADR. Note what it does: names a base system,
states functional + non-functional requirements (the drivers), commits to a concrete
Proposed solution (interface, paths, env), and under Cross-cutting considerations **weighs
two real alternatives and says why each lost**. This is a *reference exemplar*, not a wiki
note — do not copy it into `tech/ADR/`.

---

```markdown
---
type: "ADR"
title: "Default Email Provider for Transactional Notifications"
description: "Ship a swappable email-notification capability with Resend as the default transactional provider — Proposed."
tags:
  - "adr"
  - "notifications"
status: "Proposed"
---

## Recommendation

_Fill this section after the ADR is Final (status: `Accepted`)._

Implementation page: _link to the PR / task once it exists._

### Outcome

_To be recorded after implementation._

## Problem

**Base system:** Saleor storefront (`apps/storefront`, Next.js App Router); email is a new
`notifications` capability with no system of record beyond the send log.

Several features (order confirmation, password reset, the reviews invitation) need to send
transactional email, but the storefront has no email path today. This ADR picks the default
provider behind a swappable contract. See the driving epics for the messages themselves.

## Requirements

### Functional requirements

1. Send a templated transactional email to one recipient from a feature/Server Action.
2. Report success/failure as `Result<T, E>` so callers can retry or surface an error.
3. Be swappable: a store can replace the provider without touching feature code.

### Non-functional requirements

1. **Deliverability** — transactional mail must land in the inbox.
2. **Time-to-value** — a working send path in days, not weeks.
3. **Cost** — pilot volume is low; no large fixed fee.
4. **Operational burden** — no mail server to run or warm up.
5. **Lock-in** — providers swap behind a contract with zero feature-code change.
6. **Layer fit** — follows the swappable-provider convention and returns `Result<T, E>`.

## Proposed solution

Ship the default as **Resend**, behind a `NotificationProvider` contract. Resend wins
**time-to-value** (SDK + domain verification in an afternoon) and **operational burden**
(nothing to run), with deliverability adequate for pilot volume. The contract keeps
**lock-in** low: SES or SMTP can replace it later with no feature-code change.

```ts
// packages/domain/src/notifications/types.ts
export interface NotificationProvider {
  sendEmail(input: EmailMessage): Promise<Result<{ id: string }>>; // to, template, data
}
```

### Component changes

#### Existing components

- `packages/infrastructure/src/types.ts` — add `getNotificationService` to `CapabilityServices`.
- `apps/storefront/src/services/registry.ts` — add the loader; features call
  `getNotificationService()`, never the SDK directly.

#### New components

- `packages/infrastructure/src/notifications/resend/` — manifest
  `{ id, configSchema, create(env, logger) }`, plus `notifications/select.ts` and
  `notifications/types.ts`, mirroring `search/` and `cms-page/`.
- `packages/domain/src/notifications/` — the `NotificationProvider` types.

### API changes

No external API. Internally, the service exposes `sendEmail(EmailMessage): Promise<Result<{ id }>>`;
fallible operations never throw for expected failures.

### Database changes

None. There is no system of record beyond the provider's send log; delivery state is not
persisted in this ADR.

## Cross-cutting considerations

### Security

`NOTIFICATION_RESEND_API_KEY` is a server-only secret validated in the manifest and never
exposed to the client. Recipient addresses are PII in transit only; no store here.

### Monitoring and alerting

Log every send with its provider message id and outcome; alert on a send-failure rate above
a threshold over a rolling window.

### Failure cases and remediation

Provider outage or 4xx/5xx → return an error `Result`, log it, and retry with backoff; do not
swallow failures. A hard failure surfaces to the caller for user-facing messaging.

### Alternative solutions

- **AWS SES** — low-cost cloud email API.
  - Good, because it is the cheapest at scale (cost).
  - Bad, because deliverability needs warming and reputation management; setup is heavier.
  - **Rejected because** it loses the time-to-value driver that gates the pilot; revisit if
    volume makes cost dominate.
- **Self-hosted SMTP (Nodemailer + own MTA)** — run our own mail server.
  - Good, because zero third-party lock-in.
  - Bad, because running and securing an MTA is the heaviest operational burden and the worst
    deliverability risk.
  - **Rejected because** it fails the operational-burden and deliverability drivers decisively.

### Dependencies

- **Resend SDK** — a NEW package dependency; per Nimara rules it is proposed with alternatives
  (SES SDK, Nodemailer) and approved before `pnpm add`, never added automatically.

### System Impacts

Adds an outbound-email dependency to the storefront; features that need email now depend on
the notifications capability being configured.

### Documentation Changes

`.env.example` gains the `NOTIFICATION_*` variables; `apps/docs` gains a "notifications
capability" page.

### QA Validation

- Unit-test the manifest and the `Result` mapping (Vitest).
- E2E: trigger order confirmation and assert a send is attempted (Playwright, can be automated).

### DevOps / Infrastructure

Env: `NOTIFICATION_SERVICE=resend`; `NOTIFICATION_RESEND_API_KEY`, `NOTIFICATION_RESEND_FROM`,
validated with Zod in the manifest and forwarded via a `NOTIFICATION_*` wildcard in
`turbo.json`. **Build first:** the send path for one template (order confirmation) end-to-end.

## Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
```
