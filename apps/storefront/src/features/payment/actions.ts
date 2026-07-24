"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult } from "@nimara/domain/objects/Result";
import type { TransactionData } from "@nimara/infrastructure/payment/types";

import { getServiceRegistry } from "@/services/registry";

interface InitializeTransactionPayload {
  amount: number;
  customerId?: string | null;
  id: Checkout["id"];
  paymentMethod?: string | null;
  saveForFutureUse?: boolean | null;
}

export const initializeTransactionAction = async ({
  amount,
  customerId,
  id,
  paymentMethod,
  saveForFutureUse,
}: InitializeTransactionPayload): AsyncResult<TransactionData> => {
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();

  return paymentService.initializeTransaction({
    amount,
    customerId,
    id,
    paymentMethod,
    saveForFutureUse,
  });
};
