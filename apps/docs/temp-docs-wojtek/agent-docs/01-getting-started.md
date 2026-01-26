# Getting Started with Nimara

This guide will help you set up and run the Nimara project for the first time.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22.x (check with `node --version`)
- **pnpm**: Package manager (install with `npm install -g pnpm`)
- **Turborepo**: Build system (install with `pnpm install turbo --global`)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mirumee/nimara-ecommerce.git
cd nimara-ecommerce
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo using pnpm workspaces.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example` if available):

```bash
cp .env.example .env
```

**Required Environment Variables:**

```bash
# Saleor Connection
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel

# Storefront URL
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000

# Environment
ENVIRONMENT=LOCAL

# Default Settings
NEXT_PUBLIC_DEFAULT_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_DEFAULT_PAGE_TITLE=Your Store Name
```

**Optional Variables (for full functionality):**

```bash
# Payment Provider (Stripe)
NEXT_PUBLIC_PAYMENT_APP_ID=your-payment-app-id
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Search Provider (Algolia)
NEXT_PUBLIC_SEARCH_SERVICE=ALGOLIA
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_API_KEY=your-algolia-api-key

# CMS Provider (ButterCMS)
NEXT_PUBLIC_CMS_SERVICE=BUTTER_CMS
NEXT_PUBLIC_BUTTER_CMS_API_KEY=your-butter-cms-key
```

### 4. Generate TypeScript Types

Run the codegen to generate GraphQL types:

```bash
pnpm run codegen
```

### 5. Start Development Server

To start just the storefront:

```bash
pnpm run dev:storefront
```

Or start all apps:

```bash
pnpm run dev
```

The storefront will be available at `http://localhost:3000`.

## Project Structure Overview

```
nimara-ecommerce/
├── apps/
│   ├── storefront/          # Next.js storefront app (main app)
│   ├── stripe/              # Stripe integration app
│   └── automated-tests/     # E2E tests
├── packages/
│   ├── domain/              # Pure domain models/types
│   ├── features/            # Feature packages (PDP, PLP, Cart, etc.)
│   ├── infrastructure/      # Integration adapters (Saleor, Stripe, etc.)
│   ├── ui/                  # shadcn/ui components
│   ├── foundation/          # Core utilities and providers
│   └── config/              # Shared configuration
├── terraform/               # Infrastructure as code
└── nimara.recipe.yaml       # Project composition configuration
```

## Running Common Commands

### Development

```bash
# Start storefront only
pnpm run dev:storefront

# Start all apps
pnpm run dev

# Start with specific app
pnpm run dev --filter=storefront
```

### Building

```bash
# Build all packages and apps
pnpm run build

# Build storefront only
pnpm run build:storefront

# Build specific package/app
pnpm run build --filter=storefront
```

### Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run E2E tests
pnpm run test:e2e
```

### Code Quality

```bash
# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Lint (usually runs automatically via husky)
```

## First-Time Configuration

### 1. Configure Saleor Connection

Edit `.env` and set:
- `NEXT_PUBLIC_SALEOR_API_URL` - Your Saleor GraphQL endpoint
- `NEXT_PUBLIC_DEFAULT_CHANNEL` - Channel slug from your Saleor instance

### 2. Configure Regions/Channels

Edit `apps/storefront/src/foundation/regions/config.ts` to match your Saleor setup:

```typescript
export const MARKETS = {
  US: {
    id: "us",
    name: "United States of America",
    channel: "channel-us",  // Your Saleor channel slug
    currency: "USD",
    // ...
  },
};
```

### 3. Configure i18n

Edit `apps/storefront/src/i18n/routing.ts` to set supported locales:

```typescript
export const routing = defineRouting({
  locales: ["en-US", "en-GB"],  // Your supported locales
  defaultLocale: "en-US",
  // ...
});
```

### 4. Verify Recipe Configuration

Check `nimara.recipe.yaml` to ensure it matches your setup:

```yaml
apps:
  - name: storefront
    recipe:
      pages:
        - home: {provider: "shop-basic-home"}
        - plp: {provider: "shop-basic-plp"}
        - pdp: {provider: "shop-basic-pdp"}
      infra:
        - search: {provider: "search-saleor"}
        - payments: {provider: "payments-dummy"}
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors:

1. Ensure you've run `pnpm run codegen`
2. Restart the TypeScript server in your IDE
3. Check that all environment variables are set correctly

### Services Not Initializing

If services fail to initialize:

1. Verify `NEXT_PUBLIC_SALEOR_API_URL` is accessible
2. Check that the channel slug matches your Saleor instance
3. Review service registry logs in `apps/storefront/src/services/registry.ts`

### Build Failures

If builds fail:

1. Ensure all dependencies are installed: `pnpm install`
2. Check for TypeScript errors: `pnpm run build`
3. Verify environment variables are set
4. Clear `.next` cache if needed

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 pnpm run dev:storefront
```

## Next Steps

After successful setup:

1. **Explore the Storefront**: Visit `http://localhost:3000` and browse the site
2. **Review Architecture**: Read [Architecture Documentation](../architecture.md)
3. **Customize Theme**: See [Customization Guide](./03-customization.md)
4. **Add Features**: See [Contributing Guide](./02-contributing.md)

## Development Workflow

### Daily Development

1. Always work from the `develop` branch:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. Push and create a Pull Request to `develop`

### Hot Reloading

The development server supports hot reloading. Changes to:
- React components will hot reload
- Server components require a refresh
- Configuration changes require a restart

## Additional Resources

- [Developer Configuration Guide](../tutorials/developer-configuration-guide.md) - Detailed configuration options
- [Architecture Documentation](../architecture.md) - Deep dive into architecture
- [Contributing Guide](./02-contributing.md) - How to contribute
