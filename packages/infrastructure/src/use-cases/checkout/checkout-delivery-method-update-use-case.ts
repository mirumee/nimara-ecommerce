import type { Checkout } from "@nimara/domain/objects/Checkout";

import type {
  CheckoutDeliveryMethodUpdateInfra,
  CheckoutDeliveryMethodUpdateUseCase,
} from "#root/checkout/types";

export const deliveryMethodUpdateUseCase = ({
  deliveryMethodUpdateInfra,
}: {
  deliveryMethodUpdateInfra: CheckoutDeliveryMethodUpdateInfra;
}): CheckoutDeliveryMethodUpdateUseCase => {
  return async ({
    checkoutId,
    deliveryMethodId,
  }: {
    checkoutId: Checkout["id"];
    deliveryMethodId: string;
  }) => {
    return deliveryMethodUpdateInfra({
      checkoutId,
      deliveryMethodId,
    });
  };
};
