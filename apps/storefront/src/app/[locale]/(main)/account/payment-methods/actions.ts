"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

export const paymentMethodDeleteAction = async ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) => {
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();
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
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();

  return paymentService.paymentMethodSaveInitialize({
    customerId,
  });
};
