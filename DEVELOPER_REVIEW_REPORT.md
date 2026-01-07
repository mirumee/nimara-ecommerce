# Developer Review Report: Architecture Patterns

**Date:** Generated Report  
**Purpose:** Request developer feedback on key architectural patterns  
**Audience:** Development team reviewing architecture decisions

---

## Overview

This document outlines key architectural patterns, challenges, and improvement opportunities in the Nimara codebase that need team review and feedback. The goal is to validate these patterns and address identified issues before proceeding with larger refactoring efforts.

**Review Focus:**
1. Service Registry Pattern nimara-ecommerce/apps/storefront/src/services/registry.ts
   - I thought it can be easier to exchange infras and change providers through one file like this. I remeber that we dont want to load all of them when on is needed, but this is improvemnt based on our analysis. 
2. Actions Pattern
3. Page Extraction Pattern
4. i18n & Regions Architecture
   - moving mesages make type script  stop working. maybe some stitching of translations? 
   - now messages also in nimara-ecommerce/packages/foundation/messages but i dont know how to strcuture this. maybe just have it in storefornt and thats it. 
   - I thought about having nimara-ecommerce/packages/translations/src/messages but this is mabye for removal if we cannot make it work (types deosnt work)
   - I think the end game is to have it just in one place nicelly organized even if this is storefront. 
5. Use Case Migration Opportunities

6. nimara.recipe.yaml - so CLI config 
7. imports are they good enough. as goal all elements in packages should have imports in a structure that allow them to be copied to storefront as they are. 
8. how to remove saleor webhooks logic to foundation or domain? why it is here? 
9. how to move ACP to features as this is dead code and should be optional.
10. i didnt know how to check if acp works after this changes. 


**NEXT STEPS:**

- move all actions logic that is really infra (interact with browser) from actions and to proper services 
- make perfect services architecture
- what to do with i18n and regions? Maybe some easier way to extend it
- Move checkout 
- move account and sign in
- move footer and header
- clear api routes including acp
- make cli to install only what needed and to override what should be overriden 
- make dummy infra for all things requiering accounts in some other portals (Stripe) to make eaasier adoption
- I dont like this conditional logic in many places that uses app storefront / stripe. Maybe think how to make it usefull also for more apps i.e. marketplace that doesnt require adding magic string in many places
- a lot of magic strings
- domain should have not only types but also basic actions with this objects and manipulation of this objects
- cms releted logic is spread in multiple places (i.e. nimara-ecommerce/packages/infrastructure/src/lib) we should contatin it somehow
- i dont like that nimara-ecommerce/packages/infrastructure/src is beatifully organized by function and there is use-cases folder that is internally also organized similarly and then there is graphql for random functionalities
- createRequestConfig not needed nimara-ecommerce/packages/foundation/src/i18n/config/create-request-config.ts
- maybe move to ui nimara-ecommerce/packages/foundation/src/form-components
- nimara-ecommerce/packages/foundation/src/errors maybe move to services and infra?
- something with codegen wrong, I didnt touch it and seems like someting blocks the build. 
- maybe nimara-ecommerce/packages/features/src/json-ld/json-ld.tsx should be in foundation
- what to do with nimara-ecommerce/packages/features/src/shared ? maybe put in proper modules?

---

## AI Refined Text

### Review Focus

#### Core Architectural Patterns

**1. Service Registry Pattern**
- **Location:** `apps/storefront/src/services/registry.ts`
- **Rationale:**
  - Centralized provider management through a single file makes it easier to exchange infrastructure implementations
  - Enables seamless provider switching (e.g., Saleor to another e-commerce platform)
  - **Note:** We remember not wanting to load all services when only one is needed, but this is an improvement based on our analysis

**2. Actions Pattern**
- Core/server action separation for reusability and testability

**3. Page Extraction Pattern**
- Extracting pages from storefront to features package for reusability

