# Vision & Roadmap

**Last Updated:** January 26, 2026

This document outlines Nimara's vision, goals, and future direction.

---

## Vision Statement

Nimara is an open-source, composable commerce ecosystem for building **storefronts** and **marketplaces**. It is designed for enterprise and startup engineering teams who want:

- **SaaS-level speed to start** - Get up and running quickly
- **Full ownership and control** - Own your code, no vendor lock-in
- **Modular architecture** - Replaceable integrations and features
- **Clean monorepo structure** - Enable multiple frontends and backend components

---

## The North Star

A developer should be able to:

1. **Create a new project quickly** - Minimal setup, maximum productivity
2. **Add storefront and integrations incrementally** - Start simple, grow as needed
3. **Run locally with minimal config** - Dummy profiles work out of the box
4. **Override only what they need** - No forking required
5. **Deploy with predictable infra scripts** - Terraform modules included
6. **Expand into multi-app monorepo** - Vendor panel, admin panel, services

---

## Roadmap

### Milestone 1: Thin Storefront ✅ (In Progress)

**Goals:**

- Extract features from app into packages
- Remove bad imports in packages
- Normalize actions into `.core.ts` + app wrappers

**Status:** Core extraction complete, cleanup ongoing

**Key Achievements:**

- [x] Feature packages extracted (cart, checkout, product pages)
- [x] Provider system implemented
- [ ] Complete action normalization
- [ ] Remove all circular dependencies

---

### Milestone 2: Clean Architecture Layers

**Goals:**

- Introduce `application` layer with ports
- Move provider-specific code to integrations/adapters
- Enforce boundaries with ESLint rules

**Outcome:** Clear separation of concerns, testable architecture

**Tasks:**

- [ ] Define port interfaces for all integrations
- [ ] Create application layer
- [ ] Move Saleor-specific code to adapters
- [ ] Add ESLint rules to enforce boundaries
- [ ] Update documentation

---

### Milestone 3: Profiles and Dummy Providers

**Goals:**

- Local dev profile works without real keys
- Health endpoints + smoke tests
- Dummy providers for all integration types

**Outcome:** Zero-config local development

**Tasks:**

- [ ] Implement dummy commerce provider
- [ ] Implement dummy payment provider
- [ ] Implement dummy search provider
- [ ] Create local development profile
- [ ] Add health check endpoints
- [ ] Create smoke test suite

---

### Milestone 4: Manifests + Recipes

**Goals:**

- Declarative integration manifests
- Recipe validation
- Recipe-based project generation

**Outcome:** Deterministic project composition

**Tasks:**

- [ ] Define recipe schema
- [ ] Implement recipe parser
- [ ] Create recipe validator
- [ ] Add recipe-based code generation
- [ ] Document recipe format

---

### Milestone 5: CLI v0 + Examples

**Goals:**

- `nimara init` - Initialize new project
- `nimara add` - Add providers/features
- `nimara override` - Override components
- 1–2 example projects

**Outcome:** Developer-friendly CLI experience

**Tasks:**

- [ ] Build CLI foundation
- [ ] Implement `init` command
- [ ] Implement `add` command
- [ ] Implement `override` command
- [ ] Create B2C example project
- [ ] Create B2B example project
- [ ] Create marketplace example project

---

### Milestone 6: v0-like Builder MVP

**Goals:**

- Compose storefront/marketplace blocks
- Pick providers visually
- Generate repo + instructions

**Outcome:** No-code/low-code project generation

**Tasks:**

- [ ] Design builder UI
- [ ] Implement block composition
- [ ] Implement provider selection
- [ ] Build code generator
- [ ] Add preview functionality
- [ ] Create deployment wizard

---

### Milestone 7: Docs + Marketing Alignment

**Goals:**

- Docs follow developer journey
- Website pages match architecture narrative
- Clear onboarding path

**Outcome:** Excellent developer experience from first visit

**Tasks:**

- [ ] Restructure documentation
- [ ] Create video tutorials
- [ ] Build interactive demos
- [ ] Launch marketing website
- [ ] Create case studies

---

## Key Principles

### 1. Composable by Default

Features and integrations are interchangeable modules. Swap providers without rewriting features.

**Example:**

```typescript
// Switch from Saleor to Shopify without changing features
const providers = {
  commerce: new ShopifyCommerce({ ... }) // Was: SaleorCommerce
};
```

### 2. No Circular Dependencies

Packages must never depend on apps. This is enforced and non-negotiable.

**Why:** Enables reusability, testing, and multi-app architectures.

### 3. Provider-Driven Architecture

Features depend on **contracts** (ports), not implementations.

**Benefits:**

