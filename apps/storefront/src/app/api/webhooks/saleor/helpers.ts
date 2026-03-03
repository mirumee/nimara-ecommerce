import { revalidateTag } from "@/foundation/cache/cache";
import { verifySaleorWebhookSignature } from "@/foundation/webhooks";
import type {
  CollectionEventSubscriptionFragment,
  MenuEventSubscriptionFragment,
  PageEventSubscriptionFragment,
  ProductEventSubscriptionFragment,
} from "@/infrastructure/webhook/saleor/graphql/fragments/generated";
import { storefrontLogger } from "@/services/logging";

type EventSubscriptionFragment =
  | MenuEventSubscriptionFragment
  | ProductEventSubscriptionFragment
  | PageEventSubscriptionFragment
  | CollectionEventSubscriptionFragment;

export const handleWebhookPostRequest = async <
  T extends EventSubscriptionFragment,
>(
  request: Request,
  extractSlugFromPayload: (json: T) => Promise<string | undefined>,
  prefix: "CMS" | "PRODUCT" | "COLLECTION",
) => {
  await verifySaleorWebhookSignature(request);

  const json = (await request.json()) as T;
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
