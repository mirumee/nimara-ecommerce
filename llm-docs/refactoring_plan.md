# Nimara E-commerce Refactoring Plan

## Refactoring Goals

Main objectives of the refactoring:
1. **Easy provider integration** - payment, search, CMS, e-commerce providers should be easily pluggable
2. **Reduce unnecessary utils** - consolidate helper functions
3. **Follow DRY principle** - eliminate code duplication
4. **Incremental approach** - enable step-by-step refactoring without touching the entire application at once

---

## Phase 1: Standardize Provider Interfaces

### 1.1 Create Base Interface for All Providers

**Path:** `packages/infrastructure/src/core/provider-base.ts`

**Context:** Currently, each provider (cart, search, payment, cms) has its own configuration structure. There is no common base interface.

**Task:**
```
Create file packages/infrastructure/src/core/provider-base.ts containing:

1. Base interface BaseProviderConfig:
   - apiURL: string
   - logger: Logger
   - options?: Record<string, unknown>

2. Generic type ProviderFactory<TConfig, TService>:
   - A function that accepts config and returns service

3. Interface BaseServiceConfig extending BaseProviderConfig

Do not modify existing providers yet - that will be done in subsequent steps.
```

**Files to create:**
- `packages/infrastructure/src/core/provider-base.ts`
- `packages/infrastructure/src/core/index.ts`

---

### 1.2 Standardize SearchService Interface

**Path:** `packages/infrastructure/src/search/`

**Context:**
- Saleor search: `packages/infrastructure/src/search/saleor/provider.ts`
- Algolia search: `packages/infrastructure/src/search/algolia/provider.ts`
- Both implement `SearchService`, but configurations differ in structure

**Task:**
```
Refactor search provider configuration interfaces:

1. In file packages/infrastructure/src/search/types.ts:
   - Add import BaseProviderConfig from core/provider-base
   - Create BaseSearchServiceConfig extending BaseProviderConfig
   - Add common fields: settings (sorting options)

2. In packages/infrastructure/src/search/saleor/types.ts:
   - Make SaleorSearchServiceConfig extend BaseSearchServiceConfig
   - Keep Saleor-specific fields

3. In packages/infrastructure/src/search/algolia/types.ts:
   - Make AlgoliaSearchServiceConfig extend BaseSearchServiceConfig
   - Keep Algolia-specific fields (appId, apiKey, indices)

Do not change provider implementations - only types.
```

**Files to modify:**
- `packages/infrastructure/src/search/types.ts`
- `packages/infrastructure/src/search/saleor/types.ts`
- `packages/infrastructure/src/search/algolia/types.ts`

---

### 1.3 Standardize PaymentService Interface

**Path:** `packages/infrastructure/src/payment/`

**Context:**
- Currently only Stripe exists: `packages/infrastructure/src/payment/stripe/`
- `PaymentServiceConfig` in `packages/infrastructure/src/payment/types.ts`

**Task:**
```
Prepare payment structure for multiple providers:

1. In packages/infrastructure/src/payment/types.ts:
   - Add import BaseProviderConfig
   - Create BasePaymentServiceConfig extending BaseProviderConfig
   - Define common PaymentService interface with methods:
     * paymentGatewayInitialize
     * paymentInitialize
     * paymentExecute
     * paymentResultProcess

2. Create packages/infrastructure/src/payment/stripe/types.ts:
   - Move StripePaymentServiceConfig (currently in payment/types.ts)
   - Make it extend BasePaymentServiceConfig

3. Update packages/infrastructure/src/payment/providers.ts:
   - Change import to new type location

Stripe provider should work without changes after refactoring.
```

**Files to modify:**
- `packages/infrastructure/src/payment/types.ts`
- `packages/infrastructure/src/payment/providers.ts`

**Files to create:**
- `packages/infrastructure/src/payment/stripe/types.ts`

---

### 1.4 Standardize CartService Interface

**Path:** `packages/infrastructure/src/cart/`

**Context:**
- Currently: `packages/infrastructure/src/cart/saleor/`
- Types: `packages/infrastructure/src/cart/types.ts`

