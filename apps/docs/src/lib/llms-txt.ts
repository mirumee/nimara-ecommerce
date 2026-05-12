import fs from "node:fs";
import path from "node:path";

export const DOCS_PLUGIN_NAME = "docusaurus-plugin-content-docs";

const VERSIONED_DOCS_DIR = "versioned_docs";
const VERSIONED_SIDEBARS_DIR = "versioned_sidebars";
const DOC_FILE_EXTENSIONS = new Set([".md", ".mdx"]);

export type DocsRouteRecord = {
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

export type DocsSidebar = Record<string, DocsSidebarItem[]>;

export type LatestDocsContent = {
  allMdx: string[];
  latestDocsVersion: string;
  latestSidebar?: DocsSidebar;
};

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

export const getLatestDocsContent = async (
  siteDir: string,
): Promise<LatestDocsContent> => {
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
};

export const buildDocsIndex = ({
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
