import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorTenant } from "@nimara/lib/saleor/tenant";

import { container } from "@/container";
import { type ProductUpdatedSubscription } from "@/graphql/generated/client";

// Example. Scope every read and write by the tenant, never by the payload.
export const productUpdatedHandler = async (
  context: HandlerContext<ProductUpdatedSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");
  const settings = await container
    .get("appConfigService")
    .getSettings({ saleorDomain });

  if (!settings.ok) {
    return context.json({ status: "error" }, 500);
  }

  // A tenant that installed the app but never configured it has nothing to
  // work with; say so rather than failing further in.
  if (!settings.data) {
    context.get("logger").warning("No settings for this Saleor yet.", {
      saleorDomain,
    });

    return context.json({ status: "ok" });
  }

  context.get("logger").info(`Product ${event.product?.name} updated.`, {
    productId: event.product?.id,
    saleorDomain,
  });

  return context.json({ status: "ok" });
};
