import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService, productsService } from "@/services";

import { NewVariantClient } from "./_components/new-variant-client";

export default async function NewVariantPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const t = await getTranslations();
  const { productId: rawProductId } = await params;
  const productId = decodeURIComponent(rawProductId);
  const token = await getServerAuthToken();

  const [productResult, channelsResult, warehousesResult] = await Promise.all([
    productsService.getProduct({ id: productId }, token),
    configurationService.getChannels(token),
    configurationService.getWarehouses(token),
  ]);

  const product = productResult.ok ? productResult.data.product : null;

  if (!product) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {!productResult.ok || !product
              ? t("common.failed-to-load")
              : t("common.not-found")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const channels = channelsResult.ok
    ? (channelsResult.data.channels ?? [])
    : [];
  const warehouses =
    warehousesResult.ok && warehousesResult.data.warehouses?.edges
      ? warehousesResult.data.warehouses.edges.map((e) => e.node)
      : [];

  const productTypeId = product.productType?.id;
  const productTypeResult = productTypeId
    ? await productsService.getProductType({ id: productTypeId }, token)
    : null;
  const productType =
    productTypeResult && productTypeResult.ok
      ? productTypeResult.data.productType
      : null;

  if (!productType) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("marketplace.shared.failed-to-load-product-type")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const variantCount = product.variants?.length ?? 0;
  const firstVariantId = product.variants?.[0]?.id ?? null;

  return (
    <NewVariantClient
      productId={productId}
      product={product}
      productType={productType}
      channels={channels}
      warehouses={warehouses}
      variantCount={variantCount}
      firstVariantId={firstVariantId}
    />
  );
}
