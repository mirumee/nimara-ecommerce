import { ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";
import { type Logger } from "@nimara/infrastructure/logging/types";

/**
 * Dev-only: lets local dev use a long-lived app token instead of a staff JWT.
 * Only `verifyJwt` — webhook signatures still verify. The token is opaque, so
 * `permissions` is what dev pretends it was granted.
 */
export const passThroughJwtVerification = ({
  logger,
  permissions,
  service,
}: {
  logger: Logger;
  permissions: string[];
  service: JoseAuthService;
}): JoseAuthService => ({
  ...service,
  verifyJwt: async () => {
    logger.warning(
      "Dev server: accepting a dashboard token without verifying its signature.",
      { permissions },
    );

    return ok({ permissions });
  },
});
