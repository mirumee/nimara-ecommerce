import { type PageEventSubscriptionFragment } from "@/graphql/fragments/generated";

import { handleWebhookPostRequest } from "../helpers";

const extractSlugFromPayload = async (json: PageEventSubscriptionFragment) => {
  switch (json?.__typename) {
    case "PageCreated":
    case "PageDeleted":
    case "PageUpdated":
      return json.page?.slug;

    case "PageTypeCreated":
    case "PageTypeDeleted":
    case "PageTypeUpdated":
      return json.pageType?.slug;
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: PageEventSubscriptionFragment) => extractSlugFromPayload(json),
    "CMS",
  );
}