**Task:**
```
Prepare cart for multiple e-commerce providers:

1. In packages/infrastructure/src/cart/types.ts:
   - Add import BaseProviderConfig
   - Make CartServiceConfig extend BaseProviderConfig
   - Ensure CartService is fully defined as an interface

2. Move Saleor-specific types:
   - Create packages/infrastructure/src/cart/saleor/types.ts
   - Move types used only by Saleor adapter there

Do not change implementation - only reorganize types.
```

**Files to modify:**
- `packages/infrastructure/src/cart/types.ts`

**Files to create:**
- `packages/infrastructure/src/cart/saleor/types.ts`

---

### 1.5 Standardize CMSService Interface

**Path:** `packages/infrastructure/src/cms-page/`

**Context:**
- Saleor CMS: `packages/infrastructure/src/cms-page/saleor/`
- ButterCMS: `packages/infrastructure/src/cms-page/butter-cms/`
- Providers: `packages/infrastructure/src/cms-page/providers.ts`

**Task:**
```
Unify CMS provider structure:

1. In packages/infrastructure/src/cms-page/types.ts:
   - Add BaseCMSServiceConfig extending BaseProviderConfig
   - Ensure CMSPageService is exported

2. Verify that:
   - SaleorCMSPageServiceConfig extends BaseCMSServiceConfig
   - ButterCMSPageServiceConfig extends BaseCMSServiceConfig

Apply the same pattern to cms-menu if it exists.
```

**Files to modify:**
- `packages/infrastructure/src/cms-page/types.ts`

---

## Phase 2: Create Provider Registry

### 2.1 Central Provider Registry

**Path:** `packages/infrastructure/src/core/provider-registry.ts`

**Context:**
- Currently lazy-loaders are in `apps/storefront/src/services/lazy-loaders/`
- Registry is in `apps/storefront/src/services/registry.ts`
- Provider selection logic is scattered

**Task:**
```
Create a central provider registration mechanism:

1. Create packages/infrastructure/src/core/provider-registry.ts:

   type ProviderType = 'search' | 'payment' | 'cart' | 'cms-page' | 'cms-menu' | 'store' | 'user';

   type ProviderEntry<TService> = {
     name: string;
     factory: (config: any) => TService;
     isDefault?: boolean;
   };

   class ProviderRegistry {
     private providers: Map<ProviderType, Map<string, ProviderEntry<any>>>;

     register<T>(type: ProviderType, entry: ProviderEntry<T>): void;
     get<T>(type: ProviderType, name?: string): ProviderEntry<T> | undefined;
     getDefault<T>(type: ProviderType): ProviderEntry<T> | undefined;
     list(type: ProviderType): string[];
   }

2. Create singleton export:
   export const providerRegistry = new ProviderRegistry();

DO NOT integrate with the application yet - that's the next step.
```

**Files to create:**
- `packages/infrastructure/src/core/provider-registry.ts`

---

### 2.2 Register Existing Search Providers

**Path:** `packages/infrastructure/src/search/`

**Context:**
- `saleorSearchService` in `search/saleor/provider.ts`
- `algoliaSearchService` in `search/algolia/provider.ts`

**Task:**
```
Register search providers in the registry:

1. In packages/infrastructure/src/search/index.ts (create if doesn't exist):

   import { providerRegistry } from '../core/provider-registry';
   import { saleorSearchService } from './saleor/provider';
   import { algoliaSearchService } from './algolia/provider';

   // Register providers
   providerRegistry.register('search', {
     name: 'saleor',
     factory: saleorSearchService,
     isDefault: true,
   });

   providerRegistry.register('search', {
     name: 'algolia',
     factory: algoliaSearchService,
   });

   // Re-export for backward compatibility
   export { saleorSearchService, algoliaSearchService };
   export type { SearchService } from './types';

2. Update packages/infrastructure/src/index.ts to export search.
```

**Files to modify/create:**
- `packages/infrastructure/src/search/index.ts`

---

### 2.3 Register Remaining Providers

**Path:** `packages/infrastructure/src/*/`

