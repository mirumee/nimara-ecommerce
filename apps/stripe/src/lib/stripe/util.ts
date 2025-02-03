import { CONFIG } from "@/config";

import { StripeMetaKey } from "./const";

export const getGatewayMetadata = () => ({
  [StripeMetaKey.ENVIRONMENT]: CONFIG.ENVIRONMENT,
  [StripeMetaKey.ISSUER]: CONFIG.APP_ID,
});
