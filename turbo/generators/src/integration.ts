import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { TEMPLATE_SERVICE } from "./names.ts";

const rewrite = async ({
  path,
  replacements,
}: {
  path: string;
  replacements: [from: string, to: string][];
}) => {
  let contents = await readFile(path, "utf8");

  for (const [from, to] of replacements) {
    if (!contents.includes(from)) {
      throw new Error(`Expected ${JSON.stringify(from)} in ${path}.`);
    }

    contents = contents.replace(from, to);
  }

  await writeFile(path, contents);
};

// consumer/config.ts and event/config.ts start out byte-identical to this.
const SHARED_CONFIG = [
  'import { prepareServiceConfig } from "@nimara/lib/config/service";',
  "",
  'import { appConfigSchema } from "@/domain/app-config";',
  "",
  'import packageJson from "../../../package.json";',
  "",
  "export const APP_CONFIG = prepareServiceConfig({",
  "  moduleUrl: import.meta.url,",
  "  pkg: packageJson,",
  "  schema: appConfigSchema,",
  "});",
  "",
].join("\n");

// handler/config.ts also carries APP_ID, the Saleor manifest's app id.
const HANDLER_CONFIG = [
  'import { prepareServiceConfig } from "@nimara/lib/config/service";',
  "",
  'import { appConfigSchema } from "@/domain/app-config";',
  "",
  'import packageJson from "../../../package.json";',
  "",
  "const parsed = prepareServiceConfig({",
  "  moduleUrl: import.meta.url,",
  "  pkg: packageJson,",
  "  schema: appConfigSchema,",
  "});",
  "",
  "export const APP_CONFIG = {",
  "  ...parsed,",
  "  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,",
  "};",
  "",
].join("\n");

const BLANK_CONFIG = [
  'import { prepareCoreServiceConfig } from "@nimara/lib/config/service";',
  "",
  'import packageJson from "../../../package.json";',
  "",
  "export const APP_CONFIG = prepareCoreServiceConfig({",
  "  moduleUrl: import.meta.url,",
  "  pkg: packageJson,",
  "});",
  "",
].join("\n");

/**
 * Neither template service reads a per-tenant Saleor config, so both collapse
 * onto the same blank shape once `appConfigSchema` is gone.
 */
export const removeServiceIntegration = (
  serviceDir: string,
  templateService: string,
) =>
  rewrite({
    path: join(serviceDir, "config.ts"),
    replacements: [
      [
        templateService === TEMPLATE_SERVICE ? HANDLER_CONFIG : SHARED_CONFIG,
        BLANK_CONFIG,
      ],
    ],
  });

/**
 * Only `handler/entry-server.ts` ever mounts the Saleor manifest. Run this
 * after `removeServiceDashboard`, whose cut this one's replacements assume.
 */
export const removeServiceManifest = (serviceDir: string) =>
  rewrite({
    path: join(serviceDir, "entry-server.ts"),
    replacements: [
      [
        [
          'import { container } from "@/services/handler/container";',
          'import logo from "@/services/handler/logo.png?inline";',
          "",
          'import { saleorRoutes } from "./api/rest/saleor";',
          "",
          "const { config, logger } = container.items;",
        ].join("\n"),
        [
          'import { container } from "@/services/handler/container";',
          "",
          "const { config, logger } = container.items;",
        ].join("\n"),
      ],
      [
        [
          "const { config, logger } = container.items;",
          'const LOGO = Buffer.from(logo.split(",")[1] ?? "", "base64");',
          "",
          "initSentry({",
        ].join("\n"),
        [
          "const { config, logger } = container.items;",
          "",
          "initSentry({",
        ].join("\n"),
      ],
      [
        [
          '  .get("/logo.png", (context) =>',
          '    context.body(LOGO, 200, { "content-type": "image/png" }),',
          "  )",
          "  /**",
          "   * Saleor opens `appUrl`, which is the app's root. A dashboard, where the app",
          "   * has one, is mounted above and answers first.",
          "   */",
          '  .get("/", (context) =>',
        ].join("\n"),
        '  .get("/", (context) =>',
      ],
      [
        [
          "  )",
          "  /**",
          "   * Nested routes must be defined at the end for proper type inference for",
          "   * hono/client.",
          "   */",
          '  .route("/api/saleor", saleorRoutes);',
        ].join("\n"),
        "  );",
      ],
    ],
  });
