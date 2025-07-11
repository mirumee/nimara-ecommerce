"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { lazyLoadService } from "@/services/import";

export const paymentMethodDeleteAction = async ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) => {
  const paymentService = await lazyLoadService("PAYMENT");
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
}) => {
  const paymentService = await lazyLoadService("PAYMENT");

  return paymentService.paymentMethodSaveInitialize({
    customerId,
  });
};
