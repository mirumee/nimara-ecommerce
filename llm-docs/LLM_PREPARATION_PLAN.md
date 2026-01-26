# LLM-Friendly Documentation Implementation Plan

**Project:** Nimara E-commerce
**Goal:** Prepare comprehensive documentation to enable LLMs to effectively understand, maintain, and extend the codebase
**Language:** English
**Duration:** 4 weeks

---

## 📋 Executive Summary

This plan outlines a systematic approach to create detailed documentation that helps Large Language Models (LLMs) understand the Nimara e-commerce project architecture, patterns, and conventions. The documentation will enable LLMs to:
- Write new features following established patterns
- Fix bugs with proper context
- Implement solutions that align with architectural decisions
- Navigate the monorepo structure efficiently

---

## 🎯 Phase 1: Foundation (Week 1)

### 1.1 Core Architecture Document
**File:** `ARCHITECTURE.md` (root)

**Content structure:**
```markdown
# Architecture Overview
## System Overview
- High-level diagram
- Technology stack
- Key integrations (Saleor, Stripe, NextAuth)

## Monorepo Structure
- Apps vs Packages distinction
- Dependency graph
- Build and deployment pipeline

## Data Flow
- Request lifecycle (Browser → Next.js → Saleor API)
- Server Components vs Client Components
- Server Actions flow
- GraphQL query/mutation patterns

## Caching Strategy
- Next.js caching layers
- Revalidation strategies
- Cache tags and invalidation

## State Management
- Server state (React Server Components)
- Client state (React hooks)
- URL state (searchParams)
- Form state (Server Actions)

## Authentication & Authorization
- NextAuth.js setup
- Session management
- Protected routes
- API authentication

## Payment Processing
- Stripe integration architecture
- Payment Element flow
- Webhook handling
- Error scenarios

## Internationalization
- Translation system
- Multi-region support
- Currency handling
- Date/time formatting
```

**Deliverables:**
- Complete architecture document with Mermaid diagrams
- Visual representation of data flow
- Integration points documented

---

### 1.2 Coding Conventions
**File:** `CONVENTIONS.md` (root)

**Content structure:**
```markdown
# Development Conventions

## File Naming
- Components: PascalCase (ProductCard.tsx)
- Utilities: camelCase (formatPrice.ts)
- Types: PascalCase with .types.ts suffix
- Constants: UPPER_SNAKE_CASE in constants.ts
- Server Actions: kebab-case with .actions.ts suffix
- API routes: lowercase with kebab-case

## Folder Structure
### Apps
- /src/app - Next.js App Router pages
- /src/components - App-specific components
- /src/lib - App-specific utilities

### Packages
- /src - Main source code
- /src/types - TypeScript definitions
- /src/utils - Utility functions
- /src/components - Reusable components

## Import Order
1. React and Next.js imports
2. External libraries
3. Internal packages (@nimara/*)
4. Relative imports (../, ./)
5. Type imports (import type)
6. CSS/Style imports

## Component Structure
### Server Components (default)
- Async components for data fetching
- No 'use client' directive
- Props should be serializable

### Client Components
- Use 'use client' directive at top
- For interactivity, browser APIs, hooks
- Keep minimal, compose with Server Components

## TypeScript Guidelines
- Strict mode enabled
- Prefer interfaces for objects
- Prefer types for unions/intersections
- Use type inference when obvious
- Explicit return types for public functions
- Use const assertions for constants

## Error Handling
- Try-catch in Server Actions
- Error boundaries for Client Components
- Specific error types from @nimara/domain
- User-friendly error messages
- Logging with context

## Testing Patterns
- Unit tests: *.test.ts
- Integration tests: *.integration.test.ts
- E2E tests: tests/e2e/*.spec.ts
- Test files colocated with source
- Fixtures in dedicated /fixtures folder

## GraphQL Patterns
- Fragments for reusable fields
- Queries in *.graphql files
- Generated types via codegen
- No manual type definitions for GraphQL

## Styling
- Tailwind CSS utility classes
- Shadcn UI components
- CSS modules for complex cases
- Responsive-first approach

## Code Organization Principles
- Single Responsibility Principle
- Composition over inheritance
- Keep components small (<200 lines)
- Extract complex logic to utilities
- Avoid prop drilling - use composition
```

