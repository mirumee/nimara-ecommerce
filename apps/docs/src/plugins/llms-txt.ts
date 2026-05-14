import fs from "node:fs";
import path from "node:path";

import type { LoadContext, Plugin } from "@docusaurus/types";

import {
  buildDocsIndex,
  DOCS_PLUGIN_NAME,
  type DocsRouteRecord,
  getLatestDocsContent,
  type LatestDocsContent,
} from "../lib/llms-txt";

export async function pluginLlmsTxt(
  context: LoadContext,
): Promise<Plugin<LatestDocsContent>> {
  return {
    name: "llms-txt-plugin",
    loadContent: async () => {
      return getLatestDocsContent(context.siteDir);
    },
    postBuild: async ({ content, routes, outDir }) => {
      const { allMdx, latestDocsVersion, latestSidebar } = content;

      const concatenatedPath = path.join(outDir, "llms-full.txt");

      await fs.promises.writeFile(concatenatedPath, allMdx.join("\n\n---\n\n"));

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
}
