import { revalidateTag } from "@/foundation/cache/cache";
import { verifySaleorWebhookSignature } from "@/foundation/webhooks";
import { storefrontLogger } from "@/services/logging";
import type {
  CollectionEventSubscriptionFragment,
  MenuEventSubscriptionFragment,
  PageEventSubscriptionFragment,
  ProductEventSubscriptionFragment,
} from "@/infrastructure/webhook/saleor/graphql/fragments/generated";

type EventSubscriptionFragment =
  | MenuEventSubscriptionFragment
  | ProductEventSubscriptionFragment
  | PageEventSubscriptionFragment
  | CollectionEventSubscriptionFragment;

export const handleWebhookPostRequest = async (
  request: Request,
  extractSlugFromPayload: (json: EventSubscriptionFragment) => Promise<string | undefined>,
  prefix: "CMS" | "PRODUCT" | "COLLECTION",
) => {
  await verifySaleorWebhookSignature(request);

  const json = (await request.json()) as EventSubscriptionFragment;
  const slug = await extractSlugFromPayload(json);

  if (slug) {
    const tag = `${prefix}:${slug}` as RevalidateTag;

    revalidateTag(tag);
    storefrontLogger.debug(
      `Revalidated '${tag}' via '${json.__typename}' saleor webhook.`,
      { slug, name: json.__typename },
    );
  }

  return Response.json({ status: "revalidated" });
};