- Easy provider swapping
- Testability (mock providers)
- Multi-app support

### 4. Framework-Aware Boundaries

Next.js-specific concerns (cookies, headers, revalidate) stay in the app layer. Packages remain framework-agnostic.

**Why:** Packages can be reused in different frameworks or contexts.

### 5. Override-First Developer Experience

Users can override only what they need without forking. Overrides preserve structure for easier upgrades.

**Why:** Easier maintenance and upgrade path.

---

## Future Features

### Short Term (Next 6 Months)

- **Complete feature extraction** - All features in packages
- **Full provider system** - All integrations follow provider pattern
- **CLI v0 release** - Basic CLI for project management
- **Comprehensive documentation** - Updated guides and tutorials
- **Example projects** - B2B, B2C, and Marketplace examples

### Medium Term (6-12 Months)

- **v0-like visual builder** - No-code project generation
- **Multi-tenant marketplace** - Built-in marketplace support
- **Vendor panel application** - Marketplace vendor management
- **Admin panel application** - Backend administration
- **Advanced theming system** - Visual theme customization
- **Plugin marketplace** - Community plugins and extensions

### Long Term (12+ Months)

- **AI-powered commerce assistant** - Smart product recommendations
- **Advanced analytics dashboard** - Business intelligence
- **Multi-channel orchestration** - Omnichannel commerce
- **Headless CMS deep integration** - Content management
- **Enterprise features** - SSO, RBAC, audit logs
- **Self-hosted option** - Docker/Kubernetes deployment

---

## Target State Architecture

### Thin Apps

- Apps are pure orchestration
- No business logic in apps
- Only routing, DI, and framework-specific code

### Thick Packages

- All logic in reusable packages
- Framework-agnostic
- Testable and composable

### Provider-Driven

- Features depend on contracts, not implementations
- Easy to swap providers
- Multiple providers can coexist

### Override-First

- Customization without forking
- Preserve upgrade path
- CLI-assisted overrides

### Recipe-Driven

- Declarative project composition
- Versioned integrations
- Reproducible builds

---

## Architecture Evolution

### Current State

```
├── apps/storefront          # Contains some business logic
├── packages/features        # Some features still coupled to app
├── packages/infrastructure  # Mixed with Saleor-specific code
```

**Issues:**

- Some circular dependencies
- Business logic in app layer
- Provider pattern partially implemented

### Target State

```
├── apps/storefront          # Pure orchestration, routing, DI
├── packages/application     # Use cases with ports
├── packages/features        # Pure features depending on ports
├── packages/integrations    # Provider implementations
├── packages/domain          # Pure domain models
```

**Benefits:**

- Zero circular dependencies
- Clear layer boundaries
- Easy provider swapping
- Framework-agnostic packages

---

## Community & Ecosystem

### Open Source First

Nimara is open source and community-driven. We welcome contributions from everyone.

### Plugin Ecosystem

In the future, we plan to support:

- Community plugins
- Theme marketplace
- Integration marketplace
- Example projects library

### Enterprise Support

For enterprises needing:

- Priority support
- Custom integrations
- Training and consulting
- SLA guarantees

---

## Measuring Success

### Developer Experience Metrics

- **Time to first commit** - How quickly can a dev contribute?
- **Time to production** - How fast can you deploy?
- **Developer satisfaction** - NPS score from users
- **Community growth** - GitHub stars, contributors, forks

### Technical Metrics

- **Zero circular dependencies** - Enforced by tooling
- **Test coverage** - >80% for critical paths
- **Build time** - <5 minutes for full build
- **Bundle size** - Optimized for performance

---

## Get Involved

### For Developers

- **Contribute code** - See [Contributing Guide](./CONTRIBUTING.md)
- **Report bugs** - Open [GitHub Issues](https://github.com/mirumee/nimara-ecommerce/issues)
- **Suggest features** - Start a [Discussion](https://github.com/mirumee/nimara-ecommerce/discussions)

### For Companies

- **Sponsor development** - Support open source
- **Share use cases** - Help us understand needs
- **Provide feedback** - Guide our roadmap

### For Content Creators

- **Write tutorials** - Help others learn
- **Create videos** - Show Nimara in action
- **Build examples** - Showcase what's possible

---

## Stay Updated

- **GitHub**: [mirumee/nimara-ecommerce](https://github.com/mirumee/nimara-ecommerce)
- **Discord**: [Join our community](https://discord.gg/nimara) (coming soon)
- **Twitter**: [@NimaraCommerce](https://twitter.com/NimaraCommerce) (coming soon)
- **Newsletter**: [Subscribe for updates](https://nimara.dev) (coming soon)

---

**Join us in building the future of composable commerce!** 🚀
