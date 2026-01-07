import { type CodegenConfig } from "@graphql-codegen/cli";
import { type IGraphQLConfig } from "graphql-config";
import { invariant } from "ts-invariant";

export const baseCodegenConfig: CodegenConfig["config"] = {
  documentMode: "string",
  enumsAsTypes: true,
  useTypeImports: true,
  strictScalars: true,
  skipTypename: true,
  dedupeFragments: true,
  dedupeOperationSuffix: true,
  omitOperationSuffix: true,
  mergeFragmentTypes: true,
  exportFragmentSpreadSubTypes: true,
  extractAllFieldsToTypes: true,
  avoidOptionals: {
    field: true,
    inputValue: false,
    object: false,
    defaultValue: false,
  },
  scalars: {
    Date: "string",
    DateTime: "string",
    Day: "number",
    Decimal: "number",
    GenericScalar: "unknown",
    JSON: "unknown",
    JSONString: "string",
    Metadata: "Record<string, string>",
    Hour: "number",
    Minute: "number",
    PositiveDecimal: "number",
    UUID: "string",
    Upload: "unknown",
    WeightScalar: "unknown",
    _Any: "unknown",
  },
};

invariant(
  process.env.NEXT_PUBLIC_SALEOR_API_URL,
  `NEXT_PUBLIC_SALEOR_API_URL not set!`,
);

const config: IGraphQLConfig = {
  projects: {
    saleor: {
      schema: process.env.NEXT_PUBLIC_SALEOR_API_URL,
      documents: ["../../**/*.graphql"],
      extensions: {
        codegen: {
          overwrite: true,
          generates: {
            "./schema.ts": {
              plugins: ["typescript"],
              config: baseCodegenConfig,
            },
            "./graphql/": {
              config: baseCodegenConfig,
              plugins: ["typescript-operations", "typed-document-node"],
              preset: "near-operation-file-preset",
              presetConfig: {
                baseTypesPath: "~@nimara/codegen/schema",
                fileName: "generated",
                extension: ".ts",
              },
            },
          },
        },
      },
    },
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
