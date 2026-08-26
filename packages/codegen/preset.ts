import { type IGraphQLConfig } from "graphql-config";

import { singleFileConfig } from "./config";

/**
 * Codegen for a Saleor app that keeps its own generated client. Paths are
 * relative to the app, so a new app wires itself up instead of being added to
 * a list here.
 */
export const appCodegenConfig = ({
  documents = ["./src/**/*.graphql"],
  output = "./src/graphql/generated/client.ts",
}: {
  documents?: string[];
  output?: string;
} = {}): IGraphQLConfig => ({
  projects: {
    default: {
      documents,
      schema: process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "",
      extensions: {
        codegen: {
          overwrite: true,
          generates: { [output]: singleFileConfig },
        },
      },
    },
  },
});
