import type { Checkout } from "@nimara/domain/objects/Checkout";

import type {
  CheckoutDeliveryMethodUpdateInfra,
  CheckoutDeliveryMethodUpdateUseCase,
} from "#root/public/saleor/checkout/types";

export const deliveryMethodUpdateUseCase = ({
  deliveryMethodUpdateInfra,
}: {
  deliveryMethodUpdateInfra: CheckoutDeliveryMethodUpdateInfra;
}): CheckoutDeliveryMethodUpdateUseCase => {
  return async ({
    checkout,
    deliveryMethodId,
  }: {
    checkout: Checkout;
    deliveryMethodId: string;
  }) => {
    if (checkout.deliveryMethod?.id === deliveryMethodId) {
      return {
        isSuccess: true,
      };
    }

    const { isSuccess, validationErrors, serverError } =
      await deliveryMethodUpdateInfra({
        checkout,
        deliveryMethodId,
      });

    return {
      isSuccess,
      validationErrors,
      serverError,
    };
  };
};
