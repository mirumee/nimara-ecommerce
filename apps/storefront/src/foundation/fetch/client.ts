import { invariant } from "ts-invariant";

import { graphqlClient } from "@nimara/infrastructure/graphql/client";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

export const saleorClient = () =>
  graphqlClient(clientEnvs.NEXT_PUBLIC_SALEOR_API_URL);

export const secureSaleorClient = () => {
  const client = saleorClient();

  invariant(
    serverEnvs.SALEOR_APP_TOKEN,
    "Please set SALEOR_APP_TOKEN in order to ue secureSaleorClient.",
  );

  const execute: (typeof client)["execute"] = (query, opts) =>
    client.execute(query, {
      ...opts,
      ...{
        options: {
          ...opts?.options,
          headers: { authorization: `Bearer ${serverEnvs.SALEOR_APP_TOKEN}` },
        },
      },
    });

  return { execute };
};
