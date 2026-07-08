import * as dotenv from "dotenv";

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { pluginLlmsTxt } from "./src/plugins/llms-txt";

dotenv.config();

const algoliaSiteVerification = process.env.ALGOLIA_SITE_VERIFICATION;
const algoliaPublicApiKey = process.env.ALGOLIA_PUBLIC_API_KEY;
const algoliaAppId = process.env.ALGOLIA_APP_ID;
const algoliaCrawlerName = process.env.ALGOLIA_CRAWLER_NAME;

const isAlgolia = Boolean(
  algoliaPublicApiKey && algoliaAppId && algoliaCrawlerName,
);

const config: Config = {
  title: "Nimara",
  tagline: "Modern headless e-commerce platform built on Saleor",
  favicon: "img/favicon.svg",

  url: "https://docs.nimara.store",
  baseUrl: "/",

  organizationName: "mirumee",
  projectName: "nimara-ecommerce",
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  onBrokenAnchors: "throw",

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
          path: "../../docs",
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [pluginLlmsTxt],

  themeConfig: {
    image: "img/nimara-social.png",
    metadata: algoliaSiteVerification
      ? [
          {
            name: "algolia-site-verification",
            content: algoliaSiteVerification,
          },
        ]
      : [],
    ...(isAlgolia
      ? {
          algolia: {
            appId: algoliaAppId,
            apiKey: algoliaPublicApiKey,
            indexName: algoliaCrawlerName,
            contextualSearch: true,
          },
        }
      : {}),
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
              to: "/Quickstart/running-locally",
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
