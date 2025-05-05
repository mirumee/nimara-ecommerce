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
  async ({ locale, secret }) => {
    const { mount, unmount } = await paymentElementCreate({ locale, secret });

    return {
      unmount,
      mount,
    };
  };
