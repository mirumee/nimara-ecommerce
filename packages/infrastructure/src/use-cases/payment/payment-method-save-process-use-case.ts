import { err, ok } from "@nimara/domain/objects/Result";

import type {
  PaymentMethodSaveProcessInfra,
  PaymentMethodSaveProcessUseCase,
  PaymentMethodSetDefaultInfra,
} from "../../payment/types.ts";

export const paymentMethodSaveProcessUseCase =
  ({
    paymentMethodSaveProcess,
    paymentMethodSetDefault,
  }: {
    paymentMethodSaveProcess: PaymentMethodSaveProcessInfra;
    paymentMethodSetDefault: PaymentMethodSetDefaultInfra;
  }): PaymentMethodSaveProcessUseCase =>
  async (opts) => {
    if (opts.searchParams?.redirect_status === "failed") {
      return err([
        {
          code: "PAYMENT_METHOD_SAVE_ERROR",
        },
      ]);
    }

    const resultPaymentMethodSave = await paymentMethodSaveProcess(opts);

    if (resultPaymentMethodSave.ok) {
      await paymentMethodSetDefault(resultPaymentMethodSave.data);
    }

    return ok({ success: true });
  };
