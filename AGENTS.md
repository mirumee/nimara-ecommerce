# AGENTS.md - Developer Guidelines for Nimara E-commerce

This document provides guidelines for AI agents working in this repository.

## Project Overview

Nimara E-commerce is a monorepo using pnpm workspaces with Turbo. It contains:

- `apps/storefront` - Next.js storefront application
- `apps/marketplace` - Next.js marketplace application
- `apps/stripe` - Stripe integration
- `apps/docs` - Documentation site
- `packages/domain` - Domain logic
- `packages/infrastructure` - Infrastructure utilities
- `packages/ui` - Shared UI components

## Build, Lint, and Test Commands

### Running All Commands

```bash
# Install dependencies
pnpm install

# Build all packages/apps
pnpm build

# Run all tests
pnpm test

# Run linter on all files and auto-fix
pnpm lint  # in individual apps/packages

# Format code (Prettier)
pnpm format
pnpm format:check  # check without fixing
```

### Running Individual App Commands

```bash
# Storefront
pnpm dev:storefront       # Start dev server
pnpm build:storefront     # Build production
pnpm lint                 # Lint with --fix
pnpm test                 # Run tests
pnpm test:watch           # Watch mode

# Marketplace
pnpm dev:marketplace      # Start dev server
pnpm build                # Build production
pnpm lint                 # Lint
pnpm test                 # Run tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # With coverage

# Stripe
pnpm dev:stripe           # Start dev server
```

### Running a Single Test

```bash
# Using vitest (storefront, marketplace, stripe)
pnpm vitest run path/to/test-file.test.ts
pnpm vitest run --filter "test name pattern"
pnpm vitest run -t "test name"  # Run tests matching name

# Example: Run specific test file
cd apps/storefront
pnpm vitest run src/lib/some-file.test.ts

# Example: Run test by name
cd apps/storefront
pnpm vitest run -t "should validate form"
```

### Type Checking

```bash
# Full type check (TypeScript)
pnpm type-check  # in marketplace

# Next.js type check
cd apps/storefront
npx tsc --noEmit
```

## Code Style Guidelines

### General

- Use TypeScript for all new code
- Use functional components with hooks (React 19)
- Use Next.js 15 App Router
- Use Tailwind CSS for styling
- Use Zod for runtime validation
- Use Zod schemas for form validation with react-hook-form

### Formatting (Prettier)

- Semicolons: yes
- Single quotes: no (use double quotes)
- Trailing commas: all
- Indentation: 2 spaces
- Max line length: 80 characters
- Plugins: prettier-plugin-tailwindcss

### TypeScript Conventions

- Use `type` over `interface` for types
- Use inline type imports: `import type { SomeType }`
- Avoid `any` - use `unknown` if type is truly unknown
- Use strict null checking
- Enable `noUncheckedIndexedAccess`

```typescript
// Good
import type { FC } from "react";
import { useState } from "react";
import type { User } from "@/types";

interface Props {
  user: User;
}

// Avoid
import { FC } from "react"; // not using type modifier
```

### Import Order (enforced by eslint-plugin-simple-import-sort)

1. Side effect imports (`import "./foo"`)
2. Node.js builtins (`import fs from "node:fs"`)
3. External packages (`import lodash from "lodash"`)
4. @nimara packages (`import { something } from "@nimara/domain"`)
5. Aliases (`import { utils } from "@/utils"`)
6. Relative imports (`import { foo } from "../foo"`)

```typescript
// Correct order
import "./side-effect";

import React from "react";

import { useState } from "react";
import { format } from "date-fns";

import { useAuth } from "@nimara/auth";
import { AddressService } from "@nimara/domain";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MyComponent } from "./my-component";
```

### Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase starting with `use` (`useUserData.ts`)
- Utils: camelCase (`formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE for config values
- Files: kebab-case for utilities (`format-date.ts`)
- React components: PascalCase file names

### React Patterns

- Use functional components with TypeScript
- Use `import type { FC } from "react"` for component typing
- Extract types to separate files or use inline types for simple props
- Use `clsx` and `tailwind-merge` for conditional classes

```typescript
import type { FC } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export const Button: FC<ButtonProps> = ({ variant = "primary", className }) => {
  return (
    <button className={twMerge(clsx("base-class", variant === "primary" && "primary-class", className))}>
      Click me
    </button>
  );
};
```

### Error Handling

- Use try-catch with proper error typing
- Use Zod for validation errors
- Return typed results from functions

```typescript
// Good - typed error handling
const result = await fetchUser(id);
if (result.isErr()) {
  return result.error; // properly typed
}
return result.value;
```

### ESLint Rules

Key rules enforced:

- No default exports (`import/no-default-export`)
- No mutable exports (`import/no-mutable-exports`)
- No circular dependencies (`import/no-cycle`)
- Prefer inline type imports
- Use `await` in try-catch (`@typescript-eslint/return-await: "in-try-catch"`)
- Unused variables must be prefixed with `_`

### Git Conventions

- Use Conventional Commits:
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `refactor: restructure code`
  - `test: add tests`
- Branch naming: `feature/description` or `fix/description`

### Environment Variables

- Copy `.env.example` to `.env` for local development
- Never commit `.env` files with secrets
- Use `dotenv-cli` for commands requiring env vars

## Testing Guidelines

- Use Vitest for unit/integration tests
- Test files: `*.test.ts` or `*.spec.ts`
- Place tests next to the code being tested
- Use `@testing-library/react` for component tests (if needed)
- Mock external services and APIs