**4. i18n & Regions Architecture**
- **Current Challenges:**
  - Moving messages breaks TypeScript types — need solution for translation stitching
  - Messages exist in multiple locations:
    - `apps/storefront/messages/`
    - `packages/foundation/messages/`
    - `packages/translations/src/messages/` (considering removal if types don't work)
  - **Goal:** Consolidate messages in one place, nicely organized (even if that's storefront)

**5. Use Case Migration Opportunities**
- Moving business logic from actions to use cases following DDD patterns

#### Configuration & Tooling

**6. CLI Configuration (`nimara.recipe.yaml`)**
- Recipe-based configuration system for application setup and code generation

#### Code Organization & Structure

**7. Import Structure & Package Portability**
- **Goal:** All elements in packages should have imports structured to allow them to be copied to storefront as-is, without modification.

**8. Saleor Webhooks Architecture**
- **Question:** How to move Saleor webhooks logic to foundation or domain? Why is it currently in storefront?

**9. ACP (Agentic Commerce Protocol) Architecture**
- **Current State:** ACP is considered dead code and should be optional
- **Action:** Move ACP to features package as an optional feature

**10. ACP Testing & Verification**
- **Challenge:** After making changes, how do we verify that ACP still works correctly?

### Next Steps

#### Architecture & Services

- **Separate infrastructure logic from actions**
  - Move all browser-interaction logic (cookies, headers, etc.) from actions to proper services
  - Actions should only orchestrate, not handle infrastructure concerns

- **Perfect services architecture**
  - Refine service interfaces and organization
  - Ensure consistency across all services
  - Establish clear service boundaries

- **Enhance domain layer**
  - Domain should have not only types but also basic actions for object manipulation
  - Add pure functions for domain object operations

#### Feature Migration

- **Migrate remaining features to packages/features:**
  - Checkout
  - Account & Sign In
  - Footer & Header

- **i18n & Regions extensibility**
  - Find easier way to extend i18n and regions
  - Resolve message organization and TypeScript type issues

#### Code Organization & Cleanup

- **API routes cleanup**
  - Clean up and organize API routes including ACP routes
  - Establish consistent patterns for route handlers

- **CMS logic consolidation**
  - CMS-related logic is spread across multiple places (e.g., `packages/infrastructure/src/lib`)
  - Consolidate into a dedicated, well-organized module

- **Infrastructure organization**
  - `packages/infrastructure/src` is beautifully organized by function
  - `use-cases` folder follows the same pattern
  - **Issue:** `graphql` folder contains random functionalities that break the pattern
  - **Action:** Reorganize GraphQL to follow feature-based organization

- **Foundation package cleanup**
  - `createRequestConfig` not needed → `packages/foundation/src/i18n/config/create-request-config.ts`
  - `form-components` → Consider moving to UI package (`packages/foundation/src/form-components`)
  - `errors` → Consider moving to services/infrastructure (`packages/foundation/src/errors`)

- **Features package organization**
  - `json-ld` → Consider moving to foundation (`packages/features/src/json-ld/json-ld.tsx`)
  - `shared` folder → Organize into proper feature modules (`packages/features/src/shared`)

#### Tooling & Developer Experience

- **CLI tool development**
  - Create CLI to install only what's needed
  - Support configuration overrides
  - Enable selective feature installation

- **Dummy infrastructure for external services**
  - Create dummy/mock infrastructure for services requiring external accounts (e.g., Stripe)
  - Make adoption easier without requiring external service setup

#### Code Quality & Maintainability

- **Eliminate magic strings and conditional logic**
  - Replace app-specific conditionals (storefront/stripe) with a capability-based system
  - Support multiple app types (e.g., marketplace) without adding magic strings everywhere
  - Create app registry or configuration-driven approach

- **Fix codegen build issues**
  - Investigate and resolve codegen build blockers
  - Something seems to be blocking the build even though codegen wasn't modified





--- AI GENERATED REPORT AROUND THIS THINGS TO DO  ---- 

## 1. Service Registry Pattern

### Current Implementation

The service registry is a singleton pattern that provides centralized access to all services (cart, user, search, CMS, etc.) throughout the application.

**Location:** `apps/storefront/src/services/registry.ts`

**Key Characteristics:**
- Singleton instance cached after first initialization
- Initialized with region, access token, logger, and config
- Provides access to: store, cart, user, search, cms, collection services
- Services are provider-specific implementations (e.g., `saleorCartService`, `saleorUserService`)

**Example Usage:**
```typescript
const services = await getServiceRegistry();
const product = await services.cart.cartGet({ cartId });
```

### Questions for Review

1. **Singleton Pattern:**
   - ✅ Is the singleton pattern appropriate here?
   - ❓ Should we support multiple service registries (e.g., per-request)?
   - ❓ Should we use dependency injection instead?

2. **Service Initialization:**
   - ✅ Is initializing all services upfront the right approach?
   - ❓ Should services be lazy-loaded?
   - ❓ Should we support service swapping at runtime?

3. **Service Interface:**
   - ✅ Is the current service interface clear?
   - ❓ Should services be more strongly typed?
   - ❓ Should we add service health checks?

4. **Error Handling:**
   - ❓ How should service initialization errors be handled?
   - ❓ Should we have fallback services?
   - ❓ Should we validate service availability?

### Proposed Improvements (for discussion)

1. **Add service health checks**
2. **Support lazy service loading**
3. **Add service registry tests**
4. **Improve error handling**
5. **Add service lifecycle hooks**

---

## 2. Actions Pattern

### Current Implementation

Server actions are split into two layers:
- **Core actions** (`.core.ts`): Pure, framework-agnostic business logic
- **Server actions** (`actions.ts`): Next.js "use server" wrappers that handle cookies, revalidation, etc.

**Current State:**
- ✅ Pattern defined in checkout migration plan
- ❌ Not yet fully implemented across codebase
- ❌ Many actions still contain business logic directly

**Example Pattern (from checkout migration plan):**
```typescript
// packages/features/src/checkout/shared/actions/update-delivery-method.core.ts
export const updateDeliveryMethodCore = async ({
  services,
  checkoutId,
  deliveryMethodId,
}: {
  services: ServiceRegistry;
  checkoutId: string;
  deliveryMethodId: string;
}) => {
  // Pure business logic
  return await services.checkout.checkoutDeliveryMethodUpdate({
    checkoutId,
    deliveryMethodId,
  });
};

// apps/storefront/src/app/.../actions.ts
"use server";
import { updateDeliveryMethodCore } from "@nimara/features/checkout/...";
import { revalidatePath } from "next/cache";

export async function updateDeliveryMethod(data: FormSchema) {
  const services = await getServiceRegistry();
  const checkoutId = await getCheckoutId();
  
  const result = await updateDeliveryMethodCore({
    services,
    checkoutId,
    deliveryMethodId: data.deliveryMethodId,
  });
  
  revalidatePath(paths.checkout.asPath());
  return result;
}
```

### Questions for Review

1. **Separation of Concerns:**
   - ✅ Is the core/server split clear?
   - ❓ Should core actions be in packages or storefront?
   - ❓ Should we have a third layer for validation?

2. **Business Logic Location:**
   - ❓ Should business logic be in actions or use cases?
   - ❓ How do actions relate to use cases?
   - ❓ Should actions call use cases or contain logic directly?

3. **Reusability:**
   - ✅ Are core actions reusable across apps?
   - ❓ Should we support action composition?
   - ❓ How do we handle action dependencies?

4. **Testing:**
   - ❓ How should core actions be tested?
   - ❓ How should server actions be tested?
   - ❓ Should we mock services in tests?

### Proposed Improvements (for discussion)

1. **Move all business logic to use cases** (see section 5)
2. **Actions become thin wrappers** around use cases
3. **Standardize action error handling**
4. **Add action validation layer**
5. **Create action testing utilities**

---

## 3. Page Extraction Pattern

### Current Implementation

Pages are extracted from storefront to features package following this pattern:

**Structure:**
```
packages/features/src/{feature}/
├── shared/
│   ├── components/     # Reusable components
│   ├── actions/        # Core actions
│   ├── types.ts        # View props interfaces
│   └── metadata/       # Metadata generation
└── shop-basic-{feature}/
    └── standard.tsx    # Main view component
```

**Storefront pages become thin wrappers:**
```typescript
// apps/storefront/src/app/.../page.tsx
export default async function Page(props: PageProps) {
  const services = await getServiceRegistry();
  return (
    <StandardPDPView
      {...props}
      services={services}
      paths={...}
      checkoutId={...}
      addToBagAction={...}
    />
  );
}
```

**Already Extracted:**
- ✅ Product Detail Page (PDP)
- ✅ Product List Page (PLP)
- ✅ Cart
- ✅ Home Page
- ✅ Collection
- ✅ CMS Page

### Questions for Review

1. **Dependency Injection:**
   - ✅ Is passing services/paths/actions as props the right approach?
   - ❓ Should we use React Context instead?
   - ❓ Should we have a view provider pattern?

2. **Type Safety:**
   - ✅ Are view props types comprehensive?
   - ❓ Should we have stricter type checking?
   - ❓ Should we validate props at runtime?

3. **Reusability:**
   - ✅ Can views be reused across apps?
   - ❓ Should we support view variants?
   - ❓ How do we handle app-specific customizations?

4. **Testing:**
   - ❓ How should views be tested?
   - ❓ Should we mock all dependencies?
   - ❓ Should we have view integration tests?

### Proposed Improvements (for discussion)

1. **Standardize view props interface**
2. **Add view provider pattern** (if needed)
3. **Improve type safety**
4. **Add view testing utilities**
5. **Document view customization patterns**

---

## 4. i18n & Regions Architecture

### Current Implementation

**i18n (Internationalization):**
- Uses `next-intl` for routing and translations
- Locale routing configured in `apps/storefront/src/i18n/routing.ts`
- Translations in `apps/storefront/messages/` and `packages/foundation/messages/`
- Locale switching in header component

**Regions:**
- Region configuration in `apps/storefront/src/foundation/regions/config.ts`
- Uses `@nimara/foundation/regions/create-regions` for region creation
- Regions include: market, language, locale, channel
- Current region accessed via `getCurrentRegion()`

**Key Files:**
- `apps/storefront/src/i18n/routing.ts` - Routing configuration
- `apps/storefront/src/i18n/request.ts` - Request-level i18n
- `apps/storefront/src/foundation/regions/config.ts` - Region config
- `packages/foundation/src/regions/create-regions.ts` - Region factory

### Questions for Review

1. **Separation of Concerns:**
   - ✅ Is the i18n/regions split clear?
   - ❓ Should regions include i18n, or vice versa?
   - ❓ How do locale and region relate?

2. **Configuration:**
   - ✅ Is region configuration in the right place?
   - ❓ Should regions be more dynamic?
   - ❓ Should we support region switching at runtime?

3. **Type Safety:**
   - ✅ Are locale/region types strong enough?
   - ❓ Should we have stricter type checking?
   - ❓ Should we validate locale/region at runtime?

4. **Reusability:**
   - ✅ Can i18n/regions be reused across apps?
   - ❓ Should we have app-specific overrides?
   - ❓ How do we handle multi-region apps?

5. **Testing:**
   - ❓ How should i18n/regions be tested?
   - ❓ Should we mock locale/region in tests?
   - ❓ Should we have i18n/region test utilities?

### Proposed Improvements (for discussion)

1. **Clarify i18n/regions relationship**
2. **Improve type safety**
3. **Add region validation**
4. **Document i18n/regions patterns**
5. **Create i18n/regions test utilities**

---

## 5. Use Case Migration Opportunities

### Current State

**Use Cases Exist:**
- ✅ Auth use cases (`packages/infrastructure/src/use-cases/auth/`)
- ✅ Cart use cases (`packages/infrastructure/src/use-cases/cart/`)
- ✅ Search use cases (`packages/infrastructure/src/use-cases/search/`)
- ✅ User use cases (via `UserService` interface)

**Actions with Business Logic:**
- ❌ Many actions in `src/app/**/_actions/` contain business logic
- ❌ Logic should be moved to use cases (DDD pattern)

### DDD Pattern (Domain-Driven Design)

**Principle:** Business logic belongs in use cases, not in actions or components.

**Current Pattern:**
```typescript
// packages/infrastructure/src/use-cases/cart/lines-add-use-case.ts
export const linesAddUseCase = ({
  linesAddInfra,
  cartCreateInfra,
  logger,
}: {
  cartCreateInfra: CartCreateInfra;
  linesAddInfra: LinesAddInfra;
  logger: Logger;
}): LinesAddUseCase => {
  return async ({ cartId, email, lines, ...restOpts }) => {
    // Business logic here
    if (cartId) {
      return await linesAddInfra({ cartId, lines, ...restOpts });
    }
    return cartCreateInfra({ ...restOpts, lines, email });
  };
};
```

### Migration Opportunities

**Actions to Convert:**
1. **Product actions** (`add-to-bag`, etc.)
   - Move logic to `use-cases/cart/` or `use-cases/product/`
   
2. **Cart actions** (if not already in use cases)
   - Verify all cart logic is in use cases
   
3. **Search actions**
   - Move to `use-cases/search/`
   
4. **Collection actions**
   - Move to `use-cases/collection/`
   
5. **CMS actions**
   - Move to `use-cases/cms/`

**Excluded (per constraints):**
- ❌ Checkout actions
- ❌ Account actions
- ❌ Auth actions (already in use cases)

### Questions for Review

1. **Use Case Scope:**
   - ✅ What belongs in a use case vs. action?
   - ❓ Should use cases handle validation?
   - ❓ Should use cases handle errors?

2. **Use Case Structure:**
   - ✅ Is the current use case structure clear?
   - ❓ Should we have use case interfaces?
   - ❓ Should we have use case composition?

3. **Dependency Injection:**
   - ✅ Is dependency injection in use cases clear?
   - ❓ Should we use a DI container?
   - ❓ How do we handle use case dependencies?

4. **Testing:**
   - ❓ How should use cases be tested?
   - ❓ Should we mock infrastructure?
   - ❓ Should we have use case test utilities?

5. **Migration Strategy:**
   - ❓ How do we migrate existing actions?
   - ❓ Should we do it incrementally?
   - ❓ How do we ensure no regressions?

### Proposed Improvements (for discussion)

1. **Create use case interfaces** for all business operations
2. **Move all business logic from actions to use cases**
3. **Standardize use case structure**
4. **Add use case tests**
5. **Document use case patterns**

---

## 6. CLI Configuration (nimara.recipe.yaml)

### Current Implementation

The `nimara.recipe.yaml` file serves as a configuration file for a CLI tool that generates and configures applications in the Nimara ecosystem.

**Location:** `nimara.recipe.yaml`

**Key Characteristics:**
- Defines app configurations (storefront, stripe, etc.)
- Specifies page providers (shop-basic-pdp, shop-basic-plp, etc.)
- Configures infrastructure providers (search, payments, content)
- Defines Saleor app integrations
- Includes Vercel deployment configuration

**Current Structure:**
```yaml
apps:
  - name: storefront
    path: "apps/storefront"
    recipe: 
      meta:
        name: "My Store"
        type: storefront
      pages:
        - home: {provider: "shop-basic-home"}
        - plp: {provider: "shop-basic-plp"}
        # ...
      infra: 
        - search: {provider: "search-saleor"}
        - payments: {provider: "payments-dummy"}
        - content: {provider: "content-saleor"}
```

### Questions for Review

1. **Configuration Scope:**
   - ❓ What should the CLI be able to configure?
   - ❓ Should it handle code generation or just configuration?
   - ❓ Should it support multiple environments (dev, staging, prod)?

2. **Installation & Overrides:**
   - ❓ How should the CLI install only what's needed?
   - ❓ How should users override default configurations?
   - ❓ Should there be a way to opt-in/opt-out of features?

3. **Provider System:**
   - ❓ How should providers be registered and discovered?
   - ❓ Should providers be pluggable/extensible?
   - ❓ How do we handle provider dependencies?

4. **Code Generation:**
   - ❓ What code should be generated vs. copied?
   - ❓ How should generated code be updated?
   - ❓ Should generated code be customizable?

5. **Validation:**
   - ❓ How should recipe files be validated?
   - ❓ Should there be schema validation?
   - ❓ How do we handle invalid configurations?

### Proposed Improvements (for discussion)

1. **Create CLI tool** for recipe-based installation
2. **Support selective installation** (only install needed features)
3. **Enable configuration overrides** (user can override defaults)
4. **Add recipe validation** (schema + runtime checks)
5. **Document provider system** (how to add custom providers)
6. **Support feature flags** (opt-in/opt-out of features like ACP)

---

## 7. Import Structure & Package Portability

### Current Implementation

Packages use various import patterns, with the goal that all elements in packages should have imports structured to allow them to be copied to storefront as-is.

**Current Patterns:**
- `@nimara/*` package imports (e.g., `@nimara/features`, `@nimara/infrastructure`)
- Relative imports within packages
- Path aliases in some packages (`#root/*` in infrastructure)
- Wildcard exports (`"./*": "./src/*.ts"`)

**Key Files:**
- `packages/infrastructure/package.json` - exports configuration
- `packages/foundation/package.json` - exports configuration
- `packages/features/package.json` - exports configuration

### Questions for Review

1. **Import Consistency:**
   - ❓ Are all package imports consistent?
   - ❓ Should we standardize on a single import pattern?
   - ❓ How do we handle deep imports vs. barrel exports?

2. **Portability:**
   - ❓ Can packages be copied to storefront without modification?
   - ❓ Are there any storefront-specific dependencies in packages?
   - ❓ How do we handle app-specific overrides?

3. **Path Aliases:**
   - ❓ Should packages use path aliases internally?
   - ❓ How do path aliases work when copied to storefront?
   - ❓ Should we avoid path aliases for portability?

4. **Dependencies:**
   - ❓ Are package dependencies properly isolated?
   - ❓ Do packages have unnecessary dependencies?
   - ❓ How do we handle peer dependencies?

5. **Exports:**
   - ❓ Are package exports clear and well-defined?
   - ❓ Should we use barrel exports or direct file exports?
   - ❓ How do we handle type exports?

### Proposed Improvements (for discussion)

1. **Audit all package imports** for consistency
2. **Standardize import patterns** across packages
3. **Test package portability** (copy to storefront and verify)
4. **Document import conventions** for package authors
5. **Create import linting rules** to enforce patterns
6. **Minimize path aliases** in packages for better portability

---

## 8. Saleor Webhooks Architecture

### Current Implementation

Saleor webhook logic is currently located in the storefront app, but there's a question about whether it should be moved to foundation or domain.

**Current Locations:**
- `apps/storefront/src/app/api/webhooks/saleor/` - Webhook route handlers
- `apps/storefront/src/app/api/webhooks/saleor/helpers.ts` - Shared webhook utilities
- `packages/infrastructure/src/webhooks/` - GraphQL queries/fragments for webhooks
- `apps/stripe/src/lib/saleor/webhooks/` - Stripe-specific webhook verification

**Key Functionality:**
- Product webhook handlers (revalidation)
- Collection webhook handlers (revalidation)
- CMS page webhook handlers (revalidation)
- Webhook signature verification

### Questions for Review

1. **Architecture:**
   - ❓ Why is webhook logic in storefront?
   - ❓ Should webhooks be in foundation (framework-agnostic)?
   - ❓ Should webhooks be in domain (business logic)?
   - ❓ Should webhooks be in infrastructure (provider-specific)?

2. **Reusability:**
   - ❓ Can webhook logic be reused across apps?
   - ❓ Should webhook handlers be app-agnostic?
   - ❓ How do we handle app-specific webhook logic?

3. **Separation of Concerns:**
   - ❓ What's the difference between webhook infrastructure and handlers?
   - ❓ Should verification logic be separate from business logic?
   - ❓ How do we handle different webhook providers?

4. **Testing:**
   - ❓ How should webhooks be tested?
   - ❓ Should we mock webhook signatures?
   - ❓ How do we test webhook handlers in isolation?

5. **Provider Abstraction:**
   - ❓ Should webhooks be provider-agnostic?
   - ❓ How do we support multiple e-commerce providers?
   - ❓ Should there be a webhook service interface?

### Proposed Improvements (for discussion)

1. **Move webhook infrastructure to foundation** (verification, types)
2. **Move webhook handlers to infrastructure** (provider-specific logic)
3. **Create webhook service interface** (provider abstraction)
4. **Keep route handlers in apps** (Next.js-specific)
5. **Document webhook architecture** (where things belong)
6. **Add webhook testing utilities** (mock signatures, test helpers)

---

## 9. ACP (Agentic Commerce Protocol) Architecture

### Current Implementation

ACP is currently implemented in infrastructure and used in storefront, but it's considered "dead code" and should be optional/moved to features.

**Current Locations:**
- `packages/infrastructure/src/acp/` - ACP service implementation
- `apps/storefront/src/app/api/acp/` - ACP API routes
- `apps/storefront/src/features/acp/` - ACP feature logic
- `apps/storefront/src/services/acp.ts` - ACP service registry integration

**Key Functionality:**
- Checkout session management (create, update, complete, get)
- Product feed generation
- Idempotency handling
- ACP protocol compliance

### Questions for Review

1. **Optional Feature:**
   - ❓ How do we make ACP optional?
   - ❓ Should ACP be a feature flag?
   - ❓ How do we handle ACP dependencies?

2. **Location:**
   - ❓ Should ACP be in features package?
   - ❓ Should ACP infrastructure stay in infrastructure?
   - ❓ How do we structure optional features?

3. **Dependencies:**
   - ❓ What dependencies does ACP have?
   - ❓ How do we handle optional dependencies?
   - ❓ Should ACP be a separate package?

4. **Testing:**
   - ❓ How do we test ACP when it's optional?
   - ❓ Should ACP tests be conditional?
   - ❓ How do we verify ACP works after changes?

5. **Documentation:**
   - ❓ How do we document optional features?
   - ❓ Should ACP be in a separate docs section?
   - ❓ How do users enable/disable ACP?

### Proposed Improvements (for discussion)

1. **Move ACP to features package** (make it optional)
2. **Create feature flag system** (enable/disable ACP)
3. **Keep ACP infrastructure in infrastructure** (provider-specific)
4. **Add ACP installation guide** (how to enable)
5. **Create ACP test suite** (verify functionality)
6. **Document ACP architecture** (where things belong)

---

## 10. ACP Testing & Verification

### Current Challenge

After moving ACP or making changes, there's uncertainty about how to verify that ACP still works correctly.

### Questions for Review

1. **Testing Strategy:**
   - ❓ How should ACP be tested?
   - ❓ Should we have integration tests?
   - ❓ Should we have E2E tests?
   - ❓ How do we test ACP in isolation?

2. **Verification:**
   - ❓ How do we verify ACP works after refactoring?
   - ❓ Should we have ACP smoke tests?
   - ❓ How do we test ACP with different providers?

3. **Test Data:**
   - ❓ How do we generate test data for ACP?
   - ❓ Should we mock ACP responses?
   - ❓ How do we test idempotency?

4. **CI/CD:**
   - ❓ Should ACP tests run in CI?
   - ❓ How do we handle optional feature tests?
   - ❓ Should ACP tests be conditional?

5. **Documentation:**
   - ❓ How do we document ACP testing?
   - ❓ Should we have ACP test examples?
   - ❓ How do developers verify ACP locally?

### Proposed Improvements (for discussion)

1. **Create ACP test suite** (unit + integration tests)
2. **Add ACP smoke tests** (verify basic functionality)
3. **Document ACP testing** (how to test locally)
4. **Add ACP to CI** (conditional test runs)
5. **Create ACP test utilities** (mock helpers, test data)
6. **Add ACP verification checklist** (what to check after changes)

---

## 11. Actions Logic Separation (Infrastructure vs. Browser)

### Current Challenge

Actions contain logic that interacts with the browser (infrastructure concerns) that should be moved to proper services.

**Current State:**
- ❌ Actions contain browser-specific logic (cookies, headers, etc.)
- ❌ Actions contain infrastructure concerns mixed with business logic
- ❌ Services should handle all infrastructure interactions

### Questions for Review

1. **Separation:**
   - ❓ What logic belongs in actions vs. services?
   - ❓ How do we identify infrastructure logic in actions?
   - ❓ Should actions only call services?

2. **Browser Interactions:**
   - ❓ What browser interactions should be in services?
   - ❓ How do services access cookies/headers?
   - ❓ Should there be a browser service layer?

3. **Migration:**
   - ❓ How do we migrate existing actions?
   - ❓ Should we do it incrementally?
   - ❓ How do we ensure no regressions?

4. **Testing:**
   - ❓ How do we test actions after migration?
   - ❓ How do we test services with browser interactions?
   - ❓ Should we mock browser APIs?

### Proposed Improvements (for discussion)

1. **Audit all actions** for infrastructure logic
2. **Create browser service layer** (cookies, headers, etc.)
3. **Move infrastructure logic to services** (systematic migration)
4. **Keep actions thin** (only orchestration)
5. **Add action linting rules** (prevent infrastructure logic)
6. **Document action/service boundaries** (what goes where)

---

## 12. Services Architecture Perfection

### Current Challenge

The services architecture needs refinement to be "perfect" - clear, consistent, and well-organized.

**Current State:**
- ✅ Service registry pattern exists
- ❓ Service interfaces may need improvement
- ❓ Service organization may need refinement
- ❓ Service dependencies may need clarification

### Questions for Review

1. **Service Design:**
   - ❓ What makes a "perfect" service architecture?
   - ❓ Should services have clear interfaces?
   - ❓ How do services depend on each other?

2. **Organization:**
   - ❓ How should services be organized?
   - ❓ Should services be grouped by domain?
   - ❓ How do we handle cross-cutting concerns?

3. **Consistency:**
   - ❓ Are all services consistent in structure?
   - ❓ Should we have service templates?
   - ❓ How do we enforce service patterns?

4. **Documentation:**
   - ❓ How do we document services?
   - ❓ Should services have clear contracts?
   - ❓ How do developers discover services?

### Proposed Improvements (for discussion)

1. **Define service architecture principles** (what makes it perfect)
2. **Create service interface standards** (consistent contracts)
3. **Organize services by domain** (clear grouping)
4. **Document service patterns** (templates, examples)
5. **Add service linting rules** (enforce patterns)
6. **Create service testing utilities** (mock helpers)

---

## 13. i18n & Regions Extension

### Current Challenge

i18n and regions need an easier way to extend them, and there are questions about message organization and TypeScript type support.

**Current Issues:**
- Moving messages breaks TypeScript types
- Messages exist in multiple locations (storefront, foundation, translations)
- TypeScript types don't work with message stitching
- Goal: have messages in one place, nicely organized

**Current Locations:**
- `apps/storefront/messages/` - Storefront messages
- `packages/foundation/messages/` - Foundation messages
- `packages/translations/src/messages/` - Translation package (maybe for removal)

### Questions for Review

1. **Message Organization:**
   - ❓ Where should messages live?
   - ❓ Should messages be in storefront only?
   - ❓ How do we organize messages by feature?

2. **Type Safety:**
   - ❓ How do we maintain TypeScript types with messages?
   - ❓ Can we stitch translations without breaking types?
   - ❓ Should we use a different approach?

3. **Extensibility:**
   - ❓ How do users extend i18n/regions?
   - ❓ Should there be a plugin system?
   - ❓ How do we handle custom locales/regions?

4. **Reusability:**
   - ❓ Can i18n/regions be reused across apps?
   - ❓ How do apps override default messages?
   - ❓ Should messages be in packages or apps?

### Proposed Improvements (for discussion)

1. **Consolidate messages to one location** (storefront or dedicated package)
2. **Fix TypeScript type generation** (support message stitching)
3. **Create i18n extension system** (easy to add locales/regions)
4. **Document message organization** (where things go)
5. **Add message validation** (ensure all keys exist)
6. **Create i18n testing utilities** (mock locales, test translations)

---

## 14. Feature Migration: Checkout, Account, Sign In, Footer, Header

### Current Challenge

Several features need to be migrated from storefront to features package following the page extraction pattern.

**Features to Migrate:**
- Checkout
- Account
- Sign In
- Footer
- Header

**Already Migrated:**
- ✅ Product Detail Page (PDP)
- ✅ Product List Page (PLP)
- ✅ Cart
- ✅ Home Page
- ✅ Collection
- ✅ CMS Page

### Questions for Review

1. **Migration Strategy:**
   - ❓ Should we migrate all at once or incrementally?
   - ❓ What's the priority order?
   - ❓ How do we handle dependencies?

2. **Pattern Consistency:**
   - ❓ Should all features follow the same pattern?
   - ❓ Are there feature-specific considerations?
   - ❓ How do we handle shared components?

3. **Testing:**
   - ❓ How do we test during migration?
   - ❓ Should we have migration tests?
   - ❓ How do we ensure no regressions?

4. **Documentation:**
   - ❓ How do we document the migration?
   - ❓ Should we have migration guides?
   - ❓ How do developers contribute?

### Proposed Improvements (for discussion)

1. **Create migration plan** (priority, order, dependencies)
2. **Follow established patterns** (page extraction pattern)
3. **Migrate incrementally** (one feature at a time)
4. **Add migration tests** (verify functionality)
5. **Document migration process** (guides, examples)
6. **Create migration checklist** (what to verify)

---

## 15. API Routes Cleanup (Including ACP)

### Current Challenge

API routes need to be cleaned up, including ACP routes, to ensure they're well-organized and follow consistent patterns.

**Current State:**
- API routes in `apps/storefront/src/app/api/`
- ACP routes in `apps/storefront/src/app/api/acp/`
- Webhook routes in `apps/storefront/src/app/api/webhooks/`
- May have inconsistent patterns

### Questions for Review

1. **Organization:**
   - ❓ How should API routes be organized?
   - ❓ Should routes be grouped by feature?
   - ❓ How do we handle shared route logic?

2. **Patterns:**
   - ❓ Should all routes follow the same pattern?
   - ❓ How do we handle route-specific concerns?
   - ❓ Should routes be in packages or apps?

3. **Cleanup:**
   - ❓ What routes need cleanup?
   - ❓ Are there unused routes?
   - ❓ Are there routes that should be moved?

4. **Documentation:**
   - ❓ How do we document API routes?
   - ❓ Should routes have OpenAPI specs?
   - ❓ How do developers discover routes?

### Proposed Improvements (for discussion)

1. **Audit all API routes** (identify what needs cleanup)
2. **Standardize route patterns** (consistent structure)
3. **Organize routes by feature** (clear grouping)
4. **Remove unused routes** (cleanup)
5. **Document route patterns** (templates, examples)
6. **Add route testing utilities** (test helpers)

---

## 16. Conditional Logic: App-Specific Magic Strings

### Current Challenge

There's conditional logic in many places that uses magic strings like "storefront" or "stripe" to determine app behavior. This makes it hard to add new apps (e.g., marketplace) without adding magic strings everywhere.

**Current Issues:**
- Magic strings for app identification
- Conditional logic based on app type
- Hard to extend to new app types
- Not scalable for multiple apps

### Questions for Review

1. **Abstraction:**
   - ❓ How do we abstract app-specific logic?
   - ❓ Should we use a plugin system?
   - ❓ How do we handle app capabilities?

2. **Configuration:**
   - ❓ Should app behavior be configuration-driven?
   - ❓ How do we define app capabilities?
   - ❓ Should apps declare their features?

3. **Pattern:**
   - ❓ What pattern should replace magic strings?
   - ❓ Should we use enums or constants?
   - ❓ How do we type app-specific behavior?

4. **Extensibility:**
   - ❓ How do new apps extend the system?
   - ❓ Should there be an app registry?
   - ❓ How do we handle app-specific overrides?

### Proposed Improvements (for discussion)

1. **Create app capability system** (declare features, not strings)
2. **Replace magic strings with constants** (type-safe)
3. **Use configuration-driven behavior** (not conditionals)
4. **Create app registry** (discover apps, capabilities)
5. **Document app extension patterns** (how to add apps)
6. **Add app type checking** (TypeScript types for apps)

---

## 17. Domain Layer: Types + Actions

### Current Challenge

The domain layer should have not only types but also basic actions for object manipulation, not just type definitions.

**Current State:**
- Domain has types (e.g., `CMSPage`, `Product`, etc.)
- Domain may lack manipulation functions
- Business logic may be scattered

### Questions for Review

1. **Domain Scope:**
   - ❓ What belongs in domain?
   - ❓ Should domain have manipulation functions?
   - ❓ How do domain actions differ from use cases?

2. **Actions:**
   - ❓ What actions should be in domain?
   - ❓ Should domain have pure functions?
   - ❓ How do domain actions relate to infrastructure?

3. **Organization:**
   - ❓ How should domain be organized?
   - ❓ Should domain be grouped by entity?
   - ❓ How do we handle cross-entity logic?

4. **Testing:**
   - ❓ How should domain be tested?
   - ❓ Should domain tests be pure?
   - ❓ How do we test domain actions?

### Proposed Improvements (for discussion)

1. **Audit domain layer** (what's missing)
2. **Add domain manipulation functions** (pure, testable)
3. **Organize domain by entity** (clear structure)
4. **Document domain patterns** (what goes where)
5. **Add domain tests** (pure unit tests)
6. **Create domain utilities** (helpers, validators)

---

## 18. CMS Logic Consolidation

### Current Challenge

CMS-related logic is spread across multiple places (e.g., `packages/infrastructure/src/lib`) and should be contained/organized better.

**Current Locations:**
- `packages/infrastructure/src/lib/` - Various CMS utilities
- `packages/infrastructure/src/cms-page/` - CMS page infrastructure
- `packages/domain/src/objects/CMSPage.ts` - CMS domain types
- May be scattered in other locations

### Questions for Review

1. **Consolidation:**
   - ❓ Where should all CMS logic live?
   - ❓ Should CMS be a dedicated module?
   - ❓ How do we organize CMS infrastructure?

2. **Organization:**
   - ❓ How should CMS be structured?
   - ❓ Should CMS follow the same pattern as other features?
   - ❓ How do we handle CMS-specific concerns?

3. **Dependencies:**
   - ❓ What does CMS depend on?
   - ❓ How do we handle CMS provider abstraction?
   - ❓ Should CMS be provider-agnostic?

4. **Testing:**
   - ❓ How should CMS be tested?
   - ❓ Should we have CMS test utilities?
   - ❓ How do we test CMS providers?

### Proposed Improvements (for discussion)

1. **Audit all CMS logic** (find all locations)
2. **Consolidate CMS to dedicated module** (clear organization)
3. **Organize CMS by concern** (infrastructure, domain, features)
4. **Document CMS architecture** (where things belong)
5. **Add CMS test utilities** (mock providers, test helpers)
6. **Create CMS service interface** (provider abstraction)

---

## 19. Infrastructure Organization: Use Cases vs. GraphQL

### Current Challenge

The infrastructure package is beautifully organized by function, with a use-cases folder that's also organized similarly, but then there's a graphql folder for "random functionalities" that breaks the pattern.

**Current Structure:**
- `packages/infrastructure/src/{feature}/` - Organized by feature
- `packages/infrastructure/src/use-cases/{feature}/` - Organized by feature
- `packages/infrastructure/src/graphql/` - Random functionalities (breaks pattern)

### Questions for Review

1. **Organization:**
   - ❓ Should GraphQL be organized by feature?
   - ❓ How do we handle shared GraphQL?
   - ❓ Should GraphQL be co-located with features?

2. **Pattern:**
   - ❓ What's the right pattern for infrastructure?
   - ❓ Should all infrastructure follow the same structure?
   - ❓ How do we handle cross-cutting concerns?

3. **GraphQL:**
   - ❓ Where should GraphQL queries/fragments live?
   - ❓ Should GraphQL be with infrastructure or separate?
   - ❓ How do we organize GraphQL by feature?

4. **Consistency:**
   - ❓ How do we maintain consistency?
   - ❓ Should we have infrastructure templates?
   - ❓ How do we enforce patterns?

### Proposed Improvements (for discussion)

1. **Reorganize GraphQL by feature** (match infrastructure pattern)
2. **Co-locate GraphQL with infrastructure** (queries with services)
3. **Create infrastructure templates** (consistent structure)
4. **Document infrastructure patterns** (where things go)
5. **Add infrastructure linting rules** (enforce patterns)
6. **Audit infrastructure organization** (ensure consistency)

---

## 20. Foundation Package: Unused & Misplaced Code

### Current Challenge

Several items in the foundation package may be unused, unnecessary, or misplaced and need review.

**Items to Review:**
- `createRequestConfig` - May not be needed
- `form-components` - Maybe should be in UI package
- `errors` - Maybe should be in services/infrastructure
- `json-ld` - Maybe should be in foundation (currently in features)

### Questions for Review

1. **createRequestConfig:**
   - ❓ Is `createRequestConfig` actually used?
   - ❓ Can it be removed or simplified?
   - ❓ What's its purpose?

2. **form-components:**
   - ❓ Should form components be in UI package?
   - ❓ What's the difference between foundation and UI?
   - ❓ How do we decide where components go?

3. **errors:**
   - ❓ Should errors be in foundation, services, or infrastructure?
   - ❓ What's the difference between error types?
   - ❓ How do we organize error handling?

4. **json-ld:**
   - ❓ Should json-ld be in foundation or features?
   - ❓ Is json-ld reusable across features?
   - ❓ How do we handle feature-specific json-ld?

### Proposed Improvements (for discussion)

1. **Audit foundation package** (identify unused code)
2. **Move form-components to UI** (if appropriate)
3. **Reorganize errors** (foundation vs. services vs. infrastructure)
4. **Move json-ld to foundation** (if reusable)
5. **Remove unused code** (cleanup)
6. **Document foundation boundaries** (what belongs where)

---

## 21. Features Package: Shared Module Organization

### Current Challenge

The `packages/features/src/shared/` folder contains shared components that may belong in proper feature modules instead.

**Current Contents:**
- `shared/product/` - Product-related shared components
- `shared/product-list/` - Product list shared components
- `shared/shopping-bag/` - Shopping bag shared components

### Questions for Review

1. **Organization:**
   - ❓ Should shared components be in feature modules?
   - ❓ How do we handle truly shared components?
   - ❓ What's the difference between shared and feature-specific?

2. **Location:**
   - ❓ Where should shared components live?
   - ❓ Should they be in UI package?
   - ❓ Should they be co-located with features?

3. **Reusability:**
   - ❓ Are these components truly shared?
   - ❓ Can they be moved to feature modules?
   - ❓ How do we handle component dependencies?

4. **Pattern:**
   - ❓ What's the right pattern for shared code?
   - ❓ Should we have a shared module per feature?
   - ❓ How do we avoid duplication?

### Proposed Improvements (for discussion)

1. **Audit shared folder** (identify what's truly shared)
2. **Move components to feature modules** (where appropriate)
3. **Create shared module structure** (if needed)
4. **Document shared code patterns** (when to use shared)
5. **Add component organization rules** (linting)
6. **Consolidate shared components** (reduce duplication)

---

## 22. Codegen Build Issues

### Current Challenge

Something is wrong with codegen - it wasn't touched but seems like something is blocking the build.

### Questions for Review

1. **Investigation:**
   - ❓ What's blocking the build?
   - ❓ Are there codegen errors?
   - ❓ Is it a dependency issue?

2. **Root Cause:**
   - ❓ What changed that broke codegen?
   - ❓ Is it a configuration issue?
   - ❓ Is it a schema issue?

3. **Fix:**
   - ❓ How do we fix codegen?
   - ❓ Should we update codegen?
   - ❓ Should we change the setup?

4. **Prevention:**
   - ❓ How do we prevent codegen issues?
   - ❓ Should we add codegen tests?
   - ❓ Should we document codegen setup?

### Proposed Improvements (for discussion)

1. **Investigate codegen issues** (identify root cause)
2. **Fix codegen build** (resolve blocking issues)
3. **Add codegen tests** (prevent regressions)
4. **Document codegen setup** (how it works)
5. **Add codegen validation** (catch issues early)
6. **Create codegen troubleshooting guide** (common issues)

---

## Review Questions Summary

### Service Registry
- [ ] Is singleton pattern appropriate?
- [ ] Should we support multiple registries?
- [ ] Should services be lazy-loaded?
- [ ] How should errors be handled?

### Actions Pattern
- [ ] Is core/server split clear?
- [ ] Should logic be in actions or use cases?
- [ ] How should actions be tested?
- [ ] Should we standardize error handling?

### Page Extraction
- [ ] Is dependency injection via props appropriate?
- [ ] Should we use React Context?
- [ ] How should views be tested?
- [ ] How do we handle customizations?

### i18n & Regions
- [ ] Is i18n/regions split clear?
- [ ] Should regions be more dynamic?
- [ ] How should locale/region be validated?
- [ ] How should i18n/regions be tested?
- [ ] Where should messages live?
- [ ] How do we fix TypeScript types?

### Use Cases
- [ ] What belongs in use cases vs. actions?
- [ ] Should we have use case interfaces?
- [ ] How should use cases be tested?
- [ ] What's the migration strategy?

### CLI Configuration
- [ ] What should CLI configure?
- [ ] How should selective installation work?
- [ ] How should overrides work?

### Import Structure
- [ ] Are imports consistent?
- [ ] Can packages be copied as-is?
- [ ] Should we standardize patterns?

### Webhooks Architecture
- [ ] Why are webhooks in storefront?
- [ ] Should webhooks be in foundation/infrastructure?
- [ ] How do we abstract webhook providers?

### ACP Architecture
- [ ] How do we make ACP optional?
- [ ] Should ACP be in features?
- [ ] How do we verify ACP works?

### Infrastructure Logic Separation
- [ ] What logic belongs in services?
- [ ] How do we identify infrastructure logic?
- [ ] How do we migrate actions?

### Services Architecture
- [ ] What makes perfect services?
- [ ] How should services be organized?
- [ ] How do we enforce consistency?

### Feature Migration
- [ ] What's the migration priority?
- [ ] How do we handle dependencies?
- [ ] How do we test during migration?

### API Routes
- [ ] How should routes be organized?
- [ ] What routes need cleanup?
- [ ] Should routes follow patterns?

### Magic Strings & App Logic
- [ ] How do we abstract app-specific logic?
- [ ] Should we use capability system?
- [ ] How do we support new apps?

### Domain Layer
- [ ] What actions belong in domain?
- [ ] How do we organize domain?
- [ ] How do we test domain?

### CMS Consolidation
- [ ] Where should CMS logic live?
- [ ] How do we organize CMS?
- [ ] Should CMS be a module?

### Infrastructure Organization
- [ ] Should GraphQL be by feature?
- [ ] How do we maintain consistency?
- [ ] What's the right pattern?

### Foundation Package
- [ ] What's unused in foundation?
- [ ] Where should components live?
- [ ] How do we organize errors?

### Features Shared
- [ ] Should shared be in modules?
- [ ] Where should shared live?
- [ ] How do we avoid duplication?

### Codegen
- [ ] What's blocking the build?
- [ ] How do we fix it?
- [ ] How do we prevent issues?

---

## Next Steps

### Immediate Actions
1. **Team Review:** Schedule review session to discuss each pattern and challenge
2. **Prioritize Issues:** Rank items by impact and effort (high/medium/low)
3. **Investigate Blockers:** Address codegen build issues and critical problems
4. **Document Decisions:** Create ADRs (Architecture Decision Records) for key patterns

### Short-term (1-2 sprints)
1. **Fix Critical Issues:**
   - Resolve codegen build blockers
   - Fix i18n TypeScript type issues
   - Clean up unused code (createRequestConfig, etc.)

2. **Establish Patterns:**
   - Finalize service architecture
   - Standardize import patterns
   - Document action/service boundaries

3. **Begin Migrations:**
   - Start feature migrations (checkout, account, etc.)
   - Move infrastructure logic from actions
   - Consolidate CMS logic

### Medium-term (3-6 sprints)
1. **Complete Migrations:**
   - Finish all feature migrations
   - Complete use case migrations
   - Reorganize infrastructure (GraphQL, etc.)

2. **Improve Architecture:**
   - Implement app capability system (replace magic strings)
   - Enhance domain layer (add actions)
   - Perfect services architecture

3. **Tooling & Automation:**
   - Create CLI tool for recipe-based installation
   - Add linting rules for patterns
   - Create testing utilities

### Long-term (6+ sprints)
1. **Polish & Optimization:**
   - Optimize package portability
   - Enhance i18n/regions extensibility
   - Improve documentation

2. **New Capabilities:**
   - Support multiple app types (marketplace, etc.)
   - Add provider abstraction layers
   - Create plugin system

3. **Developer Experience:**
   - Improve onboarding documentation
   - Create migration guides
   - Add development tools

---

## Feedback Template

Please provide feedback using this template:

### Topic: [Service Registry / Actions / Page Extraction / i18n-Regions / Use Cases / CLI Config / Imports / Webhooks / ACP / etc.]

**What works well:**
- 

**What needs improvement:**
- 

**Questions:**
- 

**Suggestions:**
- 

**Priority:**
- [ ] High - Blocking
- [ ] Medium - Should fix soon
- [ ] Low - Nice to have

**Estimated Effort:**
- [ ] Small (< 1 week)
- [ ] Medium (1-2 weeks)
- [ ] Large (2+ weeks)

---

**Report Status:** Ready for Review  
**Action Required:** Team review and feedback

