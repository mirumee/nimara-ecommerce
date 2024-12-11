import { type DocsThemeConfig, useConfig } from "nextra-theme-docs";

import Logo from "./images/logo.svg";

const config: DocsThemeConfig = {
  head: () => {
    const { frontMatter } = useConfig();

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:title"
          content={`${frontMatter.title} | Nimara Storefront`}
        />
      </>
    );
  },
  logo: <Logo />,
  logoLink: "https://www.demo.nimara.store/",
  project: {
    link: "https://github.com/mirumee/nimara-ecommerce/tree/main/apps/storefront",
  },
  docsRepositoryBase:
    "https://github.com/mirumee/nimara-ecommerce/tree/main/apps/docs",
  chat: {
    link: "https://discord.com/channels/1271065464407068702",
  },
  footer: {
    content: `© Nimara ${new Date().getFullYear()}`,
  },
};

export default config;
