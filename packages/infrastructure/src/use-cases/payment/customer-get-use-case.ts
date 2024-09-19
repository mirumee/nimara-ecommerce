import type {
  CustomerFromGatewayGetInfra,
  CustomerFromSaleorGetInfra,
  CustomerGetUseCase,
  CustomerInGatewayCreateInfra,
  CustomerInSaleorSaveInfra,
} from "#root/public/stripe/payment/types";

export const customerGetUseCase =
  ({
    customerFromSaleorGetInfra,
    customerFromGatewayGetInfra,
    customerInGatewayCreateInfra,
    customerInSaleorSave,
  }: {
    customerFromGatewayGetInfra: CustomerFromGatewayGetInfra;
    customerFromSaleorGetInfra: CustomerFromSaleorGetInfra;
    customerInGatewayCreateInfra: CustomerInGatewayCreateInfra;
    customerInSaleorSave: CustomerInSaleorSaveInfra;
  }): CustomerGetUseCase =>
  async ({ channel, user, environment, accessToken }) => {
    {
      const gatewayCustomer = customerFromSaleorGetInfra({ channel, user });

      if (gatewayCustomer) {
        return gatewayCustomer;
      }
    }

    let gatewayCustomer = await customerFromGatewayGetInfra({
      environment,
      user,
    });

    if (!gatewayCustomer) {
      gatewayCustomer = await customerInGatewayCreateInfra({
        user,
        environment,
      });
    }

    await customerInSaleorSave({
      saleorCustomerId: user.id,
      gatewayCustomerId: gatewayCustomer.id,
      channel,
      accessToken,
    });

    return gatewayCustomer.id;
  };
