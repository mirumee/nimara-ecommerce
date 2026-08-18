---
id: newsletter-integration
title: Newsletter Integration
---

# Newsletter Integration in Nimara

The storefront home page can capture newsletter subscribers and hand them to the
email service provider your team already sends campaigns from. Configuration is the
whole rollout: there is no code to write, no database, and no Nimara-side subscriber
store.

Two things follow from that, and both are deliberate:

- **The capability has no default provider.** With `NEWSLETTER_SERVICE` unset, the
  newsletter form is **absent** from the home page — not disabled, not inert. Nothing
  else about the storefront changes.
- **The provider owns the subscriber.** It sends the confirmation email, adds the
  contact to your list only once the shopper confirms, holds the consent record, and
  handles unsubscribe in its campaign footer. Nimara persists nothing — no address,
  no name, no consent record, and nothing derived from them in logs or error reports.

You are the data controller for the addresses you collect, and the provider is your
processor. Your privacy policy has to cover that collection.

## Reference provider: Brevo

Brevo is the adapter the core team maintains. It was picked because double opt-in is a
property of the endpoint Nimara calls rather than an account setting: Brevo sends the
confirmation email itself and only adds the contact to the configured lists after the
recipient confirms. A `dummy` adapter ships alongside it — it satisfies the same
boundary, makes no outbound call, and lets you exercise the whole path without an
account.

### Prerequisites

Complete these in Brevo **before** configuring the storefront. The first two fail
quietly — subscriptions appear to work while data goes nowhere.

1. **Get your account approved for sending.** A fresh Brevo account cannot send at all
   until Brevo approves it. This step is outside Nimara's control and outside its
   timing, so start it first.
2. **Create the custom contact attributes.** Brevo drops values for attributes that do
   not exist. Under **Contacts → Settings → Contact attributes**, create:
   - `CONSENT_AT` — type _Text_. Receives the ISO timestamp of the consent action.
   - `CONSENT_URL` — type _Text_. Receives the absolute URL of the privacy policy the
     shopper was shown.
     `FIRSTNAME` already exists in every Brevo account and receives the name field.
3. **Create the list(s)** subscribers should join, under **Contacts → Lists**, and note
   each list id.
4. **Create the confirmation email template** under **Campaigns → Templates**, and note its id.
   Two properties make it a usable double-opt-in template, and Brevo enforces neither at
   creation time:
   - **It must carry the tag `optin`.** Brevo identifies a double-opt-in template by that tag
     alone; without it the subscribe call fails with
     `400 invalid_parameter` / `An active DOI template does not exist`, no matter which id you
     pass. Set it under the template's advanced settings, or over the API:

     ```bash
     curl -X PUT "https://api.brevo.com/v3/smtp/templates/<TEMPLATE_ID>" \
       -H "api-key: $NEWSLETTER_BREVO_API_KEY" -H "content-type: application/json" \
       -d '{"tag":"optin","isActive":true}'
     ```

     Reading the template back then shows `"doiTemplate": true`. Beware the misleading signal
     here: a template without the tag still sends perfectly well as an ordinary transactional
     email, so proving the template "works" that way tells you nothing about whether the
     subscribe call will accept it.

   - **The confirmation link must be `{{ params.DOIurl }}`.** Brevo substitutes the one-time
     confirmation URL for that tag. Without it the shopper gets an email with nothing to click,
     so the contact never reaches your list while the storefront correctly reports that a
     confirmation step follows. This is not the tag Brevo's own sign-up forms use — those are a
     different flow, and their tag does not resolve here.

   The template must also be **active**. If you serve several locales, create one template per
   locale and pass a locale map in `NEWSLETTER_BREVO_DOI_TEMPLATE_ID`.

5. **Publish a confirmation page you own.** Nimara ships none. Brevo redirects the
   shopper there after they confirm, so pointing it at your home page leaves them with
   no acknowledgement that confirmation worked.

### Configure the storefront

Add these to `apps/storefront/.env`:

```bash
NEWSLETTER_SERVICE=brevo
NEWSLETTER_BREVO_API_KEY=xkeysib-...
# Comma-separated list ids the contact joins after confirming
NEWSLETTER_BREVO_LIST_IDS=4,9
# One template id, or a JSON map of locale to id with a "default" key
NEWSLETTER_BREVO_DOI_TEMPLATE_ID=12
NEWSLETTER_BREVO_REDIRECT_URL=https://my-store.com/newsletter/confirmed
# Optional. Budget for the outbound call, in milliseconds. Defaults to 3000.
NEWSLETTER_BREVO_TIMEOUT_MS=3000
```

