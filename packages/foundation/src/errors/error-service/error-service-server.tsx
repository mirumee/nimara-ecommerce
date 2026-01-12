import * as Sentry from "@sentry/nextjs";

import { type ServiceRegistry } from "@nimara/infrastructure/types";

import { ErrorServiceClient } from "./error-service-client";

export interface ErrorServiceServerProps {
  services: ServiceRegistry;
}

export const ErrorServiceServer = async ({
  services,
}: ErrorServiceServerProps) => {
  const accessToken = services.accessToken;
  const userService = services.user;

  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const contextUser: Sentry.User | null = user
    ? { email: user.email, id: user.id }
    : null;

  Sentry.setUser(contextUser);

  return <ErrorServiceClient user={user} />;
};
