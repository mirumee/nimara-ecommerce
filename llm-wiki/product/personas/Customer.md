**Summary**: EXPERIENCE persona — the end buyer after purchase: has an order, an inbox, and expectations. Not a segment Nimara sells to: their post-purchase experience is the quality bar for fulfillment communication, reviews, and account features.

**Tags**: #persona #experience #end-user #storefront #post-purchase
**Created**: 2026-07-08T00:00:00+00:00
**Last Updated**: 2026-07-08T00:00:00+00:00

---
## Content

### Goals
- Always know where their order stands — confirmation, fulfillment, and any change, communicated without them having to ask.
- Get help, returns, and refunds without friction when something goes wrong.
- Have their voice matter: share an opinion after receiving the product and see it published.

### Pain Points
- Post-purchase silence: no fulfillment updates, invoices that need to be requested, support that requires digging for an email address.
- Badly timed or broken review requests — invited before the product arrives, or a review submitted into a void that never publishes (unstaffed pre-moderation queue).
- Account and privacy friction: hard-to-find data export or deletion, unclear what happens to their reviews and history afterwards.

### Behavior Patterns
- **Frequency:** Bursty — engaged around delivery and any problem; email is the primary channel, the account panel is secondary.
- **Technical level:** Irrelevant — a consumer who expects things to simply work.
- **Decision process:** One good post-purchase experience creates repeat purchases and reviews; one bad one creates a chargeback, a public complaint, or silence.
- **Current solution:** Expectations set by marketplace-grade standards — tracked parcels, instant confirmations, visible reviews.

### Key Quote
> "The email asked me to review it — I did, three weeks ago. Where is it?"

### Product Implications
- The verified-review loop lives on this persona: invitation timed from fulfillment (configurable delay), a submission window, and fail-alive publishing defaults so feedback never disappears into an unwatched queue (see the User Reviews epic).
- Transactional email is the product surface here — reliable order and fulfillment notifications through the email-provider adapter are the credibility floor.
- Reliable fulfillment data is a prerequisite: invitation timing and review windows inherit their accuracy from stores marking orders fulfilled (an [[Ecommerce Manager]] workflow).
- GDPR flows (data export, account deletion, review anonymization vs. deletion) must be designed, not improvised — this persona is where those requests come from.

## Related Notes
[[Shopper]]
[[Storefront Developer]]
[[Ecommerce Manager]]
[[Anti-Persona - No-Code Solo Merchant]]