**Deliverables:**
- Complete conventions guide
- Code examples for each pattern
- Do's and Don'ts sections

---

### 1.3 AI Context File
**File:** `.github/copilot-instructions.md`

**Content structure:**
```markdown
# Nimara E-commerce - AI Assistant Context

## Project Type
Full-stack e-commerce platform using Next.js 15 with Saleor headless backend

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Backend:** Saleor GraphQL API
- **Styling:** Tailwind CSS, Shadcn UI
- **Payments:** Stripe Payment Element
- **Auth:** NextAuth.js v5
- **Monorepo:** Turborepo with pnpm workspaces
- **Testing:** Vitest (unit), Playwright (e2e)
- **Deployment:** Vercel

## Project Structure
- `apps/storefront` - Main customer-facing application
- `apps/stripe` - Stripe integration app
- `apps/automated-tests` - E2E test suite
- `apps/docs` - Documentation site
- `packages/domain` - Business logic and entities
- `packages/features` - Feature implementations
- `packages/infrastructure` - External service integrations
- `packages/foundation` - Core utilities and types
- `packages/ui` - Shared UI components

## Key Principles
1. **Server Components by default** - Use 'use client' only when necessary
2. **Type safety first** - All GraphQL types generated via codegen
3. **Composition over configuration** - Build complex UIs from simple components
4. **Performance matters** - Leverage caching, streaming, and partial rendering
5. **Internationalization ready** - All user-facing text must be translatable

## Common Patterns

### Data Fetching
- Server Components fetch data directly
- Use Server Actions for mutations
- GraphQL queries in .graphql files
- Codegen generates TypeScript types

### State Management
- Server state: React Server Components
- Client state: useState/useReducer
- URL state: searchParams
- Form state: Server Actions with useFormState

### Error Handling
- Server Actions return { success: boolean, error?: string }
- Client Components use Error Boundaries
- User-facing errors in translations

### File Naming
- Components: PascalCase.tsx
- Server Actions: kebab-case.actions.ts
- Types: PascalCase.types.ts
- Utils: camelCase.ts

## When Adding New Features
1. Check if similar feature exists
2. Place in appropriate package (domain/features/infrastructure)
3. Add types to @nimara/domain if shared
4. Create GraphQL queries/mutations in .graphql files
5. Run codegen: `pnpm run codegen`
6. Add translations
7. Write tests
8. Update relevant documentation

## When Fixing Bugs
1. Understand the data flow
2. Check Server vs Client Component boundary
3. Verify GraphQL types are up to date
4. Check error handling
5. Add regression test

## Common Gotchas
- Server Components can't use browser APIs or hooks
- Client Components can't receive non-serializable props
- Always revalidate cache after mutations
- Stripe webhooks need verification
- GraphQL schema changes require codegen run

## Code Style
- Use functional components
- Prefer named exports
- Use TypeScript inference when obvious
- Follow import order convention
- Use Tailwind classes, avoid inline styles

## Testing
- Unit tests for utilities and business logic
- Integration tests for Server Actions
- E2E tests for critical user journeys
- Use fixtures for test data

## Documentation
- JSDoc for public APIs
- Inline comments for complex logic
- Update ARCHITECTURE.md for structural changes
- Add ADR for significant decisions
```

**Deliverables:**
- AI context file with project overview
- Quick reference guide
- Common patterns and gotchas

---

## 🎯 Phase 2: Package Documentation (Week 2)

### 2.1 Domain Package Documentation
**File:** `packages/domain/README.md`

**Content:**
- Purpose: Core business logic and entities
- Exported types and interfaces
- Business rules
- Validation logic
- No external dependencies principle
- Usage examples
- API reference

**Additional files:**
- `packages/domain/src/types/README.md` - Type definitions guide
- JSDoc comments for all public APIs

