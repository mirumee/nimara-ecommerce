---
type: "Epic"
title: "LLM Product Discovery"
description: "Epic hypothesis statement for AI-powered natural-language product discovery, backed by classic search and catalog browsing."
tags:
  - "epic"
  - "discovery"
  - "ai-search"
  - "conversion"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
status: "analyzing"
owner: "Michał Ociepka"
epic_type: "Business epic"
---

## Value Statement

**For** [Customer](product/personas/Customer.md) shopping a Polish marketplace who describes a need in their own words rather than knowing an exact product
**who** face a full catalog to browse and no way to go from need to a confident choice quickly
**the** LLM Product Discovery epic
**is a** built-in AI search that returns a curated shortlist of fitting products, backed by classic search and catalog browsing
**that** shortens the path from need to purchase, favors own exclusive products when they genuinely fit, and turns unmatched requests into demand insight
**unlike** any comparable Polish marketplace — none offers AI-powered search today
**our solution** is the portal's headline differentiator, provider-agnostic, and monitored for cost and quality from day one.

## Business Outcomes

- Higher conversion by shortening the path from need to a confident choice
- Marketable differentiator — the most helpful place to shop in its category; no Polish marketplace benchmark exists
- Increased visibility of own exclusive products within suggestions
- Demand-insight stream: what customers ask for that the catalog doesn't yet offer, to guide assortment and partner acquisition

## MVP

Single question, single set of suggestions — no multi-turn conversation. AI search in the homepage hero: customer describes need in natural language, receives 3–5 product suggestions, each with a 1–2 sentence explanation of why it fits, each linking to the standard product page. "Show more suggestions" produces a further set. Own exclusive products favored when they fit, marked with an exclusivity badge. Honest handling of out-of-offer requests: openly states unavailable, proposes closest alternatives, never invents products, records the request as demand insight. Suspended-partner and seasonally-unavailable products never suggested. Graceful fallback to classic search when AI search is down. Classic search: typo-tolerant, suggestions while typing, search by name, partner, category, location, tags. Catalog browsing: filters (price, category, location), sorting, per-filter result counts. Product cards: photo, name, location, price, rating, exclusivity badge. Admin controls: exclusion list, manual rules, review of anonymized queries / click-through / unmatched requests. Usage limits per visitor to keep operating cost predictable.

Buys: proof that customers adopt AI search and that it moves conversion — before deeper investment — plus a first read on operating cost at real traffic.

## Hypothesis Falsification

If AI search operating cost grows disproportionately to conversion lift, or suggestion quality can't be kept trustworthy, fall back to classic search + catalog browsing as the primary discovery experience and retire the AI entry point.

## Nonfunctional Requirements (NFRs)

- AI search never fabricates products — out-of-offer requests get honest "not available" + closest alternatives
- Graceful degradation: AI search failure routes the customer to classic search, never a dead end
- SSR-safe (Next.js App Router); discovery surfaces must not degrade page load
- Usage limits / abuse protection on the free-text search so operating cost stays predictable
- AI search provider swappable — no mandatory vendor lock-in; cost and quality monitored
- Suggestions respect availability in real time (suspended partners, seasonal products excluded)

## Constraints, Dependencies & Risks

- Ongoing AI-search cost grows with traffic — without cost projections, usage limits, and monitoring the flagship feature could become disproportionately expensive; **12-month cost projection with growth buffer decided before implementation starts**
- Irrelevant or fabricated suggestions would undermine trust in the headline differentiator — QA and admin curation essential from day one
- Suggestion quality depends on completeness of partner offers; gaps in product information surface as poor recommendations — minimum required product info per offer must be defined and enforced at onboarding
- No Polish-market benchmark — customer adoption of AI search is unproven; real conversion contribution must be measured, not assumed
- Free-text search attracts off-topic/abusive use — must be limited and moderated

## In Scope

