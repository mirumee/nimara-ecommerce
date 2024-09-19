import type {
  PaymentMethodSaveProcessInfra,
  PaymentMethodSaveProcessUseCase,
  PaymentMethodSetDefaultInfra,
} from "#root/public/stripe/payment/types";

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
      return { isSuccess: false };
    }

    const data = await paymentMethodSaveProcess(opts);

    if (data) {
      await paymentMethodSetDefault(data);
    }

    return { isSuccess: true };
  };
