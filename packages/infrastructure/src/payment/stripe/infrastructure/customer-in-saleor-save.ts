import { err, ok } from "@nimara/domain/objects/Result";

import { handleMutationErrors } from "#root/error";
import { graphqlClient } from "#root/graphql/client";
import { MetadataUpdateMutationDocument } from "#root/graphql/mutations/generated";

import { getGatewayCustomerMetaKey } from "../../helpers";
import type {
  CustomerInSaleorSaveInfra,
  PaymentServiceConfig,
} from "../../types";

export const customerInSaleorSave =
  ({ apiURI, logger }: PaymentServiceConfig): CustomerInSaleorSaveInfra =>
  async ({ gatewayCustomerId, channel, saleorCustomerId, accessToken }) => {
    const metadataKey = getGatewayCustomerMetaKey({
      gateway: "stripe",
      channel,
    });

    const result = await graphqlClient(apiURI, accessToken).execute(
      MetadataUpdateMutationDocument,
      {
        variables: {
          id: saleorCustomerId,
          input: [
            {
              key: metadataKey,
              value: gatewayCustomerId,
            },
          ],
        },
        operationName: "MetadataUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update customer metadata in Saleor", {
        key: metadataKey,
        errors: result.errors,
        saleorCustomerId,
        channel,
        gatewayCustomerId,
      });

      return result;
    }

    if (result.data.updateMetadata?.errors.length) {
      logger.error("Update customer metadata mutation returned errors", {
        errors: result.data.updateMetadata.errors,
        saleorCustomerId,
        channel,
        gatewayCustomerId,
      });

      return err(handleMutationErrors(result.data.updateMetadata.errors));
    }

    return ok({ success: true });
  };