Every variable is server-side; none is exposed to the browser, including the selector.
Run `pnpm preflight --report` to confirm the capability reads as configured, then
rebuild — selection is read at build time, the same as the search and CMS selectors.

To try the path without an account, set `NEWSLETTER_SERVICE=dummy`. The form renders
and resolves to the same success, with no outbound call.

### Verify

1. Open the home page. The form is visible, with a required consent checkbox linking to
   your privacy policy.
2. Submit without ticking consent. The form explains the requirement and nothing is
   sent.
3. Tick consent and submit a real address. The storefront says a confirmation step
   follows.
4. Confirm from the email. Brevo redirects you to `NEWSLETTER_BREVO_REDIRECT_URL`, and
   the contact appears on the configured list with `CONSENT_AT` and `CONSENT_URL` set. Before you
   confirm, the contact does not exist at all — that is the design, not a fault: Brevo creates it
   only on confirmation, which is why Nimara never holds an unconfirmed address.

If a submission fails, read the `providerField` value on the adapter's `Newsletter subscribe
finished` log line: it names the request field Brevo rejected, which separates a genuinely bad
address from a mistyped list, template, or redirect. The adapter deliberately never logs Brevo's
own message, because Brevo echoes the submitted address in it. To see that message while
debugging, reproduce the call yourself with an address you chose rather than loosening the
adapter.

## What the shopper sees

| Outcome                                          | Message                                   |
| ------------------------------------------------ | ----------------------------------------- |
| Brevo accepted the submission                    | A confirmation step follows               |
| The address was already on the list              | The same message — see below              |
| Brevo rejected the address                       | Check the address and try again           |
| Brevo was unreachable or slower than the timeout | Try again shortly                         |
| The account's send quota is exhausted            | Subscriptions are temporarily unavailable |

Success is shown only for a submission the provider accepted. No submission is silently
discarded, and a failure is never presented as a success.

An address already on the list resolves to exactly the same success as a new one, and
the failure messages are equally membership-blind. This is deliberate: the form is
public and the underlying action is reachable without a session, so a distinguishable
"already subscribed" answer would let anyone test arbitrary addresses against your list.
You still see new and existing contacts distinguished in the Brevo dashboard.

There is no automatic retry. A timed-out request is ambiguous — Brevo may have accepted
it and already sent the confirmation email — so retrying would send a second one. The
shopper's own resubmission is the retry, which is safe because duplicates succeed.

## Abuse protection

Every submission passes through one server-side choke point, which is where a rate
limit, a CAPTCHA, or an edge rule belongs. Nimara ships none, because the right
mechanism is deployment-specific. On a free provider plan this matters: each attempt
spends one confirmation email, so an unprotected public form can exhaust a day's quota.
Removing the provider configuration removes the form, with no code change.

## Using a different provider

The storefront reaches the provider through one operation that carries the address, an
optional name, the shopper's locale, and consent as data. List ids, template ids and the
redirect URL are configuration of the selected adapter, never arguments — so no caller
holds provider knowledge, and replacing the adapter changes no form, validation,
translation, or outcome state.

To add your own provider:

1. Add a directory under `packages/infrastructure/src/newsletter/<provider>/` with a
   `config.ts` (a Zod schema over your `NEWSLETTER_<PROVIDER>_*` variables plus a mapper)
   and a subscribe implementation returning `Result`.
2. Register it in `packages/infrastructure/src/newsletter/providers.ts` and add one
   manifest entry in `select.ts`. The provider id catalog, the env validation, and the
   preflight report are all derived from that entry.
3. Map your provider's outcomes onto the existing error codes: a rejected address,
   provider unavailability, and an exhausted quota. Keep the response independent of
   list membership, and keep the timeout explicit with no retry.

Nothing in the shared implementation needs forking, and no other capability is affected.

Two rules the adapter must not break: never log or attach the provider's response body,
because every candidate provider echoes the submitted contact in responses and errors;
and never write the address anywhere on the Nimara side, a captured exception included.
