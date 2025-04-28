import { ok } from "@nimara/domain/objects/Result";

import type {
  CustomerPaymentMethodDeleteUseCase,
  CustomerPaymentMethodValidate,
  PaymentMethodDetachInfra,
} from "../../payment/types.ts";

export const customerPaymentMethodDeleteUseCase =
  ({
    paymentMethodDetach,
    customerPaymentMethodValidate,
  }: {
    customerPaymentMethodValidate: CustomerPaymentMethodValidate;
    paymentMethodDetach: PaymentMethodDetachInfra;
  }): CustomerPaymentMethodDeleteUseCase =>
  async ({ customerId, paymentMethodId }) => {
    const result = await customerPaymentMethodValidate({
      customerId,
      paymentMethodId,
    });

    if (!result.ok) {
      return result;
    }

    await paymentMethodDetach({ paymentMethodId });

    return ok({ success: true });
  };