**Task:**
```
Repeat the pattern from 2.2 for:

1. Payment providers:
   - File: packages/infrastructure/src/payment/index.ts
   - Register: stripePaymentService as 'stripe' (default)

2. Cart providers:
   - File: packages/infrastructure/src/cart/index.ts
   - Register: saleorCartService as 'saleor' (default)

3. CMS providers:
   - File: packages/infrastructure/src/cms-page/index.ts
   - Register: saleorCMSPageService, butterCMSPageService

Maintain backward compatibility - all existing exports must work.
```

**Files to create/modify:**
- `packages/infrastructure/src/payment/index.ts`
- `packages/infrastructure/src/cart/index.ts`
- `packages/infrastructure/src/cms-page/index.ts`

---

## Phase 3: Consolidate Utilities

### 3.1 Analyze and Map Existing Utils

**Context:**
Scattered utility functions:
- `packages/infrastructure/src/utils.ts` - serializeLine, getVariantMaxQuantity
- `packages/infrastructure/src/lib/core.ts` - pick
- `packages/infrastructure/src/lib/saleor.ts` - validateSaleorData, getTranslation
- `packages/infrastructure/src/lib/serializers/` - various serializers
- `packages/infrastructure/src/payment/helpers.ts` - payment helpers
- `packages/infrastructure/src/search/algolia/helpers.ts` - algolia helpers

**Task:**
```
Analyze and categorize all utility functions:

1. Create document packages/infrastructure/src/lib/UTILS_AUDIT.md:

   ## Utils Categories

   ### General (provider-agnostic)
   - pick (lib/core.ts) -> move to lib/common.ts

   ### Saleor-specific
   - validateSaleorData (lib/saleor.ts) -> stays
   - getTranslation (lib/saleor.ts) -> stays
   - serializeLine (utils.ts) -> move to cart/saleor/serializers.ts
   - getVariantMaxQuantity (utils.ts) -> move to cart/saleor/helpers.ts

   ### Domain serializers
   - parseAttributeData -> lib/serializers/attribute.ts (ok)
   - serializeMetadata -> lib/serializers/metadata.ts (ok)

   ### Payment-specific
   - isCheckoutPaid, mapStripeErrorCode -> payment/stripe/helpers.ts

   ### Search-specific
   - getIndexName, buildFilters -> search/algolia/helpers.ts (ok)

DO NOT move files yet - only create the plan.
```

**Files to create:**
- `packages/infrastructure/src/lib/UTILS_AUDIT.md`

---

### 3.2 Create Common Utils Library

**Path:** `packages/infrastructure/src/lib/`

**Task:**
```
Create a centralized structure for utils:

1. Create packages/infrastructure/src/lib/common.ts:
   - Move pick function from core.ts
   - Add other provider-agnostic utilities
   - Do not remove core.ts yet (backward compatibility)

2. Create packages/infrastructure/src/lib/index.ts:
   export * from './common';
   export * from './saleor';
   export * from './types';
   // DO NOT export serializers directly - they are domain-specific

3. Mark core.ts as deprecated:
   /**
    * @deprecated Use './common' instead. Will be removed in next major version.
    */

Preserve existing code functionality.
```

**Files to create/modify:**
- `packages/infrastructure/src/lib/common.ts`
- `packages/infrastructure/src/lib/index.ts`
- `packages/infrastructure/src/lib/core.ts` (add deprecation notice)

---

### 3.3 Move Provider-Specific Helpers

**Path:** `packages/infrastructure/src/utils.ts`

**Context:**
The `utils.ts` file in root src contains Saleor cart-specific functions:
- `serializeLine` - uses CartLineFragment from Saleor
- `getVariantMaxQuantity` - Saleor logic

**Task:**
```
Move Saleor-specific functions to proper locations:

1. Move serializeLine to packages/infrastructure/src/cart/saleor/serializers.ts:
   - If file doesn't exist, create it
   - Copy serializeLine function
   - Update imports

2. Move getVariantMaxQuantity:
   - To packages/infrastructure/src/cart/saleor/helpers.ts
   - Or to the same serializers.ts file if only used there

3. In packages/infrastructure/src/utils.ts:
   - Add re-export from new locations for backward compatibility:

   /**
    * @deprecated Import from '@nimara/infrastructure/cart/saleor/serializers' instead
    */
   export { serializeLine } from './cart/saleor/serializers';

4. Find all imports from utils.ts and update them.
```

