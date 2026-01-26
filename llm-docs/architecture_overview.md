# Nimara E-commerce Project Architecture Documentation

## 1. Introduction
This document serves as a roadmap for the Nimara E-commerce project architecture. It aims to facilitate understanding of the structure, dependencies, and key design patterns, which is essential for planning and performing refactoring.

## 2. Project Structure (High-Level)
The project is organized as a **Monorepo** managed by `pnpm` and `turbo`.

### Main Directories
- **`apps/`**: End applications (deployables).
  - `storefront`: Main online store based on Next.js (App Router).
  - `stripe`: Application/service handling Stripe integration (likely webhooks/checkout).
  - `docs`: Project documentation (Next.js).
  - `automated-tests`: E2E tests based on Playwright.
- **`packages/`**: Shared libraries containing most business logic and UI.
  - `domain`: Pure domain definitions, types, objects (Entities/Value Objects).
  - `infrastructure`: Adapter layer, external API communication (Saleor, Stripe, CMS), Use Case implementations.
  - `features`: Ready-made business functionalities (likely "Smart UI" components connected with logic).
  - `ui`: Visual component library ("Dumb Components") - Design System.
  - `config`, `tsconfig`, `eslint-config-custom`: Shared configurations.
  - `codegen`: GraphQL types generator.
- **`terraform/`**: Infrastructure as Code (IaC) for managing cloud resources (Vercel).

## 3. Detailed Application Architecture

The project uses an approach close to **Clean Architecture / Hexagonal Architecture** (Ports and Adapters), with a clear separation of layers.

### Layers (from inside out)

#### 1. Domain Layer (`packages/domain`)
- **Goal**: Defines the domain language (Ubiquitous Language) and basic data structures.
- **Dependencies**: None (or minimal, utility). Pure TypeScript.
- **Content**:
  - `objects/`: Entities and Value Objects, e.g., `Cart.ts`, `Product.ts`, `Money.ts`, `Result.ts`.
  - `consts.ts`: Domain constants.
- **Important**: Objects here are "pure" and independent of external APIs.

#### 2. Infrastructure Layer (`packages/infrastructure`)
- **Goal**: Implementation of application logic (Use Cases) and communication with the outside world (Adapters).
- **Dependencies**: Depends on `packages/domain`.
- **Internal Structure**: Divided into domain modules: `cart`, `checkout`, `payment`, `search`, etc.
- **Key Elements**:
  - **Use Cases**: E.g., `cart-get-use-case.ts`. These are functions executing specific business actions. Often accept dependencies (injection) and return `Result<T, E>`.
  - **Adapters (Providers)**: E.g., `cart/saleor/infrastructure/cart-get-infra.ts`. Implement interfaces defined for Use Cases.
  - **Serializers**: Transform data from external API (e.g., GraphQL Fragments from Saleor) into domain objects (`CartFragment` -> `Cart`). This acts as an **Anti-Corruption Layer (ACL)**.
  - **GraphQL**: Queries and mutations specific to a given provider (Saleor).

#### 3. Features Layer (`packages/features`)
- **Goal**: Delivering ready-made UI fragments connected with business logic.
- **Dependencies**: Uses `infrastructure` (for fetching data) and `ui` (for display).
- **Content**: Modules like `cart`, `checkout`, `product-detail-page`. Likely contains containers/smart components that "bring the application to life".

#### 4. Application / Presentation Layer (`apps/storefront`)
- **Goal**: Entry point (Next.js App Router), routing, SSR, configuration, dependency composition.
- **Dependencies**: Binds everything together (`features`, `infrastructure`, `domain`).
- **Important Files**:
  - `src/services/registry.ts` (presumably): Place where concrete implementations (e.g., Saleor) are injected into Use Cases.
  - `src/app/`: Next.js routing structure.

## 4. Key Patterns and Approaches

### Dependency Injection (DI)
Functional dependency injection is used.
Example (`cartGetUseCase`):
```typescript
export const cartGetUseCase = ({ cartGetInfra }: { cartGetInfra: CartGetInfra }) => {
  return cartGetInfra; // Or more complex logic calling infra
};
```
This allows for easy implementation swapping (mocking in tests, changing e-commerce backend).

### Result Pattern
Instead of throwing exceptions (`throw`), code returns a `Result` object (`ok` or `err`).
Import: `@nimara/domain/objects/Result`.
Enforces explicit error handling in higher layers.

### Serialization / Mapping
Data from API (e.g., Saleor) does not leak directly into UI components. It is mapped to objects from `packages/domain` in the `infrastructure` layer. Thanks to this, backend API changes affect only the `infrastructure` layer, not the entire application.

### Testing
- **E2E**: `apps/automated-tests` with Playwright.
  - **Current State**: Tests cover basic critical paths ("Happy Path"):
    - Logging in.
    - Guest Checkout.
    - Logged-in user checkout (using saved data).
    - Basic homepage navigation.
  - **Missing to complete**:
    - **Registration and Password Recovery**: Tests only check redirects, lack of full registration process or password reset tests.
    - **Cart Handling**: Lack of detailed tests for quantity editing, product removal, or handling multiple items.
    - **Product Listing Page (PLP) and Search**: Lack of tests for filtering, sorting, and product search.
    - **User Account**: Lack of tests for address management or order history in the customer panel.
    - **Product Detail Page (PDP)**: Lack of tests for variant selection or image gallery (besides simple add to cart).
- **Configuration**: Shared Vitest configurations in packages suggest the presence of unit tests (although coverage in individual packages is worth verifying).

## 5. Infrastructure and Deployment
- **Provider**: Vercel.
- **IaC**: Terraform (`terraform/storefront`) manages project configuration on Vercel (environment variables, domain settings, etc.).
- **Backends**:
  - E-commerce: Saleor (GraphQL).
  - CMS: Likely Saleor CMS or other headless (depends on `NEXT_PUBLIC_CMS_SERVICE` configuration).
  - Payments: Stripe.

## 6. Tips for Refactoring
When doing a large refactor, pay attention to:
1.  **Module Boundaries**: Does logic from `infrastructure` leak into `features` or `apps/storefront`? It should be strictly encapsulated.
2.  **Domain Purity**: Ensure `packages/domain` has no incomprehensible dependencies (e.g., to React or specific libs).
3.  **Serializer Consistency**: If you change something in a domain object, you must update serializers in all adapters (e.g., if another provider than Saleor is added someday).
4.  **Monorepo Dependencies**: Check `pnpm-workspace.yaml` and `package.json` in packages to ensure library versions are synchronized.
5.  **Environment Variables**: When adding new features, remember to update `turbo.json` (globalPassThroughEnv) so environment variables are available in the build/run process.
6.  **Error Handling**: Maintain `Result Pattern` convention. Avoid `try/catch` in business logic if you can return `err()`.

## 7. Summary
The application is solidly designed with scalability and component replaceability in mind. The division into `domain`, `infrastructure`, and `features` is very clear and facilitates teamwork and code maintenance. The main challenge during refactoring will be maintaining this division discipline.
