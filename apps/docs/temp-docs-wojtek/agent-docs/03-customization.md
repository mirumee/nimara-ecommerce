# Customizing Nimara for Your Project

This guide explains how to use Nimara as a starter template for your own storefront or marketplace. You'll learn how to customize, override, and configure Nimara to match your brand and requirements.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Overriding Components](#overriding-components)
3. [Customizing Theme](#customizing-theme)
4. [Adding Custom Pages](#adding-custom-pages)
5. [Configuring Providers](#configuring-providers)
6. [Branding & Assets](#branding--assets)
7. [Deployment](#deployment)

## Initial Setup

### Option 1: Fork the Repository

```bash
git clone https://github.com/mirumee/nimara-ecommerce.git my-storefront
cd my-storefront
```

### Option 2: Use as Template (Future)

When the CLI is available:

```bash
npx create-nimara-app my-storefront
cd my-storefront
```

### Configure Your Project

1. **Update package.json**:
   ```json
   {
     "name": "my-storefront",
     "version": "1.0.0",
     "private": true
   }
   ```

2. **Update recipe** (`nimara.recipe.yaml`):
   ```yaml
   meta:
     name: "My Storefront"
     environments: ["dev", "prod"]
   ```

3. **Set environment variables** (`.env`):
   ```bash
   NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
   NEXT_PUBLIC_DEFAULT_CHANNEL=your-channel
   NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront.com
   ```

## Overriding Components

### Override Pattern

Nimara uses an override pattern that allows you to customize without modifying packages directly.

**Override Location**: `apps/storefront/src/nimara/**`

### Overriding a Feature Component

1. **Copy from package to override location**:

```bash
# Example: Override ProductDetailPage
mkdir -p apps/storefront/src/nimara/features/product-detail-page
cp -r packages/features/product-detail-page/shop-basic-pdp/* \
     apps/storefront/src/nimara/features/product-detail-page/
```

2. **Modify the component**:

```typescript
// apps/storefront/src/nimara/features/product-detail-page/standard.tsx
import { StandardPDPView as BasePDP } from "@nimara/features/product-detail-page";

export function StandardPDPView(props: ProductDetailPageProps) {
  // Add your customizations
  return (
    <div className="custom-wrapper">
      <BasePDP {...props} />
      {/* Add custom sections */}
    </div>
  );
}
```

3. **Use your override in the route**:

```typescript
// apps/storefront/src/app/[locale]/(main)/products/[slug]/page.tsx
import { StandardPDPView } from "@/nimara/features/product-detail-page/standard";

export default async function Page(props: PageProps) {
  // Your override will be used
  return <StandardPDPView {...props} />;
}
```

### Overriding UI Components

1. **Copy from UI package**:

```bash
mkdir -p apps/storefront/src/nimara/ui
cp packages/ui/src/components/button.tsx apps/storefront/src/nimara/ui/
```

2. **Modify the component**:

```typescript
// apps/storefront/src/nimara/ui/button.tsx
// Your custom button implementation
export function Button({ children, ...props }) {
  return (
    <button className="my-custom-button" {...props}>
      {children}
    </button>
  );
}
```

3. **Import your override**:

```typescript
// Use your override instead of package
import { Button } from "@/nimara/ui/button";
```

### Future CLI Override Command

When available, use:

```bash
nimara override feature product-detail-page
nimara override component Button
nimara override action add-to-cart
```

## Customizing Theme

### Color Scheme

Edit CSS variables in `packages/ui/src/styles/globals.css` or override in your app:

```css
/* apps/storefront/src/app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 12, 6%, 15%;
  --foreground: 20, 7.1%, 90.2%;
  /* ... dark mode colors */
}
```

### Typography

Customize fonts in `tailwind.config.ts`:

```typescript
// apps/storefront/tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        tiny: '.625rem',
        xs: '.75rem',
        // ... customize sizes
      },
    },
  },
};
```

### Breakpoints

```typescript
// packages/config/src/tailwind.config.ts
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

## Adding Custom Pages

### 1. Create Route

```typescript
// apps/storefront/src/app/[locale]/(main)/about/page.tsx
import { getServiceRegistry } from "@/services/registry";

export default async function AboutPage() {
  const services = await getServiceRegistry();
  // Fetch any data you need
  return (
    <div>
      <h1>About Us</h1>
      {/* Your content */}
    </div>
  );
}
```

### 2. Add to Navigation

Update navigation components:

```typescript
// apps/storefront/src/components/navigation.tsx
const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" }, // Your custom page
];
```

### 3. Add Metadata

```typescript
// apps/storefront/src/app/[locale]/(main)/about/page.tsx
export async function generateMetadata() {
  return {
    title: "About Us",
    description: "Learn more about our company",
  };
}
```

## Configuring Providers

### Payment Provider

#### Using Stripe

1. **Set environment variables**:
   ```bash
   NEXT_PUBLIC_PAYMENT_APP_ID=your-payment-app-id
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Install Stripe Saleor App** in your Saleor instance

3. **Update recipe**:
   ```yaml
   infra:
     - payments: {provider: "payments-stripe"}
   ```

#### Using Dummy Provider (Development)

```yaml
infra:
  - payments: {provider: "payments-dummy"}
```

### Search Provider

#### Using Algolia

1. **Set environment variables**:
   ```bash
   NEXT_PUBLIC_SEARCH_SERVICE=ALGOLIA
   NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
   NEXT_PUBLIC_ALGOLIA_API_KEY=your-api-key
   ```

2. **Update recipe**:
   ```yaml
   infra:
     - search: {provider: "search-algolia"}
   ```

#### Using Saleor Search (Default)

```yaml
infra:
  - search: {provider: "search-saleor"}
```

### CMS Provider

#### Using ButterCMS

1. **Set environment variables**:
   ```bash
   NEXT_PUBLIC_CMS_SERVICE=BUTTER_CMS
   NEXT_PUBLIC_BUTTER_CMS_API_KEY=your-api-key
   ```

2. **Update recipe**:
   ```yaml
   infra:
     - content: {provider: "content-butter-cms"}
   ```

## Branding & Assets

### Logo

Replace logo files:

```bash
# Dark mode logo
apps/storefront/public/brand-logo-dark.svg

# Light mode logo (if separate)
apps/storefront/public/brand-logo-light.svg
```

Update logo references in header/navigation:

```typescript
// apps/storefront/src/components/header.tsx
import Image from "next/image";

<Image
  src="/brand-logo-dark.svg"
  alt="Your Brand"
  width={120}
  height={40}
/>
```

### Favicon & Icons

Replace in `apps/storefront/app/`:

- `icon.png` - App icon
- `icon.svg` - SVG icon
- `apple-icon.png` - Apple touch icon
- `favicon.ico` - Favicon

### OG Image

```bash
apps/storefront/public/og-hp.png
```

### Metadata

Update default metadata:

```typescript
// apps/storefront/src/config.ts
export const DEFAULT_PAGE_TITLE = "Your Store Name";
export const DEFAULT_EMAIL = "contact@yourdomain.com";
```

## Internationalization

### Add New Locale

1. **Add to regions config**:
   ```typescript
   // apps/storefront/src/foundation/regions/config.ts
   export const SUPPORTED_LOCALES = ["en-US", "en-GB", "fr-FR"] as const;
   ```

2. **Create translation file**:
   ```bash
   apps/storefront/messages/fr-FR.json
   ```

3. **Update routing**:
   ```typescript
   // apps/storefront/src/i18n/routing.ts
   export const routing = defineRouting({
     locales: ["en-US", "en-GB", "fr-FR"],
     defaultLocale: "en-US",
   });
   ```

4. **Add market configuration**:
   ```typescript
   export const MARKETS = {
     FR: {
       id: "fr",
       name: "France",
       channel: "channel-fr",
       currency: "EUR",
       // ...
     },
   };
   ```

## Deployment

### Vercel Deployment

#### Using Terraform

1. **Configure variables**:

```hcl
# terraform/storefront/example.public.auto.tfvars
vercel_project_name = "my-storefront"
github_repository = "your-org/your-repo"
github_production_branch = "main"

public_environment_variables = {
  "NEXT_PUBLIC_SALEOR_API_URL" = {
    envs_values = [{
      value = "https://your-saleor-instance.com/graphql/"
      target = ["production", "preview", "development"]
    }]
  }
}
```

2. **Deploy**:

```bash
cd terraform/storefront
terraform init
terraform plan
terraform apply
```

#### Manual Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Environment Configuration

Set environment-specific configs:

```bash
# Production
ENVIRONMENT=PRODUCTION
NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront.com

# Staging
ENVIRONMENT=STAGING
NEXT_PUBLIC_STOREFRONT_URL=https://staging.your-storefront.com
```

## Advanced Customization

### Custom Service Registry

Override service registry if needed:

```typescript
// apps/storefront/src/services/registry.ts
export async function getServiceRegistry() {
  // Your custom service initialization
  return {
    // ... services
  };
}
```

### Custom Middleware

```typescript
// apps/storefront/src/middleware.ts
export function middleware(request: NextRequest) {
  // Your custom middleware logic
}
```

### Custom API Routes

```typescript
// apps/storefront/src/app/api/custom/route.ts
export async function GET(request: Request) {
  // Your custom API logic
  return Response.json({ data: "..." });
}
```

## Best Practices

1. **Use Overrides**: Don't modify packages directly; use the override pattern
2. **Keep Structure**: Maintain folder structure in overrides for easier upgrades
3. **Version Control**: Commit your overrides and customizations
4. **Document Changes**: Document any significant customizations
5. **Test Thoroughly**: Test all customizations before deploying

## Migration Path

When upgrading Nimara:

1. **Review Changes**: Check changelog for breaking changes
2. **Update Dependencies**: `pnpm install`
3. **Test Overrides**: Ensure your overrides still work
4. **Update Recipe**: Update `nimara.recipe.yaml` if needed
5. **Run Tests**: `pnpm run test`

## Resources

- [Developer Configuration Guide](../tutorials/developer-configuration-guide.md) - Detailed configuration
- [Architecture Documentation](../architecture.md) - Architecture details
- [Getting Started](./01-getting-started.md) - Setup guide
