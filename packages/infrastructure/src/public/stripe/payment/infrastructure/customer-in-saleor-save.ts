import { graphqlClient } from "#root/graphql/client";
import { MetadataUpdateMutationDocument } from "#root/graphql/mutations/generated";

import { getGatewayCustomerMetaKey } from "../helpers";
import type { CustomerInSaleorSaveInfra, PaymentServiceConfig } from "../types";

export const customerInSaleorSave =
  ({ apiURI, logger }: PaymentServiceConfig): CustomerInSaleorSaveInfra =>
  async ({ gatewayCustomerId, channel, saleorCustomerId, accessToken }) => {
    const { data, error } = await graphqlClient(apiURI, accessToken).execute(
      MetadataUpdateMutationDocument,
      {
        variables: {
          id: saleorCustomerId,
          input: [
            {
              key: getGatewayCustomerMetaKey({ gateway: "stripe", channel }),
              value: gatewayCustomerId,
            },
          ],
        },
      },
    );

    // TODO: Handle errors
    const errors = error ? [error] : (data?.updateMetadata?.errors ?? []);

    if (errors.length) {
      logger.error("Customer save in Saleor failed", {
        metadataSaveErrors: JSON.stringify(errors),
      });
    }
  };
