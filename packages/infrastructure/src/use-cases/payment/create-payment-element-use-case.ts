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
  async ({ locale, secret, appearance }) => {
    const { mount, unmount } = await paymentElementCreate({
      locale,
      secret,
      appearance,
    });

    return {
      unmount,
      mount,
    };
  };
