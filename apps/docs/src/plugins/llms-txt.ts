import fs from "node:fs";
import path from "node:path";

import type { LoadContext, Plugin } from "@docusaurus/types";

import { buildDocsIndex, getDocsFiles } from "../lib/llms-txt";

export async function pluginLlmsTxt(context: LoadContext): Promise<Plugin> {
  return {
    name: "llms-txt-plugin",
    postBuild: async ({ outDir }) => {
      const docs = await getDocsFiles(context.siteDir);

      await Promise.all(
        docs.map(async ({ content, relPath }) => {
          const dest = path.join(outDir, "docs", relPath);

          await fs.promises.mkdir(path.dirname(dest), { recursive: true });
          await fs.promises.writeFile(dest, content);
        }),
      );

      await fs.promises.writeFile(
        path.join(outDir, "llms-full.txt"),
        docs.map(({ content }) => content).join("\n\n---\n\n"),
      );

      const llmsTxt = buildDocsIndex({
        docs,
        siteTitle: context.siteConfig.title,
        siteUrl: context.siteConfig.url,
        tagline: context.siteConfig.tagline,
      });

      await fs.promises.writeFile(path.join(outDir, "llms.txt"), llmsTxt);
    },
  };
}
