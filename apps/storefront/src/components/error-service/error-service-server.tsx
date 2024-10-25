import * as Sentry from "@sentry/nextjs";

import { getAccessToken } from "@/auth";
import { userService } from "@/services";

import { ErrorServiceClient } from "./error-service-client";

export const ErrorServiceServer = async () => {
  const accessToken = await getAccessToken();
  const user = await userService.userGet(accessToken);

  const contextUser: Sentry.User | null = user
    ? { email: user.email, id: user.id }
    : null;

  Sentry.setUser(contextUser);

  return <ErrorServiceClient user={user} />;
};
