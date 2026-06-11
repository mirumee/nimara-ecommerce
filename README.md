<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/docs/static/images/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="apps/docs/static/images/logo.svg">
    <img width="200" alt="nimara logo" src="apps/docs/static/images/logo.svg">
  </picture>
</div>

<div align="center">
  <strong>Modern and high-performance e-commerce storefront for multi-region, global brands</strong>
</div>

<br/>

<div align="center">

[![Nimara Demo](https://img.shields.io/badge/Nimara%20Demo-4CAF50?style=for-the-badge&logo=https://github.com/user-attachments/assets/1cef5626-94f3-4897-be6e-b5d73895b96b&logoWidth=30)](https://demo.nimara.store)
[![Join Discord](https://img.shields.io/badge/Join%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/w4V3PZxGDj)
[![View Documentation](https://img.shields.io/badge/View%20Docs-24292e?style=for-the-badge&logo=github&logoColor=white)](https://docs.nimara.store)

</div>

## Demo

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmirumee%2Fnimara-ecommerce&root-directory=apps%2Fstorefron)

</div>

<https://github.com/user-attachments/assets/373825cf-a4fc-4123-86eb-639c4c40d96f>

## Features

- **Full commerce experience:** Product catalog, search, cart, checkout, and customer accounts - everything a storefront needs to start selling, ready out of the box.

- **Multi-region & global brands:** Sell across multiple channels, currencies, languages, and markets from a single storefront, with localized content and pricing.

- **Privacy-first analytics:** Google Tag Manager and GA4 e-commerce tracking (product views, cart, checkout, purchase) built in, gated by Google Consent Mode v2 with a ready-made cookie consent banner. Enable it with a single env var, or plug in your own tracking provider.

- **Swap any integration:** Commerce backend, CMS, search, and payments each sit behind a typed contract, so you can change providers without rewriting the app. Ships with [Saleor](https://saleor.io/) as the default backend, plus [ButterCMS](https://buttercms.com/) and [Algolia](https://www.algolia.com/) as drop-in alternatives.

- **Secure payments:** Integrated [Stripe](https://stripe.com/) checkout for reliable, PCI-compliant payment processing, ready to extend to other gateways.

- **Marketplace ready:** Built-in support for vendor-aware, multi-seller marketplaces alongside standard single-brand stores.

- **AI & agent commerce:** Universal Commerce Protocol (UCP) integration exposes your catalog and checkout to AI agents and external platforms.

- **Start in minutes, own everything:** Zero-config storefront boots without any setup, and you own every line of code - no closed core, no required upgrades, no lock-in.

## Built with developers' favorite tools

The tech behind the features - a modern, fully typed stack we love working with:

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![next-intl](https://img.shields.io/badge/next--intl-EC4899?style=for-the-badge&logo=i18next&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Docusaurus](https://img.shields.io/badge/Docusaurus-3ECC5F?style=for-the-badge&logo=docusaurus&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

</div>

## Prerequisites

This project uses [pnpm](https://pnpm.io/installation) and [Turborepo](https://turbo.build/repo/docs/installing), so make sure you have them installed globally in your system:

```bash
npm install -g pnpm
```

```bash
pnpm install turbo --global
```

## ⚡ Quickstart

Clone this repository, [install `pnpm`](https://pnpm.io/installation) and install all dependencies in the repo:

```bash
pnpm i
```

Start the storefront development server:

```bash
pnpm run dev:storefront
```

The app is now running at `http://localhost:3000`.

> **Zero-config:** the storefront boots with no environment variables - every
> page renders with empty data (no products, no menu, checkout hidden). You only
> need a `.env` to connect a real backend.

To connect Saleor and other services, copy the storefront env template and fill in
what you need:

```bash
cp apps/storefront/.env.example apps/storefront/.env
```

Every variable is optional and documented inline. Run `pnpm preflight` at any time
to see which features are currently enabled and which env vars to set to turn the
rest on.

To generate GraphQL types (requires `NEXT_PUBLIC_SALEOR_API_URL` in `apps/storefront/.env`), run:

```bash
pnpm run codegen
```

## Daily Workflow and Releasing

The Git branching strategy (`develop` → `staging` → `main`) and the day-to-day and release process are documented here: [Daily Workflow & Releasing - Nimara Docs](https://docs.nimara.store/release-workflow).

## Deploying the app to Vercel using a Terraform

A guide how to deploy the app to Vercel using Terraform can be found here: [Using Terraform - Nimara Docs](https://docs.nimara.store/docs/quickstart/using-terraform).

## Documentation

The public documentation site is built with Docusaurus from `apps/docs` and published at [docs.nimara.store](https://docs.nimara.store).

Start with these docs:

- **[Overview](https://docs.nimara.store)** - Nimara documentation homepage
- **[Running Locally](https://docs.nimara.store/docs/quickstart/running-locally)** - Setup, installation, and local development
- **[Storefront](https://docs.nimara.store/docs/quickstart/storefront)** - Deploy the storefront to production
- **[Environment Variables](https://docs.nimara.store/docs/quickstart/environment-variables)** - Configure required and optional environment variables
- **[Using Terraform](https://docs.nimara.store/docs/quickstart/using-terraform)** - Deploy the app to Vercel using Terraform

For local development, build, deployment, and versioning of the docs site itself, see [`apps/docs/README.md`](./apps/docs/README.md).

## Community & Contribution

Join Nimara community on [Discord server](https://discord.gg/w4V3PZxGDj). You can ask questions, report bugs, participate in discussions, share ideas or make feature requests.

You can also contribute to Nimara in various ways:

- Report [issues](https://github.com/mirumee/nimara-ecommerce/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%F0%9F%90%9Bbug&projects=&template=--bug-report.yaml&title=%5Bbug%5D%3A+) and suggest [new features](https://github.com/mirumee/nimara-ecommerce/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%E2%9C%A8feature&projects=&template=--feature-request.yaml&title=%5Bfeature%5D%3A+).
- Review [documentation](https://docs.nimara.store) and submit [pull requests](https://github.com/mirumee/nimara-ecommerce/pulls)-whether it's fixing typos or adding new features.
- Share your experiences or projects related to Nimara with the broader community through talks or blog posts.
- Support [popular feature requests](https://github.com/mirumee/nimara-ecommerce/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) by upvoting them.

For detailed contributing guidelines, please see [Contributing Guide](./CONTRIBUTING.md)

### This wouldn't have been possible without your support

<a href="https://github.com/mirumee/nimara-ecommerce/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mirumee/nimara-ecommerce" />
</a>

<br/>

<div align="center"> <strong>Crafted with ❤️ by Mirumee Software</strong>

[nimara@mirumee.com](mailto:nimara@mirumee.com)

</div>
