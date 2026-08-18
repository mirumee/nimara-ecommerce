import {
  AppIdQueryDocument,
  type MetadataInput,
  TransactionEventReportMutationDocument,
  type TransactionEventReportMutationVariables,
  UserPrivateMetadataUpdateMutationDocument,
} from "@/graphql/generated/client";
import { graphqlClient, type GraphqlClientOpts } from "@/lib/graphql/client";
import { saleorUrlFromDomain } from "@/lib/saleor/url";

export const saleorClient =
  ({ logger, timeout }: Pick<GraphqlClientOpts, "logger" | "timeout">) =>
  ({
    authToken,
    saleorDomain,
  }: {
    authToken?: string;
    saleorDomain: string;
  }) => {
    const client = graphqlClient(
      `${saleorUrlFromDomain(saleorDomain)}/graphql/`,
      {
        authToken,
        timeout,
        logger,
      },
    );

    const execute = client.execute;

    const getAppId = async () => {
      const { app } = await client.execute(AppIdQueryDocument);

      return app?.id ?? null;
    };

    const transactionReport = async (
      opts: TransactionEventReportMutationVariables,
    ) => {
      const { transactionEventReport } = await client.execute(
        TransactionEventReportMutationDocument,
        { variables: opts },
      );

      return transactionEventReport;
    };

    const updateUserPrivateMetadata = async (opts: {
      id: string;
      input: MetadataInput[];
    }) => {
      const { updatePrivateMetadata } = await client.execute(
        UserPrivateMetadataUpdateMutationDocument,
        { variables: opts },
      );

      return updatePrivateMetadata;
    };

    return {
      execute,
      getAppId,
      transactionReport,
      updateUserPrivateMetadata,
    };
  };

export type SaleorClient = ReturnType<ReturnType<typeof saleorClient>>;
