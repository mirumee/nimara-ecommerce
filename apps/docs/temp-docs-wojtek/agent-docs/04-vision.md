# Nimara Vision & Roadmap

This document outlines the vision, goals, and future direction of the Nimara project.

## Vision Statement

Nimara is an open-source, composable commerce ecosystem for building **storefronts** and **marketplaces**. It is designed for enterprise and startup engineering teams who want:

- **SaaS-level speed to start**: Get up and running quickly
- **Full ownership and control**: Own your code, no vendor lock-in
- **Modular architecture**: Replaceable integrations and features
- **Clean monorepo structure**: Enable multiple frontends and backend components

## The North Star

A developer should be able to:

1. **Create a new project quickly** - Minimal setup, maximum productivity
2. **Add storefront and integrations incrementally** - Start simple, grow as needed
3. **Run locally with minimal config** - Dummy profiles work out of the box
4. **Override only what they need** - No forking required
5. **Deploy with predictable infra scripts** - Terraform modules included
6. **Expand into multi-app monorepo** - Vendor panel, admin panel, services

## What We're Building

### Core Components

- **Next.js Storefront App**: Thin orchestrator that wires everything together
- **Feature Packages**: Reusable features (PDP, PLP, Cart, Checkout, Account, Search, CMS pages)
- **Integration/Provider Packages**: Replaceable integrations (Saleor, Stripe, Algolia/Meilisearch, CMS, analytics, etc.)
- **Design System Package**: shadcn/ui extended + theme tokens
- **Dependency Injection System**: Providers that make packages independent from apps
- **Tooling**:
  - Recipes/manifests for declarative configuration
  - CLI commands (`nimara init`, `nimara add`, `nimara override`)
  - Future **v0-like builder** UI that generates projects from selected blocks/providers

## Roadmap

### Milestone 1: Thin Storefront ✅ (In Progress)

- [x] Extract features from app into packages
- [ ] Remove bad imports in packages
- [ ] Normalize actions into `.core.ts` + app wrappers

**Status**: Core extraction complete, cleanup ongoing

### Milestone 2: Clean Architecture Layers

- [ ] Introduce `application` layer with ports
- [ ] Move provider-specific code to integrations/adapters
- [ ] Enforce boundaries with ESLint rules

**Goal**: Clear separation of concerns, testable architecture

### Milestone 3: Profiles and Dummy Providers

- [ ] Local dev profile works without real keys
- [ ] Health endpoints + smoke tests
- [ ] Dummy providers for all integration types

**Goal**: Zero-config local development

### Milestone 4: Manifests + Recipes

- [ ] Declarative integration manifests
- [ ] Recipe validation
- [ ] Recipe-based project generation

**Goal**: Deterministic project composition

### Milestone 5: CLI v0 + Examples

- [ ] `nimara init` - Initialize new project
- [ ] `nimara add` - Add providers/features
- [ ] `nimara override` - Override components
- [ ] 1–2 example projects

**Goal**: Developer-friendly CLI experience

### Milestone 6: v0-like Builder MVP

- [ ] Compose storefront/marketplace blocks
- [ ] Pick providers visually
- [ ] Generate repo + instructions

**Goal**: No-code/low-code project generation

### Milestone 7: Docs + Marketing Alignment

- [ ] Docs follow developer journey
- [ ] Website pages match architecture narrative
- [ ] Clear onboarding path

**Goal**: Excellent developer experience from first visit

## Architecture Evolution

### Current State

- Monorepo with apps and packages
- Feature extraction in progress
- Provider system partially implemented
- Override pattern established

### Target State

- **Thin Apps**: Apps are pure orchestration
- **Thick Packages**: All logic in reusable packages
- **Provider-Driven**: Features depend on contracts, not implementations
- **Override-First**: Customization without forking
- **Recipe-Driven**: Declarative project composition

## Key Principles

### 1. Composable by Default

Features and integrations are interchangeable modules. Swap providers without rewriting features.

### 2. No Circular Dependencies

Packages must never depend on apps. This is enforced and non-negotiable.

### 3. Provider-Driven Architecture

Features depend on **contracts** (ports), not implementations. This enables:
- Easy provider swapping
- Testability (mock providers)
- Multi-app support

### 4. Framework-Aware Boundaries

Next.js-specific concerns (cookies, headers, revalidate) stay in the app layer. Packages remain framework-agnostic.

### 5. Override-First DX

Users can override only what they need without forking. Overrides preserve structure for easier upgrades.

## Future Features

### Short Term (Next 6 Months)

- Complete feature extraction
- Full provider system implementation
- CLI v0 release
- Comprehensive documentation
- Example projects

### Medium Term (6-12 Months)

- v0-like builder UI
- Additional provider integrations
- Marketplace-specific features
- Advanced override system
- Performance optimizations

### Long Term (12+ Months)

- Multi-tenant support
- Advanced analytics
- AI-powered recommendations
- Headless CMS integrations
- Mobile app support

## Community Goals

### Growth

- Active contributor base
- Regular releases
- Community-driven features
- Comprehensive documentation

### Quality

- High test coverage
- Architecture compliance
- Performance benchmarks
- Security best practices

### Adoption

- Production deployments
- Case studies
- Success stories
- Enterprise adoption

## Success Metrics

### Developer Experience

- Time to first deployment: < 30 minutes
- Time to add new feature: < 1 hour
- Time to swap provider: < 15 minutes

### Code Quality

- Zero circular dependencies
- 80%+ test coverage
- All packages framework-agnostic
- Consistent code style

### Community

- 100+ GitHub stars (current baseline)
- 20+ active contributors
- Monthly releases
- Active Discord community

## Contributing to the Vision

We welcome contributions that align with our vision:

1. **Architecture Improvements**: Help us achieve clean architecture
2. **Provider Integrations**: Add new provider implementations
3. **Feature Development**: Build new features following our patterns
4. **Documentation**: Improve docs and examples
5. **Tooling**: Enhance CLI and developer experience

## Resources

- [Architecture Documentation](../architecture.md) - Technical architecture
- [Contributing Guide](./02-contributing.md) - How to contribute
- [Roadmap Details](../nimara_docs/13-roadmap-perfect-oss.md) - Detailed roadmap

## Questions?

- GitHub Discussions: [Join the conversation](https://github.com/mirumee/nimara-ecommerce/discussions)
- Discord: [Chat with the community](https://discord.gg/w4V3PZxGDj)
- Issues: [Report bugs or request features](https://github.com/mirumee/nimara-ecommerce/issues)
