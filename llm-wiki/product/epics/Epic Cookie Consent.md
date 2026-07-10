---
type: "Epic"
title: "Cookie Consent & Google Consent Mode v2"
description: "Epic hypothesis statement for Cookie Consent and Google Consent Mode v2 in the Nimara storefront."
tags:
  - "epic"
  - "cookie-consent"
  - "gtm"
  - "compliance"
created: "2026-07-08T00:00:00+00:00"
timestamp: "2026-07-08T00:00:00+00:00"
status: "analyzing"
owner: "Michał Ociepka"
epic_type: "Business epic"
---

## Value Statement

**For** [Ecommerce Manager](product/personas/Ecommerce%20Manager.md) running Nimara stores in consent-regulated markets (EEA/UK)
**who** must run GTM tracking legally (GDPR/ePrivacy) and keep Google Ads signal alive under Consent Mode v2
**the** Cookie Consent epic
**is a** built-in consent management layer (banner + Consent Mode v2 wiring) in the Nimara storefront
**that** blocks tracking until lawful consent, preserves remarketing/measurement via v2 signals, and is configurable per country within channel
**unlike** SaaS CMPs (Cookiebot, OneTrust, Usercentrics) that cost a subscription per store plus integration work
**our solution** ships free and in-repo — GTM-native, adopter-owned, no third-party dependency.

## Business Outcomes

- Avoided SaaS CMP cost per store: ~€40–150/mo license + integration effort
- Compliance: zero tracking cookies set before consent in opt-in mode, verified by cookie scanner; 100% of GTM tags fire only per consent state
- EEA remarketing + conversion modeling preserved via v2 signals (`ad_user_data`, `ad_personalization`) — versus signal loss with no/v1 consent

## MVP

Opt-in mode only, global — no per-country/channel configuration. Bottom banner with the fixed message, **Allow all** + **Customize** buttons. Customize panel: all consent types, applications used per type, granted/denied radio buttons. `functionality_storage` and `security_storage` always granted, with purpose descriptions. Consent Mode v2 `default` + `update` calls wired to GTM.

Buys: proof the custom CMP is compliant and workable before building the per-country-in-channel matrix and opt-out mode.

Banner message (fixed):

> We use cookies and similar technologies to personalise content and ads, enable social media features, and analyse how our website is used. We may share information about your activity on our site with our social media, advertising, and analytics partners, who may combine it with information you have provided to them or that they have collected from your use of their services.

## Hypothesis Falsification

If compliance risks of maintaining a custom CMP outweigh its benefit versus a SaaS CMP — a legal review finds gaps, or keeping pace with regulation and Google policy changes proves too costly — stop the custom build and integrate a SaaS CMP instead.

## Nonfunctional Requirements (NFRs)

- Consent `default` state set **before** GTM loads — no race condition, no tag fires pre-consent
- SSR-safe (Next.js App Router)
- As a manager I wan't easy way to switch to the SaaS CMP app.
- IP geolocation — country comes from nextJS

## Constraints, Dependencies & Risks

- Where to store consent type description and services — **decided by ADR before implementation starts**
- Custom CMP is not a Google-certified TCF CMP — sufficient for advertiser-side Consent Mode, but blocks AdSense/AdManager publisher use; document the limitation
- Google evolves Consent Mode — ongoing maintenance owned by Nimara
- GTM tags themselves are configured by the Ecommerce Manager in GTM — Nimara only emits consent state

## In Scope

- Two modes: **opt-in** (no cookies until consent, banner shown) and **opt-out** (cookies set, user can adjust)
- Mode configurable per country within channel; default **opt-in** when unset
- Bottom-of-site banner with the fixed message, **Allow all** and **Customize** buttons
- Allow all → all consent types granted
- Customize panel: all consent types, applications used per type, granted/denied radio buttons
- `functionality_storage` and `security_storage` always granted, with descriptions of what they are used for
- Manually editable consent-type → applications list
- Consent Mode v2 `default` / `update` signal wiring to GTM
- Documentation

## Out of Scope

- GTM tag authoring/management (Ecommerce Manager owns tags in GTM)
- IAB TCF framework support
- SaaS CMP integrations
- Direct (non-GTM) pixel integrations
- Consent analytics dashboard

## Related Notes

[Ecommerce Manager](product/personas/Ecommerce%20Manager.md)
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
