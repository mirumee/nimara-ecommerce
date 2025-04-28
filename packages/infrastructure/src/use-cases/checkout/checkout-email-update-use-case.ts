import { ok } from "@nimara/domain/objects/Result";

import type {
  CheckoutEmailUpdateInfra,
  CheckoutEmailUpdateUseCase,
} from "#root/checkout/types";

export const checkoutEmailUpdateUseCase =
  ({
    checkoutEmailUpdateInfra,
  }: {
    checkoutEmailUpdateInfra: CheckoutEmailUpdateInfra;
  }): CheckoutEmailUpdateUseCase =>
  async ({ checkout, email }) => {
    if (checkout.email === email) {
      return ok({
        success: true,
      });
    }

    return checkoutEmailUpdateInfra({
      checkout,
      email,
    });
  };
