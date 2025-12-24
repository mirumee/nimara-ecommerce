# Frontend Dockerfile for nimara-ecommerce (Next.js 15)
# Multi-stage build for optimized image size

# Stage 1: Dependencies installation
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for workspace dependencies
COPY packages/codegen/package.json ./packages/codegen/
COPY packages/config/package.json ./packages/config/
COPY packages/domain/package.json ./packages/domain/
COPY packages/eslint-config-custom/package.json ./packages/eslint-config-custom/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY apps/storefront/package.json ./apps/storefront/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/storefront/node_modules ./apps/storefront/node_modules

# Copy all source files
COPY . .

# Build arguments for environment variables (optional)
ARG NEXT_PUBLIC_SALEOR_API_URL
ARG NEXT_PUBLIC_DEFAULT_CHANNEL
ENV NEXT_PUBLIC_SALEOR_API_URL=${NEXT_PUBLIC_SALEOR_API_URL}
ENV NEXT_PUBLIC_DEFAULT_CHANNEL=${NEXT_PUBLIC_DEFAULT_CHANNEL}

# Build the storefront
RUN pnpm run build:storefront

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/package.json ./apps/storefront/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
WORKDIR /app/apps/storefront
CMD ["pnpm", "start"]

