import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Nimara",
  tagline: "Modern headless e-commerce platform built on Saleor",
  favicon: "img/favicon.svg",

  url: "https://mirumee.github.io",
  baseUrl: "/",

  organizationName: "mirumee",
  projectName: "nimara-ecommerce",
  trailingSlash: false,

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      {
        docs: {
          editUrl:
            "https://github.com/mirumee/nimara-ecommerce/tree/main/apps/docs/",
          routeBasePath: "/",
          lastVersion: "1.15.0",
          includeCurrentVersion: false,
          versions: {
            "1.15.0": {
              label: "1.15.0",
            },
            "1.14.0": {
              label: "1.14.0",
              path: "1.14.0",
              banner: "unmaintained",
            },
          },
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/nimara-social.png",
    navbar: {
      title: "Nimara",
      logo: {
        alt: "Nimara Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-light.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          href: "https://www.demo.nimara.store/",
          label: "Demo",
          position: "right",
        },
        {
          href: "https://github.com/mirumee/nimara-ecommerce",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Overview",
              to: "/",
            },
            {
              label: "Quickstart",
              to: "/running-locally",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/H52JTZAtSH",
            },
            {
              label: "GitHub",
              href: "https://github.com/mirumee/nimara-ecommerce",
            },
          ],
        },
        {
          title: "Nimara",
          items: [
            {
              label: "Demo Store",
              href: "https://www.demo.nimara.store/",
            },
            {
              label: "Mirumee",
              href: "https://mirumee.com/",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Nimara`,
    },
    prism: {
      additionalLanguages: ["bash", "hcl", "properties"],
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
