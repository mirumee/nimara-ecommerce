import { type CollectionEventSubscriptionFragment } from "@/graphql/fragments/generated";
import { storefrontLogger } from "@/services/logging";

import { handleWebhookPostRequest } from "../helpers";

const logger = storefrontLogger;

const extractSlugFromPayload = async (
  json: CollectionEventSubscriptionFragment,
) => {
  logger.info("[Collection webhook] Received webhook payload", json);

  switch (json?.__typename) {
    case "CollectionUpdated":
    case "CollectionDeleted":
      return json.collection?.slug;
    default:
      logger.debug(
        `[Collection webhook] Unknown or unhandled webhook typename ${json?.__typename}`,
      );

      return undefined;
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: CollectionEventSubscriptionFragment) => extractSlugFromPayload(json),
    "COLLECTION",
  );
}
