import {
  TransactionEventReportMutationDocument,
  type TransactionEventReportMutationVariables,
} from "@/graphql/mutations/generated";
import { AppIdQueryDocument } from "@/graphql/queries/generated";
import { graphqlClient, type GraphqlClientOpts } from "@/lib/graphql/client";

export const saleorClient = ({
  saleorUrl,
  authToken,
  timeout,
  logger,
}: {
  saleorUrl: string;
} & GraphqlClientOpts) => {
  const client = graphqlClient(`${saleorUrl}/graphql/`, {
    authToken,
    timeout,
    logger,
  });

  const execute = client.execute;

  const getAppId = async () => {
    const { app } = await client.execute(AppIdQueryDocument);

    return app?.id ?? null;
  };

  const transactionReport = async ({
    amount,
    ...opts
  }: Omit<TransactionEventReportMutationVariables, "amount"> & {
    /**
     * Saleor expects the Decimal scalar serialized as a string.
     */
    amount: string;
  }) => {
    const { transactionEventReport } = await client.execute(
      TransactionEventReportMutationDocument,
      {
        variables: {
          ...opts,
          amount: amount as unknown as number,
        },
      },
    );

    return transactionEventReport;
  };

  return {
    execute,
    getAppId,
    transactionReport,
  };
};

export type SaleorClient = ReturnType<typeof saleorClient>;

export type SaleorClientOpts = {
  saleorUrl: string;
} & GraphqlClientOpts;
