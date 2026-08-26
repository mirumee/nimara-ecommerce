import { type CodegenConfig } from "@graphql-codegen/cli";
import { type IGraphQLConfig } from "graphql-config";

import { baseCodegenConfig, singleFileConfig } from "./config";

// Skip codegen instead of crashing when Saleor is not configured (zero-config).
if (!process.env.NEXT_PUBLIC_SALEOR_API_URL) {
  console.log("Skipping Saleor codegen: NEXT_PUBLIC_SALEOR_API_URL is not set");
  process.exit(0);
}

const nearOperationFileConfig = {
  config: baseCodegenConfig,
  plugins: ["typescript-operations", "typed-document-node"],
  preset: "near-operation-file-preset",
  presetConfig: {
    baseTypesPath: "~@nimara/codegen/schema",
    fileName: "generated",
    extension: ".ts",
  },
} as const;

const APP_PROJECT_GENERATES: Record<string, CodegenConfig["generates"]> = {
  marketplace: {
    "../../apps/marketplace/src/graphql/generated/client.ts": singleFileConfig,
  },
  stripe: {
    "../../apps/stripe/src/graphql/generated/client.ts": singleFileConfig,
  },
};

const createAppProject = (appName: string) => ({
  schema: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  documents: [`../../apps/${appName}/src/**/*.graphql`],
  extensions: {
    codegen: {
      overwrite: true,
      generates: APP_PROJECT_GENERATES[appName],
    },
  },
});

// Apps with separate GraphQL codegen (to avoid fragment name conflicts)
const SEPARATE_APPS = ["marketplace", "stripe"];

const config: IGraphQLConfig = {
  projects: {
    saleor: {
      schema: process.env.NEXT_PUBLIC_SALEOR_API_URL,
      documents: [
        "../../**/*.graphql",
        // Apps that keep their own client wire codegen up themselves; see
        // `@nimara/codegen/preset`.
        "!../../templates/**/*.graphql",
        ...SEPARATE_APPS.map((app) => `!../../apps/${app}/**/*.graphql`),
      ],
      extensions: {
        codegen: {
          overwrite: true,
          generates: {
            "./schema.ts": {
              plugins: ["typescript"],
              config: baseCodegenConfig,
            },
            "./graphql/": nearOperationFileConfig,
          },
        },
      },
    },
    ...Object.fromEntries(
      SEPARATE_APPS.map((app) => [app, createAppProject(app)]),
    ),
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
