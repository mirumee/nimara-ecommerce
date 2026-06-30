**Summary**: The single most useful QA reference — which environments and channels exist, what's reachable, what needs credentials, and what is backend-only / not observable from the storefront.

**Tags**: #qa #environments #access #channels #agents
**Created**: 2026-06-30T00:00:00+00:00
**Last Updated**: 2026-06-30T00:00:00+00:00

---
## Content

### Storefronts (publicly reachable, no login for guest flows)
| Host | Role | Notes |
|---|---|---|
| `dev.nimara.store` | primary dev storefront | active `NEXT_PUBLIC_STOREFRONT_URL`; default for retests |
| `stage.nimara.store` | staging storefront | backend = Saleor `marina-stg` |
| `demo.nimara.store` | public demo store | closest-to-prod public storefront |
| `nimara.store` | **marketing / landing page — NOT a store** | no `/search`, no `/products` (`/search` → 404). Never measure/test it as the storefront. |
| `marketplace.dev.nimara.store` / `marketplace.nimara.store` | vendor app (sign-up, vendor panel) | separate Next.js app |

### Channels = URL prefix (critical)
The channel is the path prefix, and it scopes **currency, available countries, and the product catalog**:
- `/` → **US** channel (Americas + JP/QA country list).
- `/gb` → **GB** channel (EU/Asia/ME — large country list incl. CN, RU, JP, IN, etc.).
- Switch channel via the header "Region and language settings" picker; it resets to the **channel home** (path is not preserved). A product can be published on one channel and 404 on another.

### Backends — referenced by tickets, NOT directly observable by a storefront agent
| System | Example URL | Access |
|---|---|---|
| Saleor dashboard (dev) | `marina-dev.eu.saleor.cloud` | login required — agents usually **do not have it** |
| Saleor dashboard / GraphQL (stage) | `marina-stg.eu.saleor.cloud/graphql/` | needs a token / logged-in session |
| ERP | `erp-dev.marina.mirumee.rocks` | login required; **often disabled/inactive** |
| Docs site | `dev.docs.nimara.store` | **behind Vercel SSO** → 401, redirects to `vercel.com/login`. Untestable without Vercel access / bypass token / public URL. |

### Rule of thumb for agents
- **Storefront-observable** (checkout, cart, search, address forms, SEO/meta, sitemap, perf) → you can test.
- **Backend-only** (Saleor order/transaction internals, ERP fulfilment/stock, `checkout.user` field) → you **cannot** verdict it; route to a developer (see [[Known Flaky, Blocked & Backend-Only]]).
- If access is missing, **STOP and ASK** — do not fabricate data. Batch all access requests at once in machine-safe form (code blocks for secrets, explicit env URLs).

## Related Notes
[[Quality & Testing (MOC)]]
[[Known Flaky, Blocked & Backend-Only]]
[[Test Data & Fixtures]]
