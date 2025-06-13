import type {
  CollectionEventSubscriptionFragment,
  MenuEventSubscriptionFragment,
  PageEventSubscriptionFragment,
  ProductEventSubscriptionFragment,
} from "@/graphql/fragments/generated";
import { revalidateTag } from "@/lib/cache";
import { verifySaleorWebhookSignature } from "@/lib/webhooks";
import { storefrontLogger } from "@/services/logging";

type EventSubscriptionFragment =
  | MenuEventSubscriptionFragment
  | ProductEventSubscriptionFragment
  | PageEventSubscriptionFragment
  | CollectionEventSubscriptionFragment;

export const handleWebhookPostRequest = async (
  request: Request,
  extractSlugFromPayload: (json: any) => Promise<string | undefined>,
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
