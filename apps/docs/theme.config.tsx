import type { DocsThemeConfig } from "nextra-theme-docs";

import Logo from "./images/logo.svg";

const config: DocsThemeConfig = {
  logo: <Logo />,
  logoLink: "https://www.demo.nimara.store/",
  project: {
    link: "https://github.com/mirumee/nimara-ecommerce/tree/main/apps/storefront/",
  },
  docsRepositoryBase:
    "https://github.com/mirumee/nimara-ecommerce/tree/main/apps/docs/",
  chat: {
    link: "https://discord.com/channels/1271065464407068702/",
  },
  footer: {
    text: `© Nimara ${new Date().getFullYear()}`,
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Nimara",
    };
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
