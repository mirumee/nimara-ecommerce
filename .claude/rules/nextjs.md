---
paths:
  - "apps/storefront/**/*.{js,mjs,ts,tsx}"
  - "apps/marketplace/**/*.{js,mjs,ts,tsx}"
  - "apps/stripe/**/*.{js,mjs,ts,tsx}"
---

# Next.js and React

- Prefer Server Components. Add `"use client"` only for interactivity, hooks, or
  browser APIs, and keep the client boundary narrow.
- Use Server Actions for mutations. Authenticate and authorize them like API routes,
  return Result-like values, and invalidate affected cache entries.
- Start independent data work together and await it with `Promise.all` to avoid
  waterfalls.
- Use `@nimara/ui` for shared primitives and `@nimara/features` for reusable feature
  implementations.
- Never import `@/app` from shared components or import `@nimara/codegen` into app or
  component code; access external data through infrastructure services.
- Keep server secrets out of client modules. Validate client and server environment
  variables in their separate environment modules.
- Use named exports except for Next.js files that require default exports.

For deeper framework guidance, use `vercel-react-best-practices` and
`vercel-composition-patterns`.
