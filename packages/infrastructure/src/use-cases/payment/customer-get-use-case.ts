import { err, ok } from "@nimara/domain/objects/Result";

import { type Logger } from "#root/logging/types";

import type {
  CustomerFromGatewayGetInfra,
  CustomerFromSaleorGetInfra,
  CustomerGetUseCase,
  CustomerInGatewayCreateInfra,
  CustomerInSaleorSaveInfra,
} from "../../payment/types.ts";

export const customerGetUseCase =
  ({
    logger,
    customerFromSaleorGetInfra,
    customerFromGatewayGetInfra,
    customerInGatewayCreateInfra,
    customerInSaleorSave,
  }: {
    customerFromGatewayGetInfra: CustomerFromGatewayGetInfra;
    customerFromSaleorGetInfra: CustomerFromSaleorGetInfra;
    customerInGatewayCreateInfra: CustomerInGatewayCreateInfra;
    customerInSaleorSave: CustomerInSaleorSaveInfra;
    logger: Logger;
  }): CustomerGetUseCase =>
  async ({ channel, user, environment, accessToken }) => {
    const resultCustomerFromSaleorGetInfra = customerFromSaleorGetInfra({
      channel,
      user,
    });

    if (
      resultCustomerFromSaleorGetInfra.ok &&
      resultCustomerFromSaleorGetInfra.data
    ) {
      logger.debug("Customer found in Saleor", {
        customerId: resultCustomerFromSaleorGetInfra.data,
        channel,
        environment,
      });

      return ok({ customerId: resultCustomerFromSaleorGetInfra.data });
    }

    let gatewayCustomerId: string | null = null;

    const resultCustomerFromGatewayGetInfra = await customerFromGatewayGetInfra(
      {
        environment,
        user,
      },
    );

    if (resultCustomerFromGatewayGetInfra.ok) {
      logger.debug("Customer found in gateway", {
        customerId: resultCustomerFromGatewayGetInfra.data.id,
        channel,
        environment,
      });

      gatewayCustomerId = resultCustomerFromGatewayGetInfra.data.id;
    }

    const resultCustomerInGatewayCreateInfra =
      await customerInGatewayCreateInfra({
        user,
        environment,
      });

    if (resultCustomerInGatewayCreateInfra.ok) {
      logger.debug("A new customer was created in gateway", {
        customerId: resultCustomerInGatewayCreateInfra.data.id,
        channel,
        environment,
      });

      gatewayCustomerId = resultCustomerInGatewayCreateInfra.data.id;
    }

    if (!gatewayCustomerId) {
      return err([
        {
          code: "CHECKOUT_GATEWAY_CUSTOMER_GET_ERROR",
          message: "Could not create gateway customer.",
        },
      ]);
    }

    await customerInSaleorSave({
      saleorCustomerId: user.id,
      gatewayCustomerId: gatewayCustomerId,
      channel,
      accessToken,
    });

    return ok({ customerId: gatewayCustomerId });
  };
