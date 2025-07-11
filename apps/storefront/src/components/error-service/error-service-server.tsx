import * as Sentry from "@sentry/nextjs";

import { getAccessToken } from "@/auth";
import { lazyLoadService } from "@/services/import";

import { ErrorServiceClient } from "./error-service-client";

export const ErrorServiceServer = async () => {
  const [accessToken, userService] = await Promise.all([
    getAccessToken(),
    lazyLoadService("USER"),
  ]);
  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const contextUser: Sentry.User | null = user
    ? { email: user.email, id: user.id }
    : null;

  Sentry.setUser(contextUser);

  return <ErrorServiceClient user={user} />;
};
