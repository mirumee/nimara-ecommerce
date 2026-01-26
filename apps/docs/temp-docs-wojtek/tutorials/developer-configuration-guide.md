# Developer Configuration Guide: Adjusting Storefront to Your Saleor Setup

This guide covers all typical actions a new developer needs to take when configuring the Nimara storefront to work with their Saleor instance and customize it to their needs.

---

## Table of Contents

1. [Initial Setup & Environment Variables](#initial-setup--environment-variables)
2. [Saleor Connection Configuration](#saleor-connection-configuration)
3. [Regions & Channels Setup](#regions--channels-setup)
4. [Internationalization (i18n) Configuration](#internationalization-i18n-configuration)
5. [Theme & Styling Customization](#theme--styling-customization)
6. [Payment Provider Configuration](#payment-provider-configuration)
7. [Search Provider Configuration](#search-provider-configuration)
8. [CMS Provider Configuration](#cms-provider-configuration)
9. [Page Customization & Overrides](#page-customization--overrides)
10. [Feature Configuration](#feature-configuration)
11. [Metadata & SEO Configuration](#metadata--seo-configuration)
12. [Webhook Configuration](#webhook-configuration)
13. [Authentication & User Management](#authentication--user-management)
14. [Deployment Configuration](#deployment-configuration)

---

## Initial Setup & Environment Variables

### Setting Up Environment Variables

The storefront requires several environment variables to connect to your Saleor instance and configure services.

**Location:** Create a `.env.local` file in `apps/storefront/`

**Required Variables:**

```bash
# Saleor Connection
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel

# Storefront URL
NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront-domain.com

# Environment
ENVIRONMENT=LOCAL  # or DEVELOPMENT, STAGING, PRODUCTION

# Default Settings
NEXT_PUBLIC_DEFAULT_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_DEFAULT_PAGE_TITLE=Your Store Name
```

**Optional Variables:**

```bash
# Payment Provider (if using Stripe)
NEXT_PUBLIC_PAYMENT_APP_ID=your-payment-app-id
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Search Provider (if using Algolia)
NEXT_PUBLIC_SEARCH_SERVICE=ALGOLIA
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_API_KEY=your-algolia-api-key

# CMS Provider (if using ButterCMS)
NEXT_PUBLIC_CMS_SERVICE=BUTTER_CMS
NEXT_PUBLIC_BUTTER_CMS_API_KEY=your-butter-cms-key
```

**Configuration File:** `apps/storefront/src/envs/client.ts`

This file defines the schema for all environment variables using Zod. If you need to add new environment variables:

1. Add the variable to the schema in `client.ts`
2. Add it to your `.env.local` file
3. The schema will validate the variable at runtime

---

## Saleor Connection Configuration

### Connecting to Your Saleor Instance

**1. Set the Saleor API URL**

```bash
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
```

**2. Configure the Default Channel**

The channel determines which products, prices, and inventory are available. Set this to match a channel in your Saleor instance:

```bash
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel
```

**Location:** `apps/storefront/src/foundation/regions/config.ts`

You can also configure channel mappings per locale (see Regions section).

### Service Registry Configuration

The service registry is the central access point for all services (cart, user, search, CMS, etc.).

**Location:** `apps/storefront/src/services/registry.ts`

The registry automatically initializes with:
- Your configured region/channel
- Access tokens from cookies
- Logger instance
- App configuration

**Usage Example:**

```typescript
import { getServiceRegistry } from "@/services/registry";

const services = await getServiceRegistry();
const product = await services.store.productGet({ slug: "product-slug" });
```

---

## Regions & Channels Setup

### Configuring Markets and Channels

Regions define markets, languages, locales, and channels for your storefront.

**Location:** `apps/storefront/src/foundation/regions/config.ts`

**What to Configure:**

1. **Supported Locales** - Languages your storefront supports
2. **Markets** - Geographic markets (US, UK, etc.)
3. **Channels** - Saleor channels mapped to markets
4. **Currencies** - Supported currencies per market
5. **Languages** - Language definitions with codes and names

**Example Configuration:**

```typescript
export const MARKETS = {
  US: {
    id: "us",
    name: "United States of America",
    channel: "channel-us",  // Your Saleor channel slug
    currency: "USD",
    continent: "North America",
    countryCode: "US",
    defaultLanguage: LANGUAGES.US,
    supportedLanguages: [LANGUAGES.US],
  },
  GB: {
    id: "gb",
    name: "United Kingdom",
    channel: "channel-uk",  // Your Saleor channel slug
    currency: "GBP",
    continent: "Europe",
    countryCode: "GB",
    defaultLanguage: LANGUAGES.GB,
    supportedLanguages: [LANGUAGES.GB],
  },
} as const;
```

**Locale to Channel Mapping:**

```typescript
export const LOCALE_CHANNEL_MAP = {
  "en-GB": "gb",
  "en-US": "us",
} as const;
```

**Supported Channels:**

Make sure to list all channels that exist in your Saleor instance:

```typescript
export const SUPPORTED_CHANNELS = [
  "default-channel",
  "channel-us",
  "channel-uk",
] as const;
```

### Adding a New Market/Region

1. Add the market to `MARKETS` object
2. Add the language to `LANGUAGES` object (if new)
3. Add locale to `SUPPORTED_LOCALES`
4. Add mapping to `LOCALE_CHANNEL_MAP`
5. Add channel to `SUPPORTED_CHANNELS`
6. Update `SUPPORTED_CURRENCIES` if needed

---

## Internationalization (i18n) Configuration

### Setting Up Locales and Translations

**Location:** `apps/storefront/src/i18n/routing.ts` and `apps/storefront/messages/`

**1. Configure Supported Locales**

```typescript
// apps/storefront/src/i18n/routing.ts
export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,  // From regions config
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
  localePrefix: {
    mode: "as-needed",
    prefixes: localePrefixes,
  },
});
```

**2. Add Translation Files**

Translation files are in JSON format:

- `apps/storefront/messages/en-US.json` - US English translations
- `apps/storefront/messages/en-GB.json` - UK English translations

**Adding a New Locale:**

1. Create a new JSON file: `apps/storefront/messages/{locale}.json`
2. Add the locale to `SUPPORTED_LOCALES` in regions config
3. Configure routing in `routing.ts`
4. Add locale prefix mapping if needed

**Example Translation File Structure:**

```json
{
  "common": {
    "addToCart": "Add to Cart",
    "price": "Price"
  },
  "product": {
    "title": "Product Details",
    "description": "Description"
  }
}
```

**Using Translations in Components:**

```typescript
import { useTranslations } from "next-intl";

const t = useTranslations("common");
return <button>{t("addToCart")}</button>;
```

### Message Organization

Currently, messages exist in multiple locations:
- `apps/storefront/messages/` - Storefront-specific messages
- `packages/foundation/messages/` - Foundation package messages

**Best Practice:** Keep all messages in `apps/storefront/messages/` for easier management and to avoid TypeScript type issues.

---

## Theme & Styling Customization

### Tailwind Configuration

**Location:** `apps/storefront/tailwind.config.ts` (extends `packages/config/src/tailwind.config.ts`)

The storefront uses Tailwind CSS with a custom design system based on shadcn/ui.

**Customizing Theme Colors:**

**Location:** `packages/ui/src/styles/globals.css`

Modify CSS variables to change the color scheme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... more colors */
  --radius: 0.5rem;  /* Border radius */
}
```

**Dark Mode:**

Dark mode colors are defined in the `.dark` class:

```css
.dark {
  --background: 12, 6%, 15%;
  --foreground: 20, 7.1%, 90.2%;
  /* ... dark mode colors */
}
```

**Customizing Breakpoints:**

**Location:** `packages/config/src/tailwind.config.ts`

```typescript
theme: {
  screens: {
    xs: "360px",
    sm: "720px",
    md: "960px",
    lg: "1140px",
    xl: "1440px",
  },
}
```

**Customizing Typography:**

Font sizes are defined in the Tailwind config:

```typescript
fontSize: {
  tiny: ".625rem",
  xs: ".75rem",
  sm: ".875rem",
  base: "1rem",
  // ... more sizes
}
```

### Branding & Assets

**Logo:**

Replace the logo files:
- `apps/storefront/public/brand-logo-dark.svg` - Dark mode logo
- Update logo references in header/navigation components

**Favicon & Icons:**

- `apps/storefront/app/icon.png` - App icon
- `apps/storefront/app/icon.svg` - SVG icon
- `apps/storefront/app/apple-icon.png` - Apple touch icon
- `apps/storefront/app/favicon.ico` - Favicon

**OG Image:**

- `apps/storefront/public/og-hp.png` - Open Graph image for homepage

---

## Payment Provider Configuration

### Using Stripe

**1. Set Environment Variables:**

```bash
NEXT_PUBLIC_PAYMENT_APP_ID=your-payment-app-id
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

**2. Install Stripe Saleor App**

The Stripe integration requires the Nimara Stripe Saleor app to be installed in your Saleor instance.

**3. Configure Payment Methods**

Payment methods are configured in your Saleor dashboard and retrieved via the payment service.

**Location:** Payment logic is in `packages/infrastructure/src/payments/`

### Using Dummy Payment Provider

For development/testing, you can use the dummy payment provider:

```bash
# No additional configuration needed
# Payments will be simulated
```

**Configuration:** Set in `nimara.recipe.yaml`:

```yaml
infra:
  - payments: { provider: "payments-dummy" }
```

---

## Search Provider Configuration

### Using Saleor Search (Default)

**Configuration:**

```bash
NEXT_PUBLIC_SEARCH_SERVICE=SALEOR
# No additional keys needed
```

Search queries go directly to your Saleor GraphQL API.

### Using Algolia

**1. Set Environment Variables:**

```bash
NEXT_PUBLIC_SEARCH_SERVICE=ALGOLIA
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_API_KEY=your-algolia-api-key
```

**2. Configure Algolia Index**

You'll need to:
- Create an Algolia index
- Sync product data from Saleor to Algolia
- Configure searchable attributes

**Location:** Search service is in `packages/infrastructure/src/search/`

---

## CMS Provider Configuration

### Using Saleor CMS (Default)

**Configuration:**

```bash
NEXT_PUBLIC_CMS_SERVICE=SALEOR
# No additional keys needed
```

CMS pages are managed in Saleor and retrieved via GraphQL.

### Using ButterCMS

**1. Set Environment Variables:**

```bash
NEXT_PUBLIC_CMS_SERVICE=BUTTER_CMS
NEXT_PUBLIC_BUTTER_CMS_API_KEY=your-butter-cms-key
```

**2. Configure Content Types**

Set up content types in ButterCMS that match your storefront's expectations.

**Location:** CMS service is in `packages/infrastructure/src/cms/`

---

## Page Customization & Overrides

### Overriding Page Components

Pages are extracted to the `packages/features` package, but you can override them in the storefront.

**Pattern:**

1. Import the standard view from features
2. Pass custom props or wrap with custom logic
3. Override specific sections as needed

**Example - Product Detail Page:**

**Location:** `apps/storefront/src/app/[locale]/(main)/products/[slug]/page.tsx`

```typescript
import { StandardPDPView } from "@nimara/features/product-detail-page/shop-basic-pdp/standard";

export default async function Page(props: PageProps) {
  const services = await getServiceRegistry();
  
  return (
    <StandardPDPView
      {...props}
      services={services}
      paths={paths}
      checkoutId={checkoutId}
      addToBagAction={addToBagAction}
      // Add custom props here
    />
  );
}
```

### Customizing Page Sections

Most pages have modular sections that can be customized:

**Example Structure:**
```
packages/features/src/{feature}/
├── shared/
│   ├── components/     # Reusable components
│   ├── actions/        # Core actions
│   └── metadata/       # Metadata generation
└── shop-basic-{feature}/
    └── standard.tsx    # Main view component
```

**To Customize:**

1. Copy the component from features to storefront
2. Modify as needed
3. Import your custom version instead

### Adding Custom Pages

**1. Create Route:**

```
apps/storefront/src/app/[locale]/(main)/your-page/page.tsx
```

**2. Use Services:**

```typescript
import { getServiceRegistry } from "@/services/registry";

export default async function YourPage() {
  const services = await getServiceRegistry();
  // Use services to fetch data
  return <div>Your Page</div>;
}
```

---

## Feature Configuration

### Enabling/Disabling Features

Features are configured in `nimara.recipe.yaml`:

```yaml
apps:
  - name: storefront
    recipe:
      pages:
        - home: {provider: "shop-basic-home"}
        - plp: {provider: "shop-basic-plp"}
        - pdp: {provider: "shop-basic-pdp"}
        - cart: {provider: "shop-basic-cart"}
```

### ACP (Agentic Commerce Protocol)

ACP is currently optional and can be enabled/disabled.

**To Enable ACP:**

1. Ensure ACP routes exist: `apps/storefront/src/app/api/acp/`
2. Configure ACP service in service registry
3. Set up ACP endpoints in your Saleor instance

**To Disable ACP:**

1. Remove ACP routes
2. Remove ACP service from registry
3. Update recipe configuration

**Location:** ACP implementation is in `packages/infrastructure/src/acp/`

---

## Metadata & SEO Configuration

### Page Titles and Meta Tags

**Default Configuration:**

**Location:** `apps/storefront/src/config.ts`

```typescript
export const DEFAULT_PAGE_TITLE = "Nimara Storefront";
```

**Per-Page Metadata:**

Pages generate metadata using the `generateMetadata` function:

```typescript
export async function generateMetadata({ params }: PageProps) {
  const product = await getProduct(params.slug);
  return {
    title: product.name,
    description: product.description,
  };
}
```

### Robots.txt

**Location:** `apps/storefront/src/app/robots.ts`

Configure which pages search engines can index.

### Sitemap

**Location:** `apps/storefront/src/app/sitemap.ts`

Generate sitemap for all products, collections, and pages.

---

## Webhook Configuration

### Saleor Webhooks

Webhooks handle real-time updates from Saleor (product changes, collection updates, etc.).

**Location:** `apps/storefront/src/app/api/webhooks/saleor/`

**Available Webhooks:**

- Products: `apps/storefront/src/app/api/webhooks/saleor/products/route.ts`
- Collections: `apps/storefront/src/app/api/webhooks/saleor/collections/route.ts`
- CMS Pages: `apps/storefront/src/app/api/webhooks/saleor/page/route.ts`
- Menu: `apps/storefront/src/app/api/webhooks/saleor/menu/route.ts`

**Setting Up Webhooks in Saleor:**

1. Go to Saleor Dashboard → Webhooks
2. Create webhook for each event type
3. Set webhook URL to: `https://your-storefront.com/api/webhooks/saleor/{type}`
4. Configure webhook secret (if using signature verification)

**Webhook Secret:**

If you're using webhook signature verification, set the secret in your environment variables (check webhook helper files for the exact variable name).

---

## Authentication & User Management

### NextAuth Configuration

**Location:** `apps/storefront/src/auth.ts`

The storefront uses NextAuth for authentication, integrated with Saleor.

**Configuration Options:**

- Session strategy
- JWT settings
- Callback URLs
- Provider configuration

### User Account Features

Account management pages are in:
- `apps/storefront/src/app/[locale]/(main)/account/`

**Available Features:**
- Profile management
- Address management
- Order history
- Payment methods
- Privacy settings

### Customizing Auth Flow

**Location:** `apps/storefront/src/app/[locale]/(auth)/`

Auth pages:
- Sign in: `sign-in/page.tsx`
- Create account: `create-account/page.tsx`
- Reset password: `reset-password/page.tsx`
- Confirm email: `confirm-account-registration/page.tsx`

---

## Deployment Configuration

### Vercel Deployment

**Terraform Configuration:**

**Location:** `terraform/storefront/`

**1. Configure Variables:**

Edit `example.public.auto.tfvars` and `example.private.auto.tfvars`:

```hcl
vercel_project_name = "your-storefront"
github_repository = "your-org/your-repo"
github_production_branch = "main"

public_environment_variables = {
  "NEXT_PUBLIC_SALEOR_API_URL" = {
    envs_values = [{
      value = "https://your-saleor-instance.com/graphql/"
      target = ["production", "preview", "development"]
    }]
  }
  # ... more variables
}
```

**2. Deploy:**

```bash
cd terraform/storefront
terraform init
terraform plan
terraform apply
```

### Environment-Specific Configuration

**Environments:**
- `LOCAL` - Local development
- `DEVELOPMENT` - Development environment
- `STAGING` - Staging environment
- `PRODUCTION` - Production environment

**Setting Environment:**

```bash
ENVIRONMENT=PRODUCTION
```

This affects:
- Logging levels
- Error handling
- Feature flags
- Analytics

---

## Common Customization Tasks

### Changing Default Sort Order

**Location:** `apps/storefront/src/config.ts`

```typescript
export const DEFAULT_SORT_BY = "price-asc";  // or "price-desc", "name-asc", etc.
```

### Changing Results Per Page

**Location:** `apps/storefront/src/config.ts`

```typescript
export const DEFAULT_RESULTS_PER_PAGE = 16;
```

### Configuring Image Formats

**Location:** `apps/storefront/src/config.ts`

```typescript
export const IMAGE_FORMAT: "AVIF" | "ORIGINAL" | "WEBP" = "AVIF";
export const IMAGE_SIZES = {
  pdp: 1024,
};
```

### Cache Configuration

**Location:** `apps/storefront/src/config.ts`

```typescript
export const CACHE_TTL = {
  pdp: DAY,
  cart: MINUTE * 5,
  cms: MINUTE * 15,
} as const;
```

### Cookie Configuration

**Location:** `apps/storefront/src/config.ts`

```typescript
export const COOKIE_MAX_AGE = {
  checkout: 30 * DAY,
  locale: 360 * DAY,
} as const;
```

---

## Troubleshooting

### TypeScript Errors After Configuration Changes

If you see TypeScript errors after changing configuration:

1. Restart the TypeScript server
2. Run `pnpm build` to check for type errors
3. Ensure all environment variables are set correctly

### Services Not Initializing

If services fail to initialize:

1. Check environment variables are set
2. Verify Saleor API URL is accessible
3. Check channel slug matches your Saleor instance
4. Review service registry logs

### Translations Not Working

If translations aren't loading:

1. Verify translation files exist in `apps/storefront/messages/`
2. Check locale is in `SUPPORTED_LOCALES`
3. Ensure routing is configured correctly
4. Clear Next.js cache: `.next` folder

### Build Errors

If build fails:

1. Check all required environment variables are set
2. Verify package dependencies: `pnpm install`
3. Check for TypeScript errors: `pnpm type-check`
4. Review codegen output if using GraphQL

---

## Next Steps

After basic configuration:

1. **Customize Theme** - Adjust colors, fonts, and styling
2. **Add Custom Pages** - Create brand-specific pages
3. **Configure Analytics** - Add tracking (if needed)
4. **Set Up CI/CD** - Configure deployment pipeline
5. **Optimize Performance** - Configure caching and image optimization
6. **Add Custom Features** - Extend functionality as needed

---

## Additional Resources

- **Architecture Documentation:** See other docs in `nimara-docs-md/`
- **Service Registry:** `apps/storefront/src/services/registry.ts`
- **Configuration Files:** `apps/storefront/src/config.ts`
- **Recipe Configuration:** `nimara.recipe.yaml`

---

**Last Updated:** [Current Date]  
**Maintained By:** Nimara Team