**Files to modify/create:**
- `packages/infrastructure/src/cart/saleor/serializers.ts`
- `packages/infrastructure/src/cart/saleor/helpers.ts`
- `packages/infrastructure/src/utils.ts`

---

### 3.4 Consolidate Payment Helpers

**Path:** `packages/infrastructure/src/payment/`

**Context:**
- `payment/helpers.ts` - contains Stripe-specific functions (mapStripeErrorCode) and general ones (isCheckoutPaid)

**Task:**
```
Split payment helpers into common and Stripe-specific:

1. In packages/infrastructure/src/payment/helpers.ts keep only general functions:
   - isCheckoutPaid
   - isTransactionSuccessful
   - isTransactionFailed
   - getGatewayCustomerMetaKey (parameterized by gateway)

2. Move to packages/infrastructure/src/payment/stripe/helpers.ts:
   - mapStripeErrorCode
   - Other Stripe-specific helpers

3. Update imports in payment/stripe/infrastructure/*.ts

4. In payment/helpers.ts add deprecation for moved functions:
   /**
    * @deprecated Import from './stripe/helpers' instead
    */
   export { mapStripeErrorCode } from './stripe/helpers';
```

**Files to modify/create:**
- `packages/infrastructure/src/payment/helpers.ts`
- `packages/infrastructure/src/payment/stripe/helpers.ts`

---

## Phase 4: Eliminate Duplication (DRY)

### 4.1 Identify Duplicated Patterns in Use Cases

**Context:**
Use Cases in `packages/infrastructure/src/use-cases/` have similar patterns:
- Accept infrastructure as dependency injection
- Return Result<T, E>
- Have similar structure

**Task:**
```
Create a use case factory for repeatable patterns:

1. Create packages/infrastructure/src/use-cases/factory.ts:

   import { type AsyncResult } from '@nimara/domain/objects/Result';

   /**
    * Creates a simple pass-through use case that delegates to infrastructure
    */
   export const createPassThroughUseCase = <TInfra extends (...args: any[]) => AsyncResult<any>>(
     deps: { infra: TInfra }
   ): TInfra => {
     return deps.infra;
   };

   /**
    * Creates a use case with logging wrapper
    */
   export const createLoggedUseCase = <TParams, TResult>(
     deps: {
       infra: (params: TParams) => AsyncResult<TResult>;
       logger: Logger;
       operationName: string;
     }
   ) => {
     return async (params: TParams): AsyncResult<TResult> => {
       deps.logger.debug(`Starting ${deps.operationName}`, { params });
       const result = await deps.infra(params);
       // ... logging logic
       return result;
     };
   };

2. Identify use cases that are simple pass-through and could use the factory.

DO NOT refactor existing use cases yet - only create the factory.
```

**Files to create:**
- `packages/infrastructure/src/use-cases/factory.ts`

---

### 4.2 Standardize Serialization Pattern

**Context:**
Serializers are scattered:
- `search/saleor/serializers.ts`
- `search/algolia/serializers.ts`
- `lib/serializers/*.ts`
- `store/saleor/serializers.ts`

**Task:**
```
Create a consistent pattern for serializers:

1. Create packages/infrastructure/src/core/serializer-base.ts:

   /**
    * Base type for all serializers
    */
   export type Serializer<TInput, TOutput> = (input: TInput) => TOutput;

   /**
    * Async serializer for operations requiring I/O
    */
   export type AsyncSerializer<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

   /**
    * Creates a serializer with error handling
    */
   export const createSafeSerializer = <TInput, TOutput>(
     serializer: Serializer<TInput, TOutput>,
     fallback: TOutput
   ): Serializer<TInput, TOutput> => {
     return (input: TInput) => {
       try {
         return serializer(input);
       } catch {
         return fallback;
       }
     };
   };

2. Document the pattern in packages/infrastructure/src/core/SERIALIZATION.md

DO NOT change existing serializers - only establish the pattern for new ones.
```

