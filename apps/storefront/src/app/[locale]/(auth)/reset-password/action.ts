"use server";

import { revalidateLocalizedPath } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/foundation/server";
import { getAuthService } from "@/services/auth";

export const requestPasswordResetAction = async ({
  channel,
  email,
}: {
  channel: string;
  email: string;
}) => {
  const authService = await getAuthService();
  const response = await authService.requestPasswordReset({
    channel,
    email,
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.newPassword.asPath(),
    ),
  });

  await revalidateLocalizedPath(paths.resetPassword.asPath());

  return response;
};