---

### 2.2 Features Package Documentation
**File:** `packages/features/README.md`

**Content:**
- Purpose: Concrete feature implementations
- List of features (cart, checkout, product, user, etc.)
- How features interact with domain layer
- Adding new features guide
- Feature structure template
- Dependencies on other packages

**Per-feature documentation:**
- `packages/features/src/cart/README.md`
- `packages/features/src/checkout/README.md`
- `packages/features/src/product/README.md`
- etc.

Each feature README includes:
- Feature overview
- Data flow
- API surface
- GraphQL operations
- Components provided
- Usage examples

---

### 2.3 Infrastructure Package Documentation
**File:** `packages/infrastructure/README.md`

**Content:**
- Purpose: External service integrations
- Saleor API client
- Stripe integration
- Analytics providers
- Error tracking (Sentry)
- Environment configuration
- Secrets management
- Adding new integrations guide

---

### 2.4 Foundation Package Documentation
**File:** `packages/foundation/README.md`

**Content:**
- Purpose: Core utilities and shared code
- Utility functions catalog
- Hooks reference
- Constants and configurations
- Formatting utilities
- Validation helpers
- Type utilities
- Usage examples for each utility

---

### 2.5 UI Package Documentation
**File:** `packages/ui/README.md`

**Content:**
- Purpose: Shared UI components (Shadcn-based)
- Component catalog
- Theming system
- Customization guide
- Accessibility guidelines
- Component composition patterns
- Storybook links (if applicable)

---

### 2.6 Storefront App Documentation
**File:** `apps/storefront/README.md`

**Content:**
- App overview
- Directory structure explained
- Routing patterns
- Layout system
- Middleware usage
- Environment variables
- Deployment configuration
- Performance optimization
- SEO implementation
- Development workflow

---

## 🎯 Phase 3: Examples & Decision Records (Week 3)

### 3.1 Common Scenarios Examples
**Directory:** `docs/examples/`

**Files to create:**

#### `docs/examples/01-adding-new-page.md`
```markdown
# Adding a New Page

## Overview
Step-by-step guide to add a new page to the storefront.

## Steps
1. Create route folder in app/
2. Create page.tsx with Server Component
3. Add metadata export
4. Fetch data using GraphQL
5. Create necessary components
6. Add translations
7. Update navigation
8. Add tests

## Complete Example
[Full code example]

## Common Pitfalls
[List of gotchas]
```

#### `docs/examples/02-creating-server-action.md`
- Server Action pattern
- Form handling
- Error handling
- Revalidation
- Loading states
- Full example

#### `docs/examples/03-graphql-query.md`
- Creating .graphql file
- Running codegen
- Using generated types
- Error handling
- Caching considerations

#### `docs/examples/04-client-component.md`
- When to use client components
- Composition patterns
- Prop passing
- Event handling
- State management

#### `docs/examples/05-adding-payment-provider.md`
- Integration architecture
- Webhook setup
- Error handling
- Testing strategy

#### `docs/examples/06-internationalization.md`
- Adding translations
- Using translation hooks
- Language switching
- Currency formatting
- Date formatting

#### `docs/examples/07-implementing-feature.md`
- Feature checklist
- Package placement
- GraphQL operations
- Component creation
- Testing
- Documentation

---

### 3.2 Architecture Decision Records
**Directory:** `docs/adr/`

**Template:** `docs/adr/template.md`
```markdown
# [NUMBER]. [TITLE]

Date: YYYY-MM-DD

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- ...

### Negative
- ...

### Neutral
- ...

## Alternatives Considered
What other options were evaluated?

## Implementation Notes
Technical details about implementation if needed.
```

**Initial ADRs to create:**
- `001-turborepo-monorepo.md` - Why Turborepo
- `002-nextjs-app-router.md` - App Router vs Pages Router
- `003-server-components-first.md` - RSC strategy
- `004-graphql-codegen.md` - Type generation approach
- `005-shadcn-ui.md` - UI component library choice
- `006-stripe-payment-element.md` - Payment integration
- `007-saleor-backend.md` - Headless commerce choice
- `008-package-structure.md` - Monorepo organization
- `009-testing-strategy.md` - Testing tools and approach
- `010-deployment-strategy.md` - Vercel and environments

