import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";
import { type Logger } from "@nimara/infrastructure/logging/types";
import { saleorUrlFromDomain } from "@nimara/lib/saleor/url";

import {
  AppIdQueryDocument,
  type GroupCheckoutQuery,
  GroupCheckoutQueryDocument,
  type MetadataInput,
  type TransactionEventReportMutation,
  TransactionEventReportMutationDocument,
  type TransactionEventReportMutationVariables,
  type UserPrivateMetadataUpdateMutation,
  UserPrivateMetadataUpdateMutationDocument,
} from "@/graphql/generated/client";

export const saleorClient =
  ({ logger, timeout }: { logger: Logger; timeout: number }) =>
  ({
    authToken,
    saleorDomain,
  }: {
    authToken?: string;
    saleorDomain: string;
  }) => {
    const client = graphqlClient(
      `${saleorUrlFromDomain(saleorDomain)}/graphql/`,
      authToken,
      { logger, timeout },
    );

    const getAppId = async (): AsyncResult<string | null> => {
      const result = await client.execute(AppIdQueryDocument);

      if (!result.ok) {
        return result;
      }

      return ok(result.data.app?.id ?? null);
    };

    const getGroupCheckout = async (
      id: string,
    ): AsyncResult<GroupCheckoutQuery["checkout"]> => {
      const result = await client.execute(GroupCheckoutQueryDocument, {
        variables: { id },
      });

      if (!result.ok) {
        return result;
      }

      return ok(result.data.checkout);
    };

    const transactionReport = async (
      variables: TransactionEventReportMutationVariables,
    ): AsyncResult<
      TransactionEventReportMutation["transactionEventReport"]
    > => {
      const result = await client.execute(
        TransactionEventReportMutationDocument,
        { variables },
      );

      if (!result.ok) {
        return result;
      }

      return ok(result.data.transactionEventReport);
    };

    const updateUserPrivateMetadata = async (variables: {
      id: string;
      input: MetadataInput[];
    }): AsyncResult<
      UserPrivateMetadataUpdateMutation["updatePrivateMetadata"]
    > => {
      const result = await client.execute(
        UserPrivateMetadataUpdateMutationDocument,
        { variables },
      );

      if (!result.ok) {
        return result;
      }

      return ok(result.data.updatePrivateMetadata);
    };

    return {
      execute: client.execute,
      getAppId,
      getGroupCheckout,
      transactionReport,
      updateUserPrivateMetadata,
    };
  };

export type SaleorClient = ReturnType<ReturnType<typeof saleorClient>>;
