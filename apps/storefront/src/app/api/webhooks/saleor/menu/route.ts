import { type MenuEventSubscriptionFragment } from "@/graphql/fragments/generated";

import { handleWebhookPostRequest } from "../helpers";

const extractSlugFromPayload = async (json: MenuEventSubscriptionFragment) => {
  switch (json?.__typename) {
    case "MenuCreated":
    case "MenuUpdated":
    case "MenuDeleted":
      return json.menu?.slug;

    case "MenuItemCreated":
    case "MenuItemUpdated":
    case "MenuItemDeleted":
      return json.menuItem?.menu.slug;
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: MenuEventSubscriptionFragment) => extractSlugFromPayload(json),
    "CMS",
  );
}
