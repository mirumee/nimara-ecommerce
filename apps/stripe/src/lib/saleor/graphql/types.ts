import {
  type GraphqlClient,
  type GraphqlClientOpts,
} from "@/lib/graphql/client";

export type SaleorClientFactoryOpts = {
  saleorUrl: string;
} & GraphqlClientOpts;

export type SaleorClientFactory = (opts: SaleorClientFactoryOpts) => {
  execute: GraphqlClient["execute"];
  getAppId: () => Promise<null | string>;
};

export type SaleorClient = ReturnType<SaleorClientFactory>;
