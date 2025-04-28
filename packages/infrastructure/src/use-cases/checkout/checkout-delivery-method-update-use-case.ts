import type { Checkout } from "@nimara/domain/objects/Checkout";
import { ok } from "@nimara/domain/objects/Result";

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
    checkout,
    deliveryMethodId,
  }: {
    checkout: Checkout;
    deliveryMethodId: string;
  }) => {
    if (checkout.deliveryMethod?.id === deliveryMethodId) {
      return ok({ success: true });
    }

    return deliveryMethodUpdateInfra({
      checkout,
      deliveryMethodId,
    });
  };
};
