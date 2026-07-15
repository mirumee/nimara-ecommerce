---
type: "QA Reference"
title: "Test Data & Fixtures"
description: "Reusable, verified test data — Stripe test cards, addresses, postcodes, known products per channel, and the google-i18n-address rules for the state/province field."
tags:
  - "qa"
  - "testdata"
  - "fixtures"
  - "checkout"
  - "addresses"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

### Stripe test cards (Saleor/Stripe test mode)

- ✅ Success: `4242 4242 4242 4242`, exp `12/29`, CVC `123`. ZIP `92859` (US ZIP accepted for all, incl. UK addresses via Stripe Link).
- ❌ Declined: `4000 0000 0000 0002` · Insufficient funds: `4000 0000 0000 9995` · 3DS: `4000 0025 0000 3155` (complex).
- The Stripe payment Element only initialises once a **delivery method/amount is set** — reach a fully-configured checkout first.

### Addresses

- **UK (shipping):** 55 Cunnery Rd, Malden, Postal `KT4 9JG`, Phone `070 5598 4918` (normalises to `+44…`).
- **UK (billing, different):** 95 Tadcaster Rd, Pinchbeck, `PE11 5UJ`, Phone `077 4034 7844`.
- **China (Beijing):** Street `59 W Dawang Rd`, City `朝阳区` (Chaoyang), Province `Beijing Shi`, Postal `100000`, Phone `010 5862 0976`. (City `北京市` is rejected — use the district `朝阳区`.)
- Postal validation is database-driven, not pure format; `KT4 9JG` is known-good; clearly-malformed codes (`SW1`, `ZZ99 9ZZ`) show "Wrong code format".

### Known products / handles

- dev `/`: `black-sand`, `ambient-horizon`, `blm`, `automated-test-product-ocean-waves` (music; need a format variant CD/MP3/Vinyl before Add to bag).
- demo: `colors`, `bi-polar` (published on **GB but not US** — useful for channel-publication tests).

### Checkout form field names (DOM)

`firstName, lastName, companyName, phone, streetAddress1, streetAddress2, postalCode, city`; the administrative-area control is a separate combobox (State/Province/…) or — per spec — should be a text input. Country/State are custom comboboxes (`role=combobox`), not native `<select>`.

### Address administrative-area rules (google-i18n-address `all.json`)

Per country `require` (S = admin area), `sub_isoids`, `sub_names`, `state_name_type`:

- `S` in `require` → field shown + required, else hidden.
- alphabetic `sub_isoids` → sorted, validated `<select>`; numeric/empty → free text, no validation.
- See the equivalence classes and representative live-test sweep in [Coverage Maps](./Coverage%20Maps.md).

### Accounts

- No standing storefront/admin test account is reliably available to agents — request one per test run and confirm the **environment** it belongs to; an email containing "stage" does not guarantee it works on `stage.nimara.store`.

## Related Notes

[Quality & Testing (MOC)](./Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](./Coverage%20Maps.md)
[Test Method Playbooks](./Test%20Method%20Playbooks.md)
[Environments & Access Matrix](./Environments%20%26%20Access%20Matrix.md)
