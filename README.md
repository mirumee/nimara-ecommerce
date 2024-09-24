<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/docs/images/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="apps/docs/images/logo.svg">
    <img width="200" alt="nimara logo" src="apps/docs/images/logo.svg">
  </picture>
</div>

<div align="center">
  <strong>Modern and performant e-commerce storefront</strong>
</div>

<br/>

<div align="center">

[![Nimara Demo](https://img.shields.io/badge/Nimara%20Demo-4CAF50?style=for-the-badge&logo=https://github.com/user-attachments/assets/1cef5626-94f3-4897-be6e-b5d73895b96b&logoWidth=30)](https://nimara-stage.vercel.app/gb)
[![Join Discord](https://img.shields.io/badge/Join%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/w4V3PZxGDj)
[![View Documentation](https://img.shields.io/badge/View%20Docs-24292e?style=for-the-badge&logo=github&logoColor=white)](https://nimara-docs.vercel.app/)

</div>

## 🎥 Demo

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmirumee%2Fnimara-storefront&env=NEXT_PUBLIC_DEFAULT_CHANNEL,NEXT_PUBLIC_SALEOR_API_UR,SALEOR_APP_TOKEN,AUTH_SECRET,NEXT_PUBLIC_STRIPE_PUBLIC_KEY,STRIPE_SECRET_KEY,NEXT_PUBLIC_ENVIRONMENT,NEXT_PUBLIC_PAYMENT_APP_ID&envDescription=Read%20more&envLink=https%3A%2F%2Fnimara-docs.vercel.app%2Fquickstart%2Fstorefront&project-name=nimara&repository-name=nimara&demo-title=Nimara%20&demo-description=A%20modern%20and%20performant%20e-commerce%20storefront&demo-url=https%3A%2F%2Fnimara-stage.vercel.app%2F&demo-image=https%3A%2F%2Fgithub.com%2Fuser-attachments%2Fassets%2F6d2e8f83-ccfc-4f78-a773-fcaee16783d5)</div>

<https://github.com/user-attachments/assets/d493ad91-13a9-48e2-9653-eec1b10d5b97>

## 🚀 Features

- **Headless Architecture:** Built on Saleor, Nimara's headless architecture provides a flexible, easy-to-maintain, and ready-to-deploy solution for online businesses.

- **Extensibility:** Seamlessly integrate new providers as your business grows, whether it’s payment gateways, shipping services, or other third-party solutions.

- **User-Friendly UI**: Intuitive and easy to configure, Nimara's interface simplifies storefront customization and maintenance, reducing ongoing management efforts.

- **Ready for Deployment:** Nimara is ready to deploy from day one, enabling quick launches with minimal setup.

- **Cost-Effective Development:** Designed to minimize development costs while ensuring high performance, Nimara makes efficient use of modern tech stacks.

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

## ❤️ Community & Contribution

Join Nimara community on [GitHub Discussions](https://github.com/mirumee/nimara-storefront/discussions) and [Discord server](https://discord.gg/w4V3PZxGDj). You can ask questions, report bugs, participate in discussions, share ideas or make feature requests.

You can also contribute to Nimara in various ways:

- Report [issues](https://github.com/mirumee/nimara/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%F0%9F%90%9Bbug&projects=&template=--bug-report.yaml&title=%5Bbug%5D%3A+) and suggest [new features](https://github.com/mirumee/nimara/issues/new?assignees=srinivaspendem%2Cpushya22&labels=%E2%9C%A8feature&projects=&template=--feature-request.yaml&title=%5Bfeature%5D%3A+).
- Review [documentation](https://nimara-docs.vercel.app/) and submit [pull requests](https://github.com/mirumee/nimara-storefront)—whether it's fixing typos or adding new features.
- Share your experiences or projects related to Nimara with the broader community through talks or blog posts.
- Support [popular feature requests](https://github.com/mirumee/nimara-storefront/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) by upvoting them.

### This wouldn't have been possible without your support

<a href="https://github.com/mirumee/nimara-ecommerce/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mirumee/nimara-ecommerce" />
</a>

<br/>

<div align="center"> <strong>Crafted with ❤️ by Mirumee Software</strong>

[hello@mirumee.com](mailto:hello@mirumee.com)

</div>
