import type {
  PaymentElementCreateInfra,
  PaymentElementCreateUseCase,
} from "../../payment/types.ts";

export const createPaymentElementUseCase =
  ({
    paymentElementCreate,
  }: {
    paymentElementCreate: PaymentElementCreateInfra;
  }): PaymentElementCreateUseCase =>
  async ({ locale, secret, appearance, options }) => {
    const { mount, unmount } = await paymentElementCreate({
      locale,
      secret,
      appearance,
      options,
    });

    return {
      unmount,
      mount,
    };
  };