**Files to create:**
- `packages/infrastructure/src/core/serializer-base.ts`
- `packages/infrastructure/src/core/SERIALIZATION.md`

---

### 4.3 Consolidate Error Handling

**Context:**
- `packages/infrastructure/src/error/` - contains error handling
- `packages/infrastructure/src/error.ts` - root level errors
- `packages/domain/objects/Error.ts` - domain errors

**Task:**
```
Unify error handling:

1. Check if error.ts and error/ have duplicated code

2. If so, consolidate in packages/infrastructure/src/error/:
   - index.ts - main exports
   - types.ts - error types
   - handlers.ts - error handlers
   - mappers.ts - mapping errors from external APIs

3. In packages/infrastructure/src/error.ts:
   - Leave only re-exports for backward compatibility
   - Add deprecation notice

4. Ensure Result pattern from @nimara/domain is consistently used
```

**Files to modify:**
- `packages/infrastructure/src/error.ts`
- `packages/infrastructure/src/error/` (directory)

---

## Phase 5: Refactor Storefront Service Registry

### 5.1 Use Provider Registry in Storefront

**Path:** `apps/storefront/src/services/`

**Context:**
- Currently: `apps/storefront/src/services/registry.ts`
- Lazy loaders: `apps/storefront/src/services/lazy-loaders/`
- Hardcoded provider choices in lazy-loaders

**Task:**
```
Refactor registry to use Provider Registry:

1. Create apps/storefront/src/services/provider-config.ts:

   type ProviderConfig = {
     search: 'saleor' | 'algolia';
     payment: 'stripe';
     cart: 'saleor';
     cmsPage: 'saleor' | 'butter-cms';
     cmsMenu: 'saleor' | 'butter-cms';
   };

   export const getProviderConfig = (): ProviderConfig => ({
     search: process.env.NEXT_PUBLIC_SEARCH_PROVIDER as any || 'saleor',
     payment: 'stripe',
     cart: 'saleor',
     cmsPage: process.env.NEXT_PUBLIC_CMS_SERVICE as any || 'saleor',
     cmsMenu: process.env.NEXT_PUBLIC_CMS_SERVICE as any || 'saleor',
   });

2. Update lazy-loaders to use providerConfig:
   - In search.ts: check config and load appropriate provider

DO NOT remove old lazy-loaders yet.
```

**Files to create:**
- `apps/storefront/src/services/provider-config.ts`

**Files to modify:**
- `apps/storefront/src/services/lazy-loaders/search.ts`

---

### 5.2 Simplify Lazy-Loaders

**Path:** `apps/storefront/src/services/lazy-loaders/`

**Task:**
```
Create a generic lazy-loader:

1. Create apps/storefront/src/services/lazy-loaders/create-lazy-loader.ts:

   export const createServiceLazyLoader = <TService, TConfig>(
     providerImport: () => Promise<{ default: (config: TConfig) => TService }>,
     configFactory: () => TConfig
   ) => {
     let instance: TService | null = null;

     return async (): Promise<TService> => {
       if (instance) return instance;

       const { default: factory } = await providerImport();
       instance = factory(configFactory());

       return instance;
     };
   };

2. Refactor one lazy-loader (e.g., search.ts) to use the new pattern

3. If it works, refactor remaining lazy-loaders
```

**Files to create:**
- `apps/storefront/src/services/lazy-loaders/create-lazy-loader.ts`

---

## Phase 6: Documentation and Tests

### 6.1 Documentation for Adding New Providers

**Path:** `llm-docs/`

**Task:**
```
Create documentation for adding new providers:

1. Create llm-docs/adding_new_provider.md:

   # Adding a New Provider

   ## Step 1: Create Directory Structure
   packages/infrastructure/src/{domain}/{provider-name}/
   ├── infrastructure/     # Infra implementations
   ├── types.ts           # Provider-specific types
   ├── serializers.ts     # Serializers
   ├── helpers.ts         # Helper functions
   └── provider.ts        # Factory function

   ## Step 2: Implement Types
   - Extend Base{Domain}ServiceConfig
   - Implement required interfaces

   ## Step 3: Implement Infrastructure
   ...

   ## Step 4: Register in Provider Registry
   ...

   ## Step 5: Configure in Storefront
   ...

2. Add example for a hypothetical provider (e.g., Meilisearch for search)
```

