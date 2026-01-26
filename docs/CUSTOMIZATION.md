# Customizing Nimara

**Last Updated:** January 26, 2026

This guide explains how to customize Nimara for your own storefront or marketplace.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Overriding Components](#overriding-components)
3. [Customizing Theme](#customizing-theme)
4. [Adding Custom Pages](#adding-custom-pages)
5. [Configuring Providers](#configuring-providers)
6. [Branding & Assets](#branding--assets)
7. [Deployment](#deployment)

---

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

#### 1. Update package.json

```json
{
  "name": "my-storefront",
  "version": "1.0.0",
  "private": true
}
```

#### 2. Update Recipe

Edit `nimara.recipe.yaml`:

```yaml
meta:
  name: "My Storefront"
  environments: ["dev", "prod"]
```

#### 3. Set Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
NEXT_PUBLIC_DEFAULT_CHANNEL=your-channel
NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront.com
```

---

## Overriding Components

Nimara uses an **override pattern** for customization without modifying packages directly.

**Override Location:** `apps/storefront/src/nimara/**`

### Override a Feature Component

#### 1. Copy from Package

```bash
# Example: Override ProductDetailPage
mkdir -p apps/storefront/src/nimara/features/product-detail-page
cp -r packages/features/product-detail-page/shop-basic-pdp/* \
     apps/storefront/src/nimara/features/product-detail-page/
```

#### 2. Modify the Component

```typescript
// apps/storefront/src/nimara/features/product-detail-page/standard.tsx
import { StandardPDPView as BasePDP } from "@nimara/features/product-detail-page";

export function StandardPDPView(props: ProductDetailPageProps) {
  return (
    <div className="custom-wrapper">
      <BasePDP {...props} />
      {/* Add custom sections */}
      <CustomReviewsSection />
    </div>
  );
}
```

#### 3. Use Your Override

```typescript
// apps/storefront/src/app/[locale]/(main)/products/[slug]/page.tsx
import { StandardPDPView } from "@/nimara/features/product-detail-page/standard";

export default async function Page(props: PageProps) {
  return <StandardPDPView {...props} />;
}
```

### Override UI Components

```bash
# Copy UI component
mkdir -p apps/storefront/src/nimara/ui
cp packages/ui/src/components/button.tsx apps/storefront/src/nimara/ui/
```

```typescript
// apps/storefront/src/nimara/ui/button.tsx
export function Button({ children, ...props }) {
  return (
    <button className="my-custom-button" {...props}>
      {children}
    </button>
  );
}
```

```typescript
// Use your override
import { Button } from "@/nimara/ui/button";
```

### Future CLI Override Command

When available:

```bash
nimara override feature product-detail-page
nimara override component Button
nimara override action add-to-cart
```

---

## Customizing Theme

### Color Scheme

Edit CSS variables in `packages/ui/src/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

Or override in your app at `apps/storefront/src/app/globals.css`.

### Typography

Configure fonts in `apps/storefront/src/app/layout.tsx`:

```typescript
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});
```

### Tailwind Configuration

Extend Tailwind in `apps/storefront/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF6B6B",
          secondary: "#4ECDC4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
    },
  },
};
```

---

## Adding Custom Pages

Create new pages in `apps/storefront/src/app/[locale]/(main)/`:

```typescript
// apps/storefront/src/app/[locale]/(main)/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our store...</p>
    </div>
  );
}
```

### With Dynamic Content

```typescript
// apps/storefront/src/app/[locale]/(main)/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

---

## Configuring Service Registry

Nimara uses a **service registry** pattern with lazy-loaded services for optimal performance. The registry is initialized once and provides access to all services throughout the application.

### Understanding the Service Registry

The service registry is located at `apps/storefront/src/services/registry.ts` and uses a singleton pattern:

```typescript
// apps/storefront/src/services/registry.ts
import { getLogger } from "@nimara/infrastructure/logging/service";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "../foundation/regions";
import { getAccessToken } from "./tokens";

const serviceRegistryInstance: ServiceRegistry | null = null;

/**
 * Initializes and returns the service registry singleton.
 * Services are lazy-loaded and only initialized when accessed.
 */
export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
  if (serviceRegistryInstance) {
    return serviceRegistryInstance;
  }

  const config = { cacheTTL: CACHE_TTL };
  const region = await getCurrentRegion();
  const accessToken = await getAccessToken();
  const logger = getLogger({ name: "storefront" });

  // Create lazy loaders for each service
  const getStoreService = createStoreServiceLoader(logger);
  const getCartService = createCartServiceLoader(logger);
  const getUserService = createUserServiceLoader(logger);
  const getSearchService = createSearchServiceLoader(logger);
  const getCMSPageService = createCMSPageServiceLoader(logger);
  const getCMSMenuService = createCMSMenuServiceLoader(logger);
  const getCollectionService = createCollectionServiceLoader(logger);

  return {
    config,
    accessToken,
    region,
    logger,
    getStoreService,
    getCartService,
    getUserService,
    getSearchService,
    getCMSPageService,
    getCMSMenuService,
    getCollectionService,
  };
};
```

### Creating Service Loaders

Services are lazy-loaded using loader functions. Here's how to create a custom service loader:

```typescript
// apps/storefront/src/services/lazy-loaders/my-custom-service.ts
import type { Logger } from "@nimara/infrastructure/logging";
import type { MyCustomService } from "@nimara/infrastructure/types";
import { MyCustomServiceImpl } from "@nimara/infrastructure/my-custom";

let cachedService: MyCustomService | null = null;

export const createMyCustomServiceLoader = (logger: Logger) => {
  return async (): Promise<MyCustomService> => {
    if (cachedService) {
      return cachedService;
    }

    logger.debug("Initializing My Custom Service");

    cachedService = new MyCustomServiceImpl({
      apiUrl: process.env.MY_CUSTOM_API_URL!,
      apiKey: process.env.MY_CUSTOM_API_KEY!,
    });

    return cachedService;
  };
};
```

### Adding a New Service

To add a new service to the registry:

**1. Create the service loader:**

```typescript
// apps/storefront/src/services/lazy-loaders/payment.ts
import type { Logger } from "@nimara/infrastructure/logging";
import type { PaymentService } from "@nimara/infrastructure/types";
import { StripePaymentService } from "@nimara/infrastructure/payment/stripe";

let cachedService: PaymentService | null = null;

export const createPaymentServiceLoader = (logger: Logger) => {
  return async (): Promise<PaymentService> => {
    if (cachedService) {
      return cachedService;
    }

    logger.debug("Initializing Payment Service");

    cachedService = new StripePaymentService({
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
    });

    return cachedService;
  };
};
```

**2. Register in the service registry:**

```typescript
// apps/storefront/src/services/registry.ts
import { createPaymentServiceLoader } from "./lazy-loaders/payment";

export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
  // ... existing code ...

  const getPaymentService = createPaymentServiceLoader(logger);

  return {
    config,
    accessToken,
    region,
    logger,
    // ... existing services ...
    getPaymentService, // Add your new service
  };
};
```

### Switching Service Implementations

To switch from one provider to another (e.g., Saleor to Shopify):

```typescript
// apps/storefront/src/services/lazy-loaders/store.ts
import { ShopifyStoreService } from "@nimara/infrastructure/store/shopify";
// Instead of: import { SaleorStoreService } from "@nimara/infrastructure/store/saleor";

let cachedService: StoreService | null = null;

export const createStoreServiceLoader = (logger: Logger) => {
  return async (): Promise<StoreService> => {
    if (cachedService) {
      return cachedService;
    }

    logger.debug("Initializing Store Service (Shopify)");

    cachedService = new ShopifyStoreService({
      domain: process.env.SHOPIFY_DOMAIN!,
      storefrontAccessToken: process.env.SHOPIFY_TOKEN!,
    });

    return cachedService;
  };
};
```

### Using Services in Your Code

**In Server Components or Server Actions:**

```typescript
import { getServiceRegistry } from "@/services/registry";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const registry = await getServiceRegistry();
  const storeService = await registry.getStoreService();

  const product = await storeService.productGet({ slug: params.slug });

  return <ProductView product={product} />;
}
```

**In Server Actions:**

```typescript
"use server";
import { getServiceRegistry } from "@/services/registry";

