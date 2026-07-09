**Summary**: Assumptions the strategy rests on and the evidence that would change the recommendations — review before committing roadmap.

**Tags**: #strategy #assumptions #risk #openquestions
**Created**: 2026-06-16T00:00:00+00:00
**Last Updated**: 2026-06-16T00:00:00+00:00

---
## Content

- **IaC usage assumption:** Developers use the bundled Terraform/Vercel scripts directly. If they bypass these for manual DevOps pipelines, the value of the [[1 - Zero-to-Deploy CLI]] diminishes. Validate by researching active repository forks and IaC usage rates.
- **UCP dominance assumption:** Google's UCP becomes the dominant, universally accepted agentic-transaction standard. If competing standards (e.g. OpenAI's Agentic Commerce Protocol) fragment the market, the abstract schema layer must avoid single-vendor protocol lock-in (affects [[3 - UCP-MCP Agentic Discovery]]).
- **Saleor capacity assumption:** Saleor's GraphQL API can performantly support split-payment mutations and complex multi-vendor order routing. If Saleor struggles with the DB-level isolation marketplace vendor domains need, a pivot toward a more modular framework (Medusa v2, custom DB views) may be required (affects [[2 - Stripe Connect Split Payments]]).

## Related Notes
[[1 - Zero-to-Deploy CLI]]
[[2 - Stripe Connect Split Payments]]
[[3 - UCP-MCP Agentic Discovery]]
[[Marketplace & Agentic Commerce Bets]]
[[Product Strategy 2026 (MOC)]]
