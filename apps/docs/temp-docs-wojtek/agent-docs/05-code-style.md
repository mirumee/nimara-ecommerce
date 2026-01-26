# Code Style Guide

This document defines the coding conventions, style guidelines, and best practices for the Nimara project. All code should follow these standards to maintain consistency and quality.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Conventions](#typescript-conventions)
3. [React Patterns](#react-patterns)
4. [Import Organization](#import-organization)
5. [Naming Conventions](#naming-conventions)
6. [File Structure](#file-structure)
7. [Formatting](#formatting)
8. [Linting Rules](#linting-rules)

## General Principles

### Use `const` Over `let`

Always use `const` unless reassignment is required:

```typescript
// ✅ GOOD
const items = [];
items.push(newItem);

// ❌ BAD
let items = [];
items.push(newItem);
```

### Prefer `map` or `reduce` Over `forEach`

```typescript
// ✅ GOOD
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ❌ BAD
let doubled = [];
numbers.forEach(n => {
  doubled.push(n * 2);
});
```

### Avoid Default Exports

Use named exports instead:

```typescript
// ✅ GOOD
export function MyComponent() {
  return <div>Hello</div>;
}

// ❌ BAD
export default function MyComponent() {
  return <div>Hello</div>;
}
```

## TypeScript Conventions

### Type Imports

Use type imports for types and interfaces:

```typescript
// ✅ GOOD
import type { Product } from "@nimara/domain";
import { fetchProduct } from "./api";

// ❌ BAD
import { Product, fetchProduct } from "./api";
```

### Inline Type Imports

Prefer inline type imports when possible:

```typescript
// ✅ GOOD
import { fetchProduct, type Product } from "./api";

// Also acceptable
import type { Product } from "./api";
import { fetchProduct } from "./api";
```

### Type Definitions

```typescript
// ✅ GOOD: Use interfaces for object shapes
interface ProductProps {
  id: string;
  name: string;
}

// ✅ GOOD: Use type aliases for unions/intersections
type Status = "pending" | "completed" | "failed";
type ProductWithStatus = Product & { status: Status };

// ✅ GOOD: Empty interfaces are allowed
interface EmptyInterface {}
```

### Avoid `any`

Use `unknown` or proper types instead:

```typescript
// ✅ GOOD
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
}

// ❌ BAD
function processData(data: any) {
  return data.toUpperCase();
}
```

### Unused Variables

Prefix unused variables with `_`:

```typescript
// ✅ GOOD
function handler(_event: Event, data: Data) {
  return processData(data);
}

// ✅ GOOD
const [_first, second, _third] = array;
```

## React Patterns

### Component Structure

```typescript
// ✅ GOOD: Named export, proper typing
export function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <h2>{product.name}</h2>
    </div>
  );
}

// ✅ GOOD: Type definition
interface ProductCardProps {
  product: Product;
}
```

### Hooks

```typescript
// ✅ GOOD: Custom hooks
export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  // ...
  return product;
}

// ✅ GOOD: Hook dependencies
useEffect(() => {
  fetchData();
}, [dependency1, dependency2]);
```

### JSX

```typescript
// ✅ GOOD: No unnecessary braces
<div className="container">
  <h1>{title}</h1>
</div>

// ❌ BAD: Unnecessary braces
<div className={"container"}>
  <h1>{title}</h1>
</div>
```

## Import Organization

Imports are automatically sorted by `simple-import-sort`. Order:

1. **Side effect imports** (`^\\u0000`)
2. **Node.js builtins** (`^node:`)
3. **External packages** (`^@?\\w`)
4. **@nimara packages** (`^@nimara`)
5. **Aliases** (`^@/`)
6. **Relative imports** (`^\\.`)

```typescript
// ✅ GOOD: Properly sorted
import { useState } from "react";
import type { Product } from "@nimara/domain";
import { Button } from "@nimara/ui";
import { getServiceRegistry } from "@/services/registry";
import { formatPrice } from "./utils";
```

### Import Rules

- **No duplicate imports**: Use inline type imports
- **No mutable exports**: Exports should be immutable
- **No import cycles**: Circular dependencies are forbidden

## Naming Conventions

### Files and Directories

- **Components**: PascalCase (`ProductCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Types**: camelCase with `.types.ts` suffix (`product.types.ts`)
- **Actions**: camelCase with `.core.ts` suffix (`add-to-cart.core.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS.ts`)

### Variables and Functions

```typescript
// ✅ GOOD: camelCase for variables and functions
const productList = [];
function calculateTotal() {}

// ✅ GOOD: PascalCase for components and classes
function ProductCard() {}
class ProductService {}

// ✅ GOOD: UPPER_SNAKE_CASE for constants
const MAX_CART_ITEMS = 100;
const API_BASE_URL = "https://api.example.com";
```

### Types and Interfaces

```typescript
// ✅ GOOD: PascalCase for types/interfaces
interface ProductCardProps {}
type ProductStatus = "active" | "inactive";

// ✅ GOOD: Suffix types with descriptive names
type ProductInput = {};
type ProductOutput = {};
```

## File Structure

### Feature Package Structure

```
packages/features/{feature-name}/
├── shared/
│   ├── components/          # Reusable components
│   ├── actions/            # Action factories (*.core.ts)
│   ├── providers/          # Data providers
│   └── metadata/           # Metadata generation
├── shop-basic-{feature}/   # Feature variant
│   └── standard.tsx       # Main view component
├── messages/               # Translations (optional)
│   ├── en-US.json
│   └── en-GB.json
└── index.ts               # Public exports
```

### Action Files

```typescript
// ✅ GOOD: Action factory in *.core.ts
// packages/features/cart/shared/actions/add-to-cart.core.ts
export function createAddToCart({ cart }: { cart: CartPort }) {
  return async (input: AddToCartInput, ctx: ActionContext) => {
    return await cart.addItem(input);
  };
}
```

### Component Files

```typescript
// ✅ GOOD: Component with types
// packages/features/cart/shared/components/CartItem.tsx
interface CartItemProps {
  item: CartItem;
}

export function CartItem({ item }: CartItemProps) {
  return <div>{/* ... */}</div>;
}
```

## Formatting

### Prettier Configuration

The project uses Prettier with these settings:

```javascript
{
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
}
```

### EditorConfig

```
[*]
charset = utf-8
max_line_length = 80
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
```

### Formatting Rules

- **Semicolons**: Always use semicolons
- **Quotes**: Use double quotes for strings
- **Trailing Commas**: Always use trailing commas
- **Line Length**: Maximum 80 characters (soft limit)
- **Indentation**: 2 spaces

## Linting Rules

### ESLint Configuration

Key rules enforced:

#### Import Rules

```javascript
"import/no-mutable-exports": "error",
"import/no-cycle": "error",
"import/no-default-export": "error",
"import/no-duplicates": ["error", { "prefer-inline": true }],
```

#### TypeScript Rules

```javascript
"@typescript-eslint/consistent-type-imports": [
  "error",
  {
    prefer: "type-imports",
    fixStyle: "inline-type-imports",
  },
],
"@typescript-eslint/no-unused-vars": [
  "error",
  { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
],
```

#### Code Quality Rules

```javascript
"newline-before-return": "error",
"newline-after-var": "error",
"curly": "error",
```

### Restricted Imports

```typescript
// ❌ FORBIDDEN: Importing from apps in packages
import { something } from "@/app/...";  // Not allowed in packages

// ❌ FORBIDDEN: Importing from codegen directly
import { Product } from "@nimara/codegen";  // Use domain layer instead
```

## Architecture-Specific Rules

### Package Boundaries

```typescript
// ✅ GOOD: Package imports
import { Product } from "@nimara/domain";
import { Button } from "@nimara/ui";

// ❌ BAD: App imports in packages
import { something } from "@/app/...";
import { something } from "apps/storefront/...";
```

### Provider Usage

```typescript
// ✅ GOOD: Use injected providers
import { useNimara } from "@nimara/core";

export function Component() {
  const { commerce } = useNimara();
  // Use commerce provider
}

// ❌ BAD: Direct provider import
import { SaleorCommerce } from "@nimara/integrations-saleor";
```

### Routing

```typescript
// ✅ GOOD: Use routing injection
import { Link } from "@nimara/core-routing";

export function Component() {
  return <Link href="/products">Products</Link>;
}

// ❌ BAD: Direct app routing import
import { LocalizedLink } from "@/components/LocalizedLink";
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add product comparison feature
fix: resolve cart calculation bug
docs: update contributing guide
refactor: simplify provider wiring
test: add unit tests for cart actions
chore: update dependencies
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance tasks

## Code Review Checklist

Before submitting code:

- [ ] Code follows style guide
- [ ] All imports are properly organized
- [ ] No circular dependencies
- [ ] Types are properly defined
- [ ] No `any` types (unless necessary)
- [ ] Unused variables prefixed with `_`
- [ ] Commits follow conventional commits
- [ ] Code is formatted with Prettier
- [ ] ESLint passes without errors
- [ ] Tests pass

## Tools

### Formatting

```bash
# Format all files
pnpm run format

# Check formatting
pnpm run format:check
```

### Linting

Linting runs automatically via:
- **Husky**: Pre-commit hooks
- **Lint-staged**: Only lint staged files
- **CI/CD**: Full lint on pull requests

### Type Checking

```bash
# Type check
pnpm run build  # Includes type checking
```

## Resources

- [ESLint Config](../nimara-ecommerce/packages/eslint-config-custom/base.js)
- [Prettier Config](../nimara-ecommerce/prettier.config.js)
- [Architecture Documentation](../architecture.md)
- [Contributing Guide](./02-contributing.md)
