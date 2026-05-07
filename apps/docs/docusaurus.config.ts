import fs from "node:fs";
import path from "node:path";

import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import src from "@docusaurus/theme-mermaid/src/index.js";

const DOCS_PLUGIN_NAME = "docusaurus-plugin-content-docs";
const VERSIONED_DOCS_DIR = "versioned_docs";
const VERSIONED_SIDEBARS_DIR = "versioned_sidebars";
const DOC_FILE_EXTENSIONS = new Set([".md", ".mdx"]);

type DocsRouteRecord = {
  description?: unknown;
  id?: unknown;
  path?: unknown;
  title?: unknown;
};

type DocsSidebarItem =
  | string
  | {
      id?: string;
      items?: DocsSidebarItem[];
      label?: string;
      type?: string;
    };

type DocsSidebar = Record<string, DocsSidebarItem[]>;

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const getLatestDocsVersion = async (siteDir: string): Promise<string> => {
  const versionsPath = path.join(siteDir, "versions.json");

  try {
    const versions = JSON.parse(
      await fs.promises.readFile(versionsPath, "utf8"),
    ) as string[];
    const [latestVersion] = versions;

    if (latestVersion) {
      return latestVersion;
    }
  } catch {
    // Fall back to scanning versioned_docs when versions.json is unavailable.
  }

  const entries = await fs.promises.readdir(
    path.join(siteDir, VERSIONED_DOCS_DIR),
    {
      withFileTypes: true,
    },
  );
  const versions = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("version-"))
    .map((entry) => entry.name.replace(/^version-/, ""))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  if (!versions[0]) {
    throw new Error("No versioned docs found for llms.txt generation.");
  }

  return versions[0];
};

const getDocFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          return getDocFiles(fullPath);
        }

        return DOC_FILE_EXTENSIONS.has(path.extname(entry.name))
          ? [fullPath]
          : [];
      }),
  );

  return files.flat();
};

const getLatestSidebar = async (
  siteDir: string,
  version: string,
): Promise<DocsSidebar | undefined> => {
  const sidebarPath = path.join(
    siteDir,
    VERSIONED_SIDEBARS_DIR,
    `version-${version}-sidebars.json`,
  );

  try {
    return JSON.parse(
      await fs.promises.readFile(sidebarPath, "utf8"),
    ) as DocsSidebar;
  } catch {
    return undefined;
  }
};

const buildAbsoluteDocUrl = (
  siteUrl: string,
  baseUrl: string,
  routePath: string,
): string => {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
  const normalizedBaseUrl =
    baseUrl === "/" ? "" : `/${baseUrl.replace(/^\/|\/$/g, "")}`;
  const normalizedRoutePath =
    routePath === "/" ? "/" : `/${routePath.replace(/^\/|\/$/g, "")}`;

  return `${normalizedSiteUrl}${normalizedBaseUrl}${normalizedRoutePath}`;
};

const buildDocLine = ({
  baseUrl,
  doc,
  fallbackId,
  label,
  siteUrl,
}: {
  baseUrl: string;
  doc: DocsRouteRecord;
  fallbackId: string;
  label?: string;
  siteUrl: string;
}): string => {
  const title = label ?? getString(doc.title) ?? fallbackId;
  const routePath = getString(doc.path) ?? `/${fallbackId}`;
  const description = getString(doc.description);
  const line = `- [${title}](${buildAbsoluteDocUrl(siteUrl, baseUrl, routePath)})`;

  return description ? `${line}: ${description}` : line;
};

const getSidebarDocLines = ({
  baseUrl,
  docs,
  items,
  siteUrl,
  usedDocIds,
}: {
  baseUrl: string;
  docs: Record<string, DocsRouteRecord>;
  items: DocsSidebarItem[];
  siteUrl: string;
  usedDocIds: Set<string>;
}): string[] => {
  return items.flatMap((item) => {
    if (typeof item === "string") {
      const doc = docs[item];

      if (!doc) {
        return [];
      }

      usedDocIds.add(item);

      return buildDocLine({ baseUrl, doc, fallbackId: item, siteUrl });
    }

    if (item.type === "doc" && item.id && docs[item.id]) {
      usedDocIds.add(item.id);

      return buildDocLine({
        baseUrl,
        doc: docs[item.id],
        fallbackId: item.id,
        label: item.label,
        siteUrl,
      });
    }

    if (item.type === "category" && item.items) {
      return getSidebarDocLines({
        baseUrl,
        docs,
        items: item.items,
        siteUrl,
        usedDocIds,
      });
    }

    return [];
  });
};

