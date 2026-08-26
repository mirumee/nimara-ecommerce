---
id: klaviyo-newsletter
title: Klaviyo Newsletter
---

# Klaviyo Newsletter in Nimara

The storefront home page can show a newsletter subscribe section. The section is off until you
select a provider. Klaviyo is the first supported provider.

Nimara stores nothing. Klaviyo owns the subscriber, the list, the confirmation message, the consent
record, and the unsubscribe link.

You connect the provider through configuration only. No application file changes.

### Prerequisites

Before you start, make sure that you have:

- A **Klaviyo account**
- A **Klaviyo list** with double opt-in enabled
- A **Klaviyo private API key** with the `lists:write`, `profiles:write` and `subscriptions:write`
  scopes

### Create the list

1. Open **Audience > Lists & Segments** in Klaviyo and create a list.
2. Open the list settings and enable **double opt-in**.
3. Copy the list ID from the list URL or from the list settings page.

:::warning
Enable double opt-in on the list. If double opt-in is off, Klaviyo subscribes the address
immediately and sends no confirmation message. Nimara cannot check this setting, and
`pnpm preflight` does not report it.
:::

### Create the private API key

1. Open **Settings > API keys** in Klaviyo and create a private key.
2. Give the key the `lists:write`, `profiles:write` and `subscriptions:write` scopes.
3. Copy the key. Klaviyo shows it once.

The key is read on the server only. It never reaches the browser bundle.

### Set environment variables

Add the following variables to your **.env** file in the `apps/storefront` directory. Copy
`apps/storefront/.env.example` as a starting point (run this from the repo root):

```bash
cp apps/storefront/.env.example apps/storefront/.env
```

| Variable                             | Value                             |
| :----------------------------------- | :-------------------------------- |
| `NEWSLETTER_SERVICE`                 | `klaviyo`                         |
| `NEWSLETTER_KLAVIYO_PRIVATE_API_KEY` | Your Klaviyo private API key      |
| `NEWSLETTER_KLAVIYO_LIST_ID`         | The ID of your double opt-in list |

All three values are server-side. Store the private key in your deployment platform, never in the
repository.

### Verify the configuration

Run the preflight from the repo root:

```bash
pnpm preflight --report
```

The report shows one `Newsletter` row:

- `● ON Newsletter klaviyo` — the selection and both keys are present.
- `✗ MISS Newsletter klaviyo — missing: ...` — the report names each missing key.
- `○ OFF Newsletter not configured` — `NEWSLETTER_SERVICE` is unset.

Then build and deploy. Provider selection is read at build time, so a configuration change needs a
new build.

### Turn the capability off

Remove `NEWSLETTER_SERVICE` and deploy. The home page then renders no subscribe section, and a
submission posted directly is refused. This is the kill switch. There is no feature flag.

### What the shopper sees

- The form collects the email address only.
- The consent text names the purpose and links to the privacy policy.
- A success message appears only after Klaviyo acknowledges the request.
- Every other outcome shows a failure message.

### Behavior you must know

**A timeout is ambiguous.** Nimara waits 5 seconds for Klaviyo. If the request times out after
Klaviyo accepted it, the shopper sees a failure message and can still receive the confirmation
message. This is deliberate. The alternative is a success message that no provider acknowledged.
Expect an occasional support question about it.

**A resubscribe clears a previous unsubscribe.** The Klaviyo subscribe endpoint removes
`UNSUBSCRIBE`, `SPAM_REPORT` and `USER_SUPPRESSED` suppressions from the submitted profile. An
address that unsubscribed earlier is subscribed again when it is submitted again.

**The submit path has no rate limit.** The form is public and unauthenticated. Nimara adds no
counter. Double opt-in means that a fake address receives no mail, so the cost of abuse is request
volume against your Klaviyo account. Configure protection at your firewall if you need it.

**No address is stored or logged.** Nimara forwards the address to Klaviyo and keeps nothing. A
failure event records the provider, the response status, and the error code. It never records the
address, so you cannot tell from a log which submission failed.

### Add another provider

The provider catalog lives in one array, in
`packages/infrastructure/src/newsletter/select.ts`. A second provider is one manifest entry: an
environment schema, a configuration mapping, and a lazy factory. The selector, the allowed values
of `NEWSLETTER_SERVICE`, and the preflight row are all derived from that array, so no caller
changes.
