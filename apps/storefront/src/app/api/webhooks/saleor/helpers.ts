import type {
  CollectionEventSubscriptionFragment,
  MenuEventSubscriptionFragment,
  PageEventSubscriptionFragment,
  ProductEventSubscriptionFragment,
  PromotionEventSubscriptionFragment,
} from "@/graphql/fragments/generated";
import { revalidateTag } from "@/lib/cache";
import { verifySaleorWebhookSignature } from "@/lib/webhooks";
import { storefrontLogger } from "@/services/logging";

type EventSubscriptionFragment =
  | MenuEventSubscriptionFragment
  | ProductEventSubscriptionFragment
  | PageEventSubscriptionFragment
  | CollectionEventSubscriptionFragment
  | PromotionEventSubscriptionFragment;

/**
 * Handles Saleor webhook POST requests to revalidate tags, supporting
 * both slug-based and direct tag revalidation.
 *
 * @param request The incoming Request object.
 * @param extractValueFromPayload A function that extracts a string (either a slug or a tag) from the webhook payload.
 * @param prefix An optional prefix. If provided, the extracted value is treated as a slug
 * and a tag is formed as `${prefix}:${slug}`. If omitted, the extracted value is used directly as the tag.
 */
export const handleWebhookPostRequest = async (
  request: Request,
  extractValueFromPayload: (json: any) => Promise<string | undefined>,
  prefix?: "CMS" | "PRODUCT" | "COLLECTION",
): Promise<Response> => {
  await verifySaleorWebhookSignature(request);

  const json = (await request.json()) as EventSubscriptionFragment;
  const extractedValue = (await extractValueFromPayload(json)) as RevalidateTag;

  let fullTag: RevalidateTag;

  if (extractedValue) {
    if (prefix) {
      fullTag = `${prefix}:${extractedValue}`;
    } else {
      fullTag = extractedValue;
    }

    revalidateTag(fullTag);
    storefrontLogger.debug(
      `Revalidated '${fullTag}' via '${json.__typename}' saleor webhook.`,
      { tag: extractedValue, name: json.__typename },
    );
  }

  return Response.json({ status: "revalidated" });
};
