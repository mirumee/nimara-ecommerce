# UI System: shadcn + Theme Tokens

## Problem
Both app and packages relied on shadcn components installed locally in the app.
This creates duplication and coupling.

## Solution: central UI package
Create `@nimara/ui` containing all shadcn components:
- Button, Input, Dialog, etc.
- re-export via `@nimara/ui`

Apps and packages import from `@nimara/ui` only.

## Theme tokens
Create `@nimara/theme`:
- `tokens.css` defining CSS variables
- `tailwind-preset` exporting Tailwind config preset

Apps:
- import tokens in `globals.css`
- override variables in `:root` for branding
- ensure Tailwind scans package sources + node_modules

## Next.js requirements
- add `transpilePackages: ["@nimara/ui", "@nimara/theme", ...]`
- Tailwind `content` includes packages
