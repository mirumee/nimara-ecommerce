import { type IGraphQLConfig } from "graphql-config";

import { singleFileConfig } from "./config";

// Paths are relative to the app, so a new one wires itself up.
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
