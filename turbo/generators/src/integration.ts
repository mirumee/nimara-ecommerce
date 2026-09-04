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
