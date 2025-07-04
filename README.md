<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/docs/images/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="apps/docs/images/logo.svg">
    <img width="200" alt="nimara logo" src="apps/docs/images/logo.svg">
  </picture>
</div>

<div align="center">
  <strong>Modern and high-performance e-commerce storefront for multi-region, global brands</strong>
</div>

<br/>

<div align="center">

[![Nimara Demo](https://img.shields.io/badge/Nimara%20Demo-4CAF50?style=for-the-badge&logo=https://github.com/user-attachments/assets/1cef5626-94f3-4897-be6e-b5d73895b96b&logoWidth=30)](https://demo.nimara.store)
[![Join Discord](https://img.shields.io/badge/Join%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/w4V3PZxGDj)
[![View Documentation](https://img.shields.io/badge/View%20Docs-24292e?style=for-the-badge&logo=github&logoColor=white)](https://nimara-docs.vercel.app/)

</div>

## 🎥 Demo

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmirumee%2Fnimara-ecommerce&env=NEXT_PUBLIC_DEFAULT_CHANNEL,NEXT_PUBLIC_SALEOR_API_URL,SALEOR_APP_TOKEN,AUTH_SECRET,NEXT_PUBLIC_STRIPE_PUBLIC_KEY,STRIPE_SECRET_KEY,NEXT_PUBLIC_ENVIRONMENT,NEXT_PUBLIC_PAYMENT_APP_ID&project-name=my-nimara-storefront)

</div>

<https://github.com/user-attachments/assets/373825cf-a4fc-4123-86eb-639c4c40d96f>

## 🚀 Features

- **Headless Architecture:** Nimara's headless architecture provides a flexible, easy-to-maintain, and ready-to-deploy solution for online businesses.

- **Next.js 15:** App router, React Server Components (RSC), Server Actions, Caching and Static Site Generation (SSG) support with Typescript setup.

- **Shadcn UI/Tailwind CSS:** Nimara's UI uses [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/), providing a modern and customizable design system.

- **Turborepo:** Nimara's monorepo is powered by [Turborepo](https://turbo.build/repo/docs/getting-started/introduction), a fast and scalable build system for monorepos. Automated tests with [Playwright](https://playwright.dev/) and setup for [Docs](https://nextra.site/) are included.

- **Stripe Integration:** Nimara's storefront uses Stripe [Payment Element](https://docs.stripe.com/payments/payment-element) for secure payment processing.

- **Customizable infrastructure:** Nimara's infrastructure is highly customizable, allowing you to tailor it to your specific needs and requirements. Extend it by providing the setup to any third-party service.

- **Tooling included:** Comes with ESLint, Prettier, Husky, Lint Staged, and Codegen preconfigured.

## 🔧 Prerequisites

This project uses [pnpm](https://pnpm.io/installation) and [Turborepo](https://turbo.build/repo/docs/installing), so make sure you have them installed globally in your system:

```bash
npm install -g pnpm
```

```bash
pnpm install turbo --global
```

## ⚡ Quickstart

Clone this repository and copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` file and provide required variables.

Then, [install `pnpm`](https://pnpm.io/installation) and run the following command to install all dependencies in the repo:

```bash
pnpm i
```

To start just the development server for storefront, run this

```bash
pnpm run dev:storefront
```

To generate a new types, run this:

```bash
pnpm run codegen
```

The app is now running at `http://localhost:3000`.

## Deploying the app to Vercel using a Terraform

A guide how to deploy the app to Vercel using a Terraform can be found here: [Using Terraform - Nimara Docs](https://docs.nimara.store/quickstart/using-terraform).

## ❤️ Community & Contribution

Join Nimara community on [GitHub Discussions](https://github.com/mirumee/nimara-ecommerce/discussions) and [Discord server](https://discord.gg/w4V3PZxGDj). You can ask questions, report bugs, participate in discussions, share ideas or make feature requests.

You can also contribute to Nimara in various ways:

- Report [issues](https://github.com/mirumee/nimara-ecommerce/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%F0%9F%90%9Bbug&projects=&template=--bug-report.yaml&title=%5Bbug%5D%3A+) and suggest [new features](https://github.com/mirumee/nimara-ecommerce/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%E2%9C%A8feature&projects=&template=--feature-request.yaml&title=%5Bfeature%5D%3A+).
- Review [documentation](https://nimara-docs.vercel.app/) and submit [pull requests](https://github.com/mirumee/nimara-ecommerce/pulls)—whether it's fixing typos or adding new features.
- Share your experiences or projects related to Nimara with the broader community through talks or blog posts.
- Support [popular feature requests](https://github.com/mirumee/nimara-ecommerce/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) by upvoting them.

For detailed contributing guidelines, please see [How to contribute to Nimara Storefron guide](./CONTRIBUTING.md)

### This wouldn't have been possible without your support

<a href="https://github.com/mirumee/nimara-ecommerce/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mirumee/nimara-ecommerce" />
</a>

<br/>

<div align="center"> <strong>Crafted with ❤️ by Mirumee Software</strong>

[hello@mirumee.com](mailto:hello@mirumee.com)

</div>
