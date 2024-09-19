import type { DocsThemeConfig } from "nextra-theme-docs";

import Logo from "./images/logo.svg";

const config: DocsThemeConfig = {
  logo: <Logo />,
  logoLink: "https://www.nimara.store.com/",
  project: {
    // TODO: replace with Nimara OSS repo github link
    link: "https://github.com/mirumee/nimara-storefront/tree/main/apps/storybook/",
  },
  // TODO: replace with Nimara OSS repo github link
  docsRepositoryBase:
    "https://github.com/mirumee/nimara-storefront/tree/main/apps/docs/",
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