---

### 3.3 Troubleshooting Guide
**File:** `TROUBLESHOOTING.md` (root)

**Content structure:**
```markdown
# Troubleshooting Guide

## Development Setup Issues

### "pnpm install" fails
[Solutions]

### TypeScript errors after pulling changes
[Solutions with codegen]

### Environment variables not working
[Solutions]

## Build Issues

### Turborepo build fails
[Common causes and fixes]

### GraphQL codegen errors
[Solutions]

### Type errors in production build
[Solutions]

## Runtime Issues

### Server Action errors
[Common patterns and fixes]

### Stripe webhook not working
[Debugging steps]

### Saleor API errors
[Connection and auth issues]

### Image optimization fails
[Next.js image config]

## Testing Issues

### E2E tests timing out
[Playwright configuration]

### Mock data not working
[Fixture setup]

## Deployment Issues

### Vercel deployment fails
[Environment variables, build config]

### Environment-specific issues
[develop vs staging vs main]

## Performance Issues

### Slow page loads
[Caching, SSG, ISR strategies]

### Large bundle size
[Code splitting, dynamic imports]

## Common Error Messages
[Specific error messages with solutions]
```

---

## 🎯 Phase 4: Advanced Documentation (Week 4)

### 4.1 Dependency Map
**File:** `DEPENDENCIES.md` (root)

**Content:**
```markdown
# Dependency Map

## Package Dependencies

### Dependency Graph
[Mermaid diagram showing package relationships]

### Apps
#### storefront
Depends on:
- @nimara/domain
- @nimara/features
- @nimara/infrastructure
- @nimara/foundation
- @nimara/ui

#### stripe
Depends on:
- @nimara/domain
- @nimara/infrastructure

### Packages

#### @nimara/features
Depends on:
- @nimara/domain
- @nimara/infrastructure
- @nimara/foundation

#### @nimara/infrastructure
Depends on:
- @nimara/domain

#### @nimara/ui
Depends on:
- @nimara/foundation

#### @nimara/domain
No internal dependencies (core package)

#### @nimara/foundation
No internal dependencies (core package)

## External Dependencies

### Critical Dependencies
[List with version constraints and why]

### Build Dependencies
[Turborepo, TypeScript, etc.]

### Development Dependencies
[Testing, linting, etc.]

## Dependency Rules
1. No circular dependencies
2. Domain and Foundation are leaf packages
3. Apps can depend on any package
4. Packages should minimize dependencies
```

---

### 4.2 Testing Documentation
**File:** `docs/TESTING.md`

**Content:**
```markdown
# Testing Guide

## Testing Philosophy
- Test behavior, not implementation
- Integration tests over unit tests
- Critical paths must have E2E tests
- Server Actions need integration tests

## Unit Testing

### Tools
- Vitest
- React Testing Library
- MSW for API mocking

### What to Test
- Business logic in domain package
- Utility functions
- Validation logic
- Data transformations

### Example
[Code examples]

## Integration Testing

### Server Actions Testing
[Patterns and examples]

### API Integration Testing
[Mocking strategies]

## E2E Testing

### Tools
- Playwright

### Structure
- Page Object Model pattern
- Fixtures for test data
- Reusable utilities

### Critical User Journeys
1. Browse products
2. Add to cart
3. Checkout flow
4. Payment processing
5. Order confirmation

### Writing E2E Tests
[Guidelines and examples]

## Test Data Management

### Fixtures
[How to create and use fixtures]

### Factories
[Test data generation]

## Running Tests

### Local Development
```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e
```

### CI/CD
[CI configuration]

## Coverage
- No strict coverage requirements
- Focus on critical paths
- Business logic should be well-covered

## Debugging Tests
[Tips and tools]
```

---

### 4.3 Project Glossary
**File:** `GLOSSARY.md` (root)

