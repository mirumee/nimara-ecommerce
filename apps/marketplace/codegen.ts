import type { CodegenConfig } from "@graphql-codegen/cli";

const saleorUrl = process.env.NEXT_PUBLIC_SALEOR_URL;
const isPlaceholder =
  !saleorUrl ||
  saleorUrl.includes("your-saleor-instance.saleor.cloud");

const baseConfig = {
  documentMode: "string" as const,
  enumsAsTypes: true,
  useTypeImports: true,
  strictScalars: true,
  skipTypename: false,
  dedupeFragments: true,
  dedupeOperationSuffix: true,
  omitOperationSuffix: true,
  scalars: {
    DateTime: "string",
    Date: "string",
    Decimal: "string",
    JSON: "Record<string, unknown>",
    JSONString: "string",
    Metadata: "Record<string, string>",
    PositiveDecimal: "string",
    UUID: "string",
    WeightScalar: "number",
    GenericScalar: "unknown",
  },
};

const config: CodegenConfig = {
  overwrite: true,
  schema: isPlaceholder ? "./schema.graphql" : saleorUrl,
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/graphql/": {
      preset: "near-operation-file-preset",
      presetConfig: {
        baseTypesPath: "~@nimara/codegen/schema",
        extension: ".ts",
        fileName: "generated",
      },
      plugins: ["typescript-operations", "typed-document-node"],
      config: baseConfig as CodegenConfig["generates"][string],
    },
  },
};

export default config;