- AI search in homepage hero: natural-language request → 3–5 suggestions, each with a why-it-fits explanation, each linking to the standard product page
- "Show more suggestions" producing a further set of matches
- Own exclusive products favored when they genuinely fit, marked with a dedicated exclusivity badge
- Honest out-of-offer handling: states unavailable, proposes closest alternatives, records request as demand insight, never invents products
- Suspended-partner and seasonally-unavailable products excluded from suggestions
- Graceful fallback from AI search to classic search
- Classic search: typo-tolerant, suggestions while typing, search by name, partner, category, location, tags
- Catalog browsing: filters (price, category, location, other attributes), sorting, visible per-filter result counts
- Product cards across discovery surfaces: photo, name, location, price, rating, exclusivity badge where applicable
- Admin controls: exclusion list, manual rules ("for requests like X, suggest Y"), review of anonymized queries, click-through, and unmatched requests
- Abuse protection / usage limits per visitor

## Out of Scope

- Shopping cart, checkout, and payments (separate epic)
- SEO, URL structure, and site performance optimization (separate epic)
- Multi-language storefront — Polish only at launch; English and Ukrainian deferred to post-MVP
- Voice-enabled AI search (post-MVP)
- Conversational, multi-turn AI assistant — launch is a single question with a single set of suggestions
- Customer reviews and ratings submission (separate epic; ratings only displayed on discovery surfaces)

## User Stories

- As a customer, I want to describe what I'm looking for in my own words, so that I get a shortlist of fitting products without browsing the whole catalog
- As a customer, I want each suggestion to come with a short explanation of why it fits, so that I can quickly decide which product to explore
- As a customer, I want more suggestions on demand when the first set doesn't convince me, so that I don't have to rephrase from scratch
- As a customer asking about something the portal doesn't offer, I want an honest answer with the closest alternatives, so that I can trust the suggestions I do receive
- As a customer who knows what I want, I want a classic search that forgives typos and suggests results as I type, so that I can get to a specific product fast
- As a customer, I want to browse the catalog with filters and sorting that match how I shop, so that I can narrow options on my own terms
- As a portal administrator, I want to exclude products from AI suggestions and define manual rules for sensitive requests, so that suggestions stay on-brand and appropriate
- As a portal administrator, I want to see anonymized requests, which suggestions get clicked, and which requests found no match, so that I can improve the offer and measure whether AI search earns its keep

## Acceptance Criteria

- Given a customer describes their need, when they submit, then they receive 3–5 relevant suggestions, each with a 1–2 sentence explanation, each linking to the standard product page
- Given the first set doesn't fit, when the customer asks for more, then a further set of 3–5 different suggestions is shown
- Given a customer asks about a product outside the offer, then the response openly states it is not available, offers closest alternatives, and never presents a non-existent product
- Given a partner is suspended or a product is seasonally unavailable, then that product never appears in AI suggestions
- Given own exclusive products genuinely match, then they are favored and carry the exclusivity badge
- Given AI search is temporarily unavailable, then the customer can continue with classic search without a dead end
- Given a customer uses classic search with a typo, then relevant results are still found and suggestions appear while typing
- Given a customer applies catalog filters, then results update immediately and each filter shows how many results it leads to
- Given an administrator adds an exclusion or manual rule, then AI suggestions respect it from that point on
- Given administrators review the discovery dashboard, then they can see anonymized queries, click-through, and requests with no matching products

## Open Questions

- Which AI-search approach offers the lowest ongoing operating/maintenance cost, and what are realistic 12-month projections with a growth buffer? (agency recommendation expected)
- What is the minimum product information partners must provide for accurate suggestions, and how is it enforced at offer onboarding?
- How should the assistant behave when a customer writes in English on the Polish site — respond in English against the Polish catalog, or propose switching language once English is supported?
- Should customers be able to flag "notify me when something similar is available" for unmatched requests, and who follows up?
- Is presenting two search entry points (AI + classic) on one page sensible, and how do we make their roles obvious?
- Which success measures do we commit to for the first months (share of visitors using AI search, click-through, suggestion-to-purchase conversion)?