**Content:**
```markdown
# Project Glossary

## Domain Terms

### Channel
A sales channel in Saleor (e.g., US Store, EU Store)

### Checkout
Multi-step process for completing a purchase

### Collection
Curated group of products

### Variant
Specific version of a product (size, color, etc.)

[etc...]

## Technical Terms

### Server Component
React component that runs only on the server

### Server Action
Function that runs on the server, called from client

### RSC
React Server Components

### SSG
Static Site Generation

### ISR
Incremental Static Regeneration

[etc...]

## Saleor-Specific Terms

### GraphQL Playground
Interactive API explorer

### Webhook
Event notification from Saleor

[etc...]

## Stripe-Specific Terms

### Payment Intent
Object representing payment process

### Payment Element
Embeddable payment form

[etc...]
```

---

### 4.4 Performance Guide
**File:** `docs/PERFORMANCE.md`

**Content:**
```markdown
# Performance Optimization Guide

## Next.js Optimizations

### Caching Strategy
[Detailed caching explanation]

### Static Generation
[When and how to use SSG]

### Dynamic Rendering
[When to use dynamic]

### Streaming
[Using Suspense and loading.tsx]

## Image Optimization
[Next/Image configuration and best practices]

## Font Optimization
[Next/Font usage]

## Bundle Size
[Code splitting strategies]

## Monitoring
[Performance metrics and tools]

## Lighthouse Scores
[Target scores and optimization tips]
```

---

### 4.5 Security Guide
**File:** `docs/SECURITY.md`

**Content:**
```markdown
# Security Guidelines

## Authentication
[NextAuth configuration and best practices]

## Authorization
[Role-based access control]

## API Security
[Saleor API token management]

## Payment Security
[Stripe security best practices]

## Environment Variables
[Secrets management]

## CORS Configuration
[API security]

## XSS Prevention
[Input sanitization]

## CSRF Protection
[Next.js built-in protection]

## Rate Limiting
[Implementation guidelines]

## Security Headers
[Configuration]

## Reporting Vulnerabilities
[Process]
```

---

### 4.6 Migration Guides
**Directory:** `docs/migrations/`

**Purpose:** Document breaking changes and migration paths

**Template:** `docs/migrations/template.md`
```markdown
# Migration: [TITLE]

## Overview
What changed and why

## Breaking Changes
List of breaking changes

## Migration Steps
Step-by-step guide

## Code Examples
Before and after

## Rollback Plan
If things go wrong

## Timeline
Deprecation schedule
```

---

## 📊 Documentation Checklist

### Phase 1 ✅
- [ ] ARCHITECTURE.md with diagrams
- [ ] CONVENTIONS.md with examples
- [ ] .github/copilot-instructions.md

### Phase 2 ✅
- [ ] packages/domain/README.md + JSDoc
- [ ] packages/features/README.md + per-feature docs
- [ ] packages/infrastructure/README.md
- [ ] packages/foundation/README.md
- [ ] packages/ui/README.md
- [ ] apps/storefront/README.md (enhanced)

### Phase 3 ✅
- [ ] docs/examples/ (7 example guides)
- [ ] docs/adr/ (10 initial ADRs)
- [ ] TROUBLESHOOTING.md

### Phase 4 ✅
- [ ] DEPENDENCIES.md with diagrams
- [ ] docs/TESTING.md
- [ ] GLOSSARY.md
- [ ] docs/PERFORMANCE.md
- [ ] docs/SECURITY.md
- [ ] docs/migrations/ structure

---

## 🔧 Documentation Standards

### Writing Guidelines
1. **Use present tense** - "The system processes" not "The system will process"
2. **Be specific** - Include code examples, file paths, and exact commands
3. **Use diagrams** - Mermaid.js for architecture and flow diagrams
4. **Link related docs** - Cross-reference between documents
5. **Include examples** - Show real code from the project
6. **Keep updated** - Documentation is code; review during PRs

