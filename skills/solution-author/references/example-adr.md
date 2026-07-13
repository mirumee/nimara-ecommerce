# Example ADR — the quality bar

A compact, self-contained MADR ADR. Note what it does: names a base system, ranks drivers,
weighs three real options, **says why the two losers lost**, and gives concrete
Implementation Notes (interface, paths, env). This is a *reference exemplar*, not a wiki
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

## Context and Problem Statement

**Base system:** Saleor storefront (`apps/storefront`, Next.js App Router); email is a new
`notifications` capability with no system of record beyond the send log.

Several features (order confirmation, password reset, the reviews invitation) need to send
transactional email, but the storefront has no email path today. This ADR picks the default
provider behind a swappable contract. See the driving epics for the messages themselves.

## Decision Drivers

- **Deliverability** — transactional mail must land in the inbox.
- **Time-to-value** — a working send path in days, not weeks.
- **Cost** — pilot volume is low; no large fixed fee.
- **Operational burden** — no mail server to run or warm up.
- **Lock-in** — a store must be able to swap providers without touching feature code.
- **Layer fit** — must follow the swappable-provider convention and return `Result<T, E>`.

## Considered Options

1. **Resend** — API-first transactional email SaaS. *(chosen)*
2. **AWS SES** — low-cost cloud email API.
3. **Self-hosted SMTP (Nodemailer + own MTA)** — run our own mail server.

## Decision Outcome

**Chosen option: "Resend", behind a `NotificationProvider` contract.** It wins
**time-to-value** (SDK + domain verification in an afternoon) and **operational burden**
(nothing to run), with deliverability adequate for pilot volume. The contract keeps
**lock-in** low: SES or SMTP can replace it later with zero feature-code changes.

## Pros and Cons of the Options

### Resend *(chosen)*

- Good, because the API/SDK gives a send path in hours (time-to-value).
- Good, because there is no MTA to operate (operational burden).
- Bad, because per-email cost is higher than SES at scale — acceptable at pilot volume.

### AWS SES

- Good, because it is the cheapest at scale (cost).
- Bad, because deliverability requires warming and reputation management, and setup is
  heavier (time-to-value, operational burden).
- **Rejected because** it loses the time-to-value driver that gates the pilot; revisit if
  volume makes cost dominate.

### Self-hosted SMTP

- Good, because zero third-party lock-in.
- Bad, because running and securing an MTA is the heaviest operational burden and the worst
  deliverability risk.
- **Rejected because** it fails the operational-burden and deliverability drivers decisively.

## Implementation Notes

```ts
// packages/domain/src/notifications/types.ts
export interface NotificationProvider {
  sendEmail(input: EmailMessage): Promise<Result<{ id: string }>>; // to, template, data
}
```

- **Implementation:** `packages/infrastructure/src/notifications/resend/` with a manifest
  `{ id, configSchema, create(env, logger) }`, plus `notifications/select.ts` and
  `notifications/types.ts` — mirroring `search/` and `cms-page/`.
- **Wiring:** add `getNotificationService` to `CapabilityServices` in
  `packages/infrastructure/src/types.ts`; loader in `apps/storefront/src/services/registry.ts`.
  Features call `getNotificationService()` — never the SDK directly.
- **Env:** `NOTIFICATION_SERVICE=resend`; `NOTIFICATION_RESEND_API_KEY`,
  `NOTIFICATION_RESEND_FROM`, validated with Zod in the manifest, forwarded via a
  `NOTIFICATION_*` wildcard in `turbo.json`.
- **Build first:** the send path for one template (order confirmation) end-to-end.

## Consequences

**Positive** — a working, swappable email path fast; no MTA to operate; providers swap
behind the contract. **Negative** — per-email cost is higher than SES; a real send lands on
provider availability, so failures must be logged and retried, not swallowed. **Neutral** —
templating strategy (provider-side vs in-repo) is deferred to a follow-up ADR.

## Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
```