export async function addToCartAction(productId: string, quantity: number) {
  const registry = await getServiceRegistry();
  const cartService = await registry.getCartService();

  const result = await cartService.addItem({ productId, quantity });

  return { success: true, cart: result };
}
```

**Accessing Registry Configuration:**

```typescript
const registry = await getServiceRegistry();

// Access configuration
console.log(registry.config.cacheTTL);

// Access region information
console.log(registry.region.channel, registry.region.locale);

// Use logger
registry.logger.info("Processing checkout");

// Access token if needed
const token = registry.accessToken;
```

---

## Branding & Assets

### Logo

Replace logo in `apps/storefront/public/logo.svg`

### Favicon

Replace `apps/storefront/public/favicon.ico`

### Open Graph Images

Add `apps/storefront/public/og-image.jpg` for social media sharing.

### Metadata

Update in `apps/storefront/src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Store Name",
  description: "Your store description",
  openGraph: {
    title: "Your Store Name",
    description: "Your store description",
    images: ["/og-image.jpg"],
  },
};
```

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub** - Commit and push your customized storefront
2. **Connect to Vercel** - Import your GitHub repository
3. **Configure environment variables** - Add all required env vars
4. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the application
pnpm run build:storefront

# Start production server
pnpm run start:storefront
```

### Using Terraform

For infrastructure as code:

```bash
cd terraform/storefront

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply
```

### Docker (Future)

Docker support is planned for self-hosting.

---

## Environment-Specific Configuration

### Development

```bash
# .env.local
ENVIRONMENT=LOCAL
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000
```

### Staging

```bash
# .env.staging
ENVIRONMENT=STAGING
NEXT_PUBLIC_STOREFRONT_URL=https://staging.yourstore.com
```

### Production

```bash
# .env.production
ENVIRONMENT=PRODUCTION
NEXT_PUBLIC_STOREFRONT_URL=https://yourstore.com
```

---

## Best Practices

### 1. Keep Overrides Minimal

Only override what you need. This makes upgrades easier.

### 2. Document Your Changes

Add comments explaining why you made customizations.

### 3. Test Your Customizations

Run tests after making changes:

```bash
pnpm run test
pnpm run test:e2e
```

### 4. Version Control

Keep your customizations in version control, separate from package changes.

### 5. Stay Up to Date

Regularly sync with the main Nimara repository to get updates and fixes.

---

## Troubleshooting

### Override Not Working?

- Check import paths
- Verify file structure matches package structure
- Clear Next.js cache: `rm -rf .next`

### Build Errors?

- Run `pnpm run codegen`
- Check environment variables
- Verify all dependencies are installed

### Styling Issues?

- Check CSS variable names
- Verify Tailwind configuration
- Clear browser cache

---

**Need help?** Check [GitHub Issues](https://github.com/mirumee/nimara-ecommerce/issues).
