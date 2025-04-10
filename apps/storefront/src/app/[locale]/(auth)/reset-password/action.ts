"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { authService } from "@/services";

export const requestPasswordResetAction = async ({
  channel,
  email,
}: {
  channel: string;
  email: string;
}) => {
  const storeUrl = await getStoreUrl();
  const response = await authService.requestPasswordReset({
    channel,
    email,
    redirectUrl: new URL(
      paths.confirmAccountRegistration.asPath(),
      storeUrl,
    ).toString(),
  });

  revalidatePath(paths.resetPassword.asPath());

  return response;
};