const buildDocsIndex = ({
  baseUrl,
  docs,
  sidebar,
  siteTitle,
  siteUrl,
  tagline,
  version,
}: {
  baseUrl: string;
  docs: Record<string, DocsRouteRecord>;
  sidebar?: DocsSidebar;
  siteTitle: string;
  siteUrl: string;
  tagline?: string;
  version: string;
}): string => {
  const usedDocIds = new Set<string>();
  const headerLines = [`# ${siteTitle} Documentation`];

  if (tagline) {
    headerLines.push("", tagline);
  }

  headerLines.push("", `Latest docs version: ${version}.`);

  const sectionLines: string[] = [];
  const sidebarItems = sidebar ? Object.values(sidebar)[0] : undefined;

  if (sidebarItems) {
    const rootDocLines: string[] = [];

    for (const item of sidebarItems) {
      if (typeof item === "string" || item.type === "doc") {
        rootDocLines.push(
          ...getSidebarDocLines({
            baseUrl,
            docs,
            items: [item],
            siteUrl,
            usedDocIds,
          }),
        );
        continue;
      }

      if (item.type === "category" && item.label && item.items) {
        const categoryLines = getSidebarDocLines({
          baseUrl,
          docs,
          items: item.items,
          siteUrl,
          usedDocIds,
        });

        if (categoryLines.length > 0) {
          sectionLines.push("", `## ${item.label}`, "", ...categoryLines);
        }
      }
    }

    if (rootDocLines.length > 0) {
      sectionLines.unshift("", "## Docs", "", ...rootDocLines);
    }
  }

  const remainingDocLines = Object.entries(docs)
    .filter(([docId]) => !usedDocIds.has(docId))
    .map(([docId, doc]) =>
      buildDocLine({ baseUrl, doc, fallbackId: docId, siteUrl }),
    );

  if (remainingDocLines.length > 0) {
    sectionLines.push(
      "",
      sidebarItems ? "## Additional Docs" : "## Docs",
      "",
      ...remainingDocLines,
    );
  }

  return `${headerLines.concat(sectionLines).join("\n")}\n`;
};

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

  plugins: [
    async function pluginLlmsTxt(context) {
      return {
        name: "llms-txt-plugin",
        loadContent: async () => {
          const { siteDir } = context;
          const latestDocsVersion = await getLatestDocsVersion(siteDir);
          const contentDir = path.join(
            siteDir,
            VERSIONED_DOCS_DIR,
            `version-${latestDocsVersion}`,
          );
          const [docFiles, latestSidebar] = await Promise.all([
            getDocFiles(contentDir),
            getLatestSidebar(siteDir, latestDocsVersion),
          ]);
          const allMdx = await Promise.all(
            docFiles.map((filePath) => fs.promises.readFile(filePath, "utf8")),
          );

          return { allMdx, latestDocsVersion, latestSidebar };
        },
        postBuild: async ({ content, routes, outDir }) => {
          const { allMdx, latestDocsVersion, latestSidebar } = content as {
            allMdx: string[];
            latestDocsVersion: string;
            latestSidebar?: DocsSidebar;
          };

          const concatenatedPath = path.join(outDir, "llms-full.txt");
          await fs.promises.writeFile(
            concatenatedPath,
            allMdx.join("\n\n---\n\n"),
          );

          const docsPluginRouteConfig = routes.find(
            (route) => route.plugin.name === DOCS_PLUGIN_NAME,
          );

          const latestDocsRouteConfig = docsPluginRouteConfig?.routes?.find(
            (route) => route.path === "/",
          );

          if (!latestDocsRouteConfig?.props?.version) {
            return;
          }

          const currentVersionDocsRoutes = (
            latestDocsRouteConfig.props.version as Record<string, unknown>
          ).docs as Record<string, DocsRouteRecord>;

          const llmsTxt = buildDocsIndex({
            baseUrl: context.siteConfig.baseUrl,
            docs: currentVersionDocsRoutes,
            sidebar: latestSidebar,
            siteTitle: context.siteConfig.title,
            siteUrl: context.siteConfig.url,
            tagline: context.siteConfig.tagline,
            version: latestDocsVersion,
          });
          const llmsTxtPath = path.join(outDir, "llms.txt");
          await fs.promises.writeFile(llmsTxtPath, llmsTxt);
        },
      };
    },
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
