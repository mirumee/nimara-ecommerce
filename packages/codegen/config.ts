import { type CodegenConfig } from "@graphql-codegen/cli";

/**
 * Shared codegen settings. Kept apart from `codegen.ts`, which exits the
 * process when Saleor is unconfigured — importing that from an app's own
 * config would take the app down with it.
 */
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
    PositiveInt: "number",
    PositiveDecimal: "number",
    UUID: "string",
    Upload: "unknown",
    WeightScalar: "unknown",
    _Any: "unknown",
  },
};

// One file per app, so fragments of one app cannot collide with another's.
export const singleFileConfig = {
  config: baseCodegenConfig,
  plugins: [
    { add: { content: "/* eslint-disable */\n" } },
    "typescript",
    "typescript-operations",
    "typed-document-node",
  ],
};