### Diagram Standards
Use Mermaid.js for:
- Architecture diagrams (graph)
- Sequence diagrams (sequenceDiagram)
- Flow charts (flowchart)
- Entity relationships (erDiagram)
- State diagrams (stateDiagram)

### Code Example Standards
```typescript
// ✅ Good - Complete, runnable example
// src/app/products/page.tsx
import { getProducts } from '@nimara/features/products';

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// ❌ Bad - Incomplete, pseudo-code
// Somewhere in your code...
const products = getProducts(); // Get the products
return <Component />; // Render component
```

### JSDoc Standards
```typescript
/**
 * Formats a price value according to the specified currency and locale.
 *
 * @param amount - The numeric price amount (e.g., 19.99)
 * @param currency - ISO 4217 currency code (e.g., "USD", "EUR")
 * @param locale - BCP 47 language tag (e.g., "en-US", "pl-PL")
 * @returns Formatted price string (e.g., "$19.99", "19,99 €")
 *
 * @example
 * ```typescript
 * formatPrice(19.99, 'USD', 'en-US') // Returns: "$19.99"
 * formatPrice(19.99, 'EUR', 'pl-PL') // Returns: "19,99 €"
 * ```
 *
 * @see {@link formatCurrency} for additional formatting options
 * @see {@link SUPPORTED_CURRENCIES} for list of supported currencies
 */
export function formatPrice(
  amount: number,
  currency: string,
  locale: string
): string {
  // Implementation
}
```

---

## 🎯 Success Criteria

### LLM can successfully:
1. ✅ Understand project architecture without asking clarifying questions
2. ✅ Add new features following established patterns
3. ✅ Fix bugs by understanding data flow and dependencies
4. ✅ Navigate monorepo structure efficiently
5. ✅ Write code that follows conventions automatically
6. ✅ Suggest improvements aligned with architectural decisions
7. ✅ Handle edge cases documented in troubleshooting guide
8. ✅ Write tests following established patterns
9. ✅ Understand security and performance implications

### Documentation quality:
1. ✅ Complete - covers all aspects of development
2. ✅ Accurate - reflects current codebase state
3. ✅ Detailed - includes examples and edge cases
4. ✅ Discoverable - easy to find relevant information
5. ✅ Maintainable - can be updated easily
6. ✅ Consistent - follows established format

---

## 📈 Maintenance Plan

### Ongoing Documentation Tasks
1. **PR Documentation Review** - Each PR should update relevant docs
2. **Quarterly Review** - Review all docs for accuracy
3. **ADR for Major Changes** - Create ADR for significant decisions
4. **Example Updates** - Keep examples in sync with code
5. **Dependency Updates** - Update DEPENDENCIES.md when packages change

### Documentation Ownership
- Architecture docs: Tech Lead
- Package docs: Package maintainers
- Examples: Senior developers
- ADRs: Decision makers
- Troubleshooting: Entire team (crowdsourced)

---

## 🚀 Getting Started

### Week 1 Priority
Start with these three documents - they provide the foundation:
1. ARCHITECTURE.md
2. CONVENTIONS.md
3. .github/copilot-instructions.md

These will immediately improve LLM's ability to work with the codebase.

### Team Responsibilities
- **Week 1:** Tech lead + 1 senior dev
- **Week 2:** All package maintainers (parallel work)
- **Week 3:** Senior devs create examples, tech lead writes ADRs
- **Week 4:** Distributed among team

---

## 📝 Notes

### Tools to Help
- **Mermaid Live Editor** - https://mermaid.live/ (diagram creation)
- **TypeDoc** - Generate API docs from JSDoc (if needed)
- **VSCode Extensions:**
  - Markdown All in One
  - Markdown Preview Mermaid
  - Code Spell Checker

### References
- [Divio Documentation System](https://documentation.divio.com/)
- [ADR Templates](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Next.js Documentation](https://nextjs.org/docs) (as inspiration)
- [Write the Docs](https://www.writethedocs.org/)

---

**Document Version:** 1.0
**Last Updated:** January 26, 2026
**Author:** Development Team
**Status:** Ready for Implementation
