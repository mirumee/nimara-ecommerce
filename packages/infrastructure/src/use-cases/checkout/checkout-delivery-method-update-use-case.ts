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
  return async (data: { deliveryMethodId: string; id: Checkout["id"] }) => {
    return deliveryMethodUpdateInfra(data);
  };
};