**Files to create:**
- `llm-docs/adding_new_provider.md`

---

### 6.2 Update Architecture Overview

**Path:** `llm-docs/architecture_overview.md`

**Task:**
```
Update architecture_overview.md with new elements:

1. Add section "Provider Architecture":
   - Description of Provider Registry
   - Provider selection flow diagram
   - List of available providers per domain

2. Update section "Key Patterns":
   - Add Provider Factory pattern
   - Add Lazy Loading pattern

3. Update section "Tips for Refactoring":
   - Add information about backward compatibility
   - Add checklist for new providers
```

**Files to modify:**
- `llm-docs/architecture_overview.md`

---

### 6.3 Tests for Provider Registry

**Task:**
```
Add unit tests for new components:

1. Create packages/infrastructure/src/core/__tests__/provider-registry.test.ts:
   - Test provider registration
   - Test getting provider by name
   - Test getting default provider
   - Test when provider doesn't exist

2. Create packages/infrastructure/src/core/__tests__/serializer-base.test.ts:
   - Test createSafeSerializer with valid input
   - Test createSafeSerializer with error

Use Vitest (already configured in the project).
```

**Files to create:**
- `packages/infrastructure/src/core/__tests__/provider-registry.test.ts`
- `packages/infrastructure/src/core/__tests__/serializer-base.test.ts`

---

## Phase 7: Cleanup and Finalization

### 7.1 Remove Deprecated Code

**Task:**
```
After ensuring everything works:

1. Remove deprecated re-exports from:
   - packages/infrastructure/src/utils.ts
   - packages/infrastructure/src/lib/core.ts
   - packages/infrastructure/src/error.ts (if applicable)

2. Update all imports in:
   - apps/storefront/
   - packages/features/
   - Other packages

3. Run tests and build to ensure nothing is broken:
   pnpm build
   pnpm test
```

---

### 7.2 Final Validation

**Task:**
```
Perform final validation:

1. Verify all providers are correctly registered:
   - Search: saleor, algolia
   - Payment: stripe
   - Cart: saleor
   - CMS: saleor, butter-cms

2. Verify adding a new provider is straightforward:
   - Is documentation sufficient?
   - Are patterns clear?

3. Verify DRY is maintained:
   - No duplicated helper functions
   - Common types in one place
   - Serializers in appropriate locations

4. Run E2E tests:
   cd apps/automated-tests && pnpm test
```

---

## Execution Order Summary

| Phase | Priority | Risk | Estimated Time |
|-------|----------|------|----------------|
| 1.1-1.5 | High | Low | 2-3h |
| 2.1-2.3 | High | Medium | 3-4h |
| 3.1-3.4 | Medium | Low | 2-3h |
| 4.1-4.3 | Medium | Low | 2h |
| 5.1-5.2 | High | Medium | 2-3h |
| 6.1-6.3 | Low | None | 2h |
| 7.1-7.2 | High | Medium | 1-2h |

**Total estimated time:** 14-20 hours

---

## Refactoring Guidelines

1. **Backward Compatibility**: Always maintain backward compatibility through deprecation, not removal
2. **Incremental Changes**: Each phase should be mergeable separately
3. **Test After Each Step**: After each step, run `pnpm build` and verify the project compiles
4. **Document As You Go**: Update documentation alongside code
5. **No Big Bang**: Avoid large changes at once - small PRs are easier to review

---

## Success Metrics

After completing the refactoring:

- [ ] Adding a new search provider requires max 5 files
- [ ] Adding a new payment provider requires max 10 files
- [ ] No duplicated helper functions between providers
- [ ] All configuration types inherit from base interfaces
- [ ] Documentation enables self-service provider addition
- [ ] All E2E tests pass
- [ ] Build time has not significantly increased
