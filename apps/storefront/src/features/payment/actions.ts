"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { getServiceRegistry } from "@/services/registry";

interface InitializeTransactionPayload {
  amount: number;
  id: Checkout["id"];
  paymentMethodId?: string | null;
  saveForFutureUse?: boolean | null;
}

export const initializeTransactionAction = async ({
  amount,
  id,
  paymentMethodId,
  saveForFutureUse,
}: InitializeTransactionPayload) => {
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();

  return paymentService.paymentInitialize({
    amount,
    id,
    paymentMethodId,
    saveForFutureUse,
  });
};
