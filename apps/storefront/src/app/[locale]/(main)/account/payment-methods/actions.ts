"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { paymentService } from "@/services";

export const paymentMethodDeleteAction = async ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) => {
  const { isSuccess } = await paymentService.customerPaymentMethodDelete({
    customerId,
    paymentMethodId,
  });

  if (isSuccess) {
    revalidatePath(paths.account.paymentMethods.asPath());
  }

  return { isSuccess };
};

export const generateSecretAction = async ({
  customerId,
}: {
  customerId: string;
}) => {
  const { secret } = await paymentService.paymentMethodSaveInitialize({
    customerId,
  });

  return secret;
};
