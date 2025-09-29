import { type PromotionEventSubscriptionFragment } from "@/graphql/fragments/generated";

import { handleWebhookPostRequest } from "../helpers";

interface CataloguePredicate {
  collectionPredicate?: { ids?: string[] };
  productPredicate?: { ids?: string[] };
  variantPredicate?: { ids?: string[] };
}
const extractGroupTagFromPromotionEvent = async (
  json: PromotionEventSubscriptionFragment,
) => {
  switch (json.__typename) {
    case "PromotionUpdated":
    case "PromotionCreated":
    case "PromotionDeleted":
    case "PromotionStarted":
    case "PromotionEnded": {
      const rules = json.promotion?.rules || [];

      for (const rule of rules) {
        const predicate = rule.cataloguePredicate as CataloguePredicate;

        if (predicate?.collectionPredicate?.ids?.length) {
          return "COLLECTION";
        }
        if (
          predicate?.productPredicate?.ids?.length ||
          predicate?.variantPredicate?.ids?.length
        ) {
          return "PRODUCT";
        }
      }
      break;
    }
    case "PromotionRuleCreated":
    case "PromotionRuleUpdated":
    case "PromotionRuleDeleted": {
      const predicate = (json.promotionRule?.cataloguePredicate ||
        {}) as CataloguePredicate;

      if (!predicate) {
        return undefined;
      }
      if (predicate.collectionPredicate?.ids?.length) {
        return "COLLECTION";
      }
      if (
        predicate.productPredicate?.ids?.length ||
        predicate?.variantPredicate?.ids?.length
      ) {
        return "PRODUCT";
      }
      break;
    }
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: PromotionEventSubscriptionFragment) =>
      extractGroupTagFromPromotionEvent(json),
  );
}
