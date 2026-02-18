import * as Sentry from "@sentry/nextjs";

import { type ServiceRegistry } from "@nimara/infrastructure/types";

import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { ErrorServiceClient } from "./error-service-client";

export interface ErrorServiceServerProps {
  services: ServiceRegistry;
}

export const ErrorServiceServer = async () => {
  const [accessToken, services] = await Promise.all([
    getAccessToken(),
    getServiceRegistry(),
  ]);

  const userService = await services.getUserService();
  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const contextUser: Sentry.User | null = user
    ? { email: user.email, id: user.id }
    : null;

  Sentry.setUser(contextUser);

  return <ErrorServiceClient user={user} />;
};
