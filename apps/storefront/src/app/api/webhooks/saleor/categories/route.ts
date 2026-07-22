import { type CategoryEventSubscriptionFragment } from "@/infrastructure/webhook/saleor/graphql/fragments/generated";
import { storefrontLogger } from "@/services/logging";

import { handleWebhookPostRequest } from "../helpers";

const logger = storefrontLogger;

const extractSlugFromPayload = async (
  json: CategoryEventSubscriptionFragment,
) => {
  logger.info("[Category webhook] Received webhook payload", json);

  switch (json?.__typename) {
    case "CategoryCreated":
    case "CategoryUpdated":
    case "CategoryDeleted":
      return json.category?.slug;
    default:
      logger.debug(
        `[Category webhook] Unknown or unhandled webhook typename ${json?.__typename}`,
      );

      return undefined;
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: CategoryEventSubscriptionFragment) => extractSlugFromPayload(json),
    "CATEGORY",
  );
}
