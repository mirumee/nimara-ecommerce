import { ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";
import { type Logger } from "@nimara/infrastructure/logging/types";

/**
 * Dev-only via `import.meta.env.DEV`: lets local dev use a long-lived app token
 * instead of a staff JWT. Only `verifyJwt`; webhook signatures still verify.
 */
export const passThroughJwtVerification = ({
  logger,
  service,
}: {
  logger: Logger;
  service: JoseAuthService;
}): JoseAuthService => ({
  ...service,
  verifyJwt: async () => {
    logger.warning(
      "Dev server: accepting a dashboard token without verifying its signature.",
    );

    return ok(true);
  },
});
