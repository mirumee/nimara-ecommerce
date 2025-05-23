"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { paymentService } from "@/services/payment";

export const paymentMethodDeleteAction = async ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) => {
  const result = await paymentService.customerPaymentMethodDelete({
    customerId,
    paymentMethodId,
  });

  if (result.ok) {
    revalidatePath(paths.account.paymentMethods.asPath());
  }

  return result;
};

export const generateSecretAction = async ({
  customerId,
}: {
  customerId: string;
}) =>
  paymentService.paymentMethodSaveInitialize({
    customerId,
  });
