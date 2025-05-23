"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { authService } from "@/services/auth";

export const requestPasswordResetAction = async ({
  channel,
  email,
}: {
  channel: string;
  email: string;
}) => {
  const response = await authService.requestPasswordReset({
    channel,
    email,
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.newPassword.asPath(),
    ),
  });

  revalidatePath(paths.resetPassword.asPath());

  return response;
};
