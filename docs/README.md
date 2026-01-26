# Nimara E-commerce Platform - Documentation

**Version:** 1.0
**Last Updated:** January 26, 2026

Welcome to the Nimara documentation! This guide will help you get started, contribute, and customize Nimara for your needs.

---

## 📖 Documentation Index

### Getting Started

- **[How to Use](./HOW_TO_USE.md)** - Installation, setup, and basic usage
- **[Architecture Overview](../llm-docs/ARCHITECTURE.md)** - System design and structure

### Development

- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project
- **[Code Style Guide](./CODE_STYLE_GUIDE.md)** - Coding standards and conventions

### Customization

- **[Customization Guide](./CUSTOMIZATION.md)** - Adapt Nimara for your needs
- **[Vision & Roadmap](./VISION_AND_ROADMAP.md)** - Future plans and direction

### Community

- **[Contributors](./CONTRIBUTORS.md)** - Community and contribution information
- **[Code of Conduct](../CODE_OF_CONDUCT.md)** - Community guidelines

---

## What is Nimara?

Nimara is an open-source, composable commerce ecosystem designed for building **storefronts** and **marketplaces**. It provides enterprise and startup engineering teams with:

- **SaaS-level speed to start** - Get running quickly with minimal setup
- **Full ownership and control** - Own your code with no vendor lock-in
- **Modular architecture** - Replaceable integrations and features
- **Clean monorepo structure** - Support for multiple frontends and backend components

## What Nimara Provides

- **Next.js Storefront App** - Thin orchestrator that wires everything together
- **Feature Packages** - Reusable features (Product Detail Pages, Product Listing, Cart, Checkout, Account, Search, CMS pages)
- **Integration/Provider Packages** - Replaceable integrations (Saleor, Stripe, Algolia/Meilisearch, CMS, analytics)
- **Design System Package** - shadcn/ui extended with theme tokens
- **Dependency Injection System** - Providers that make packages independent from apps
- **Tooling** - Recipes, CLI commands, and future v0-like builder UI

## Core Technology Stack

**Frontend:**

- Next.js 15 (App Router) with React 19
- TypeScript (strict mode)
- Tailwind CSS 3.x
- Shadcn UI (Radix primitives)
- React Hook Form with Zod validation

**Backend & APIs:**

- Saleor GraphQL API (headless commerce)
- Stripe Payment Element
- NextAuth.js v5 (Auth.js)
- Optional: ButterCMS, Algolia

**Monorepo & Tools:**

- Turborepo with pnpm workspaces
- GraphQL Code Generator
- Vitest (unit), Playwright (E2E)
- Terraform for infrastructure

## Documentation

📚 **[Getting Started Guide](./HOW_TO_USE.md)** - Setup, installation, and basic usage

🤝 **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

🎨 **[Customization Guide](./CUSTOMIZATION.md)** - Adapt Nimara for your needs

📝 **[Code Style Guide](./CODE_STYLE_GUIDE.md)** - Coding standards and conventions

🚀 **[Vision & Roadmap](./VISION_AND_ROADMAP.md)** - Future plans and direction

👥 **[Contributors](./CONTRIBUTORS.md)** - Community and contribution information

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mirumee/nimara-ecommerce.git
cd nimara-ecommerce

# Install dependencies
pnpm install

# Generate GraphQL types
pnpm run codegen

# Start development server
pnpm run dev:storefront
```

The storefront will be available at `http://localhost:3000`.

## Key Concepts

### The Golden Rule

✅ **Apps can import from packages**
❌ **Packages must NEVER import from apps**

### Architecture Layers

```
Domain (packages/domain) - Pure business logic, entities, types
  ↓
Infrastructure (packages/infrastructure) - External API integrations
  ↓
Features (packages/features) - Feature implementations
  ↓
Foundation (packages/foundation) - Core utilities
  ↓
Apps (apps/*) - Orchestration and presentation
```

### Server Components First

- All components are Server Components by default
- Only add `'use client'` when you need:
  - Interactivity (onClick, onChange, event handlers)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window)

### Provider-Driven Architecture

Features depend on **contracts** (ports), not implementations:

```typescript
// ✅ GOOD: Use injected provider
import { useNimara } from "@nimara/core";

export function ProductDetailPage() {
  const { commerce } = useNimara();
  const product = await commerce.productGet({ slug });
}

// ❌ BAD: Direct import of implementation
import { SaleorCommerce } from "@nimara/integrations-saleor";
```

## Project Structure

```
nimara-ecommerce/
├── apps/
│   ├── storefront/          # Main customer-facing Next.js app
│   ├── stripe/              # Stripe integration app
│   ├── automated-tests/     # Playwright E2E tests
│   └── docs/                # Documentation site
├── packages/
│   ├── domain/              # Pure domain models/types
│   ├── features/            # Feature implementations
│   ├── infrastructure/      # External API integrations
│   ├── foundation/          # Core utilities
│   ├── ui/                  # Shared UI components
│   └── translations/        # i18n message catalogs
└── terraform/               # Infrastructure as Code
```

## Stay Connected

- **GitHub**: [mirumee/nimara-ecommerce](https://github.com/mirumee/nimara-ecommerce)
- **Discord**: [Join our community](https://discord.gg/nimara) (coming soon)
- **Twitter**: [@NimaraCommerce](https://twitter.com/NimaraCommerce) (coming soon)
- **Website**: [nimara.dev](https://nimara.dev) (coming soon)

## License

Nimara is released under the MIT License. See [LICENSE](../LICENSE) for details.

---

**Thank you for using Nimara! We're excited to see what you build.** 🚀
