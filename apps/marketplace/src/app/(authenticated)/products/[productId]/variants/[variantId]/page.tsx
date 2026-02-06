import { Card, CardContent } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService, productsService } from "@/services";

import { VariantDetailClient } from "./_components/variant-detail-client";

export default async function VariantDetailPage({
  params,
}: {
  params: Promise<{ productId: string; variantId: string }>;
}) {
  const { productId: rawProductId, variantId: rawVariantId } = await params;
  const productId = decodeURIComponent(rawProductId);
  const variantId = decodeURIComponent(rawVariantId);
  const token = await getServerAuthToken();

  const [productResult, variantResult, channelsResult, warehousesResult] =
    await Promise.all([
      productsService.getProduct({ id: productId }, token),
      productsService.getProductVariant({ id: variantId }, token),
      configurationService.getChannels(token),
      configurationService.getWarehouses(token),
    ]);

  const product = productResult.ok ? productResult.data.product : null;
  const variant = variantResult.ok ? variantResult.data.productVariant : null;

  if (!product || !variant) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {!productResult.ok || !variantResult.ok
              ? "Failed to load variant"
              : "Variant not found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const channels = channelsResult.ok ? channelsResult.data.channels ?? [] : [];
  const warehouses =
    warehousesResult.ok && warehousesResult.data.warehouses?.edges
      ? warehousesResult.data.warehouses.edges.map((e) => e.node)
      : [];

  const productTypeId = product.productType?.id;
  const productTypeResult = productTypeId
    ? await productsService.getProductType({ id: productTypeId }, token)
    : null;
  const productType =
    productTypeResult && productTypeResult.ok ? productTypeResult.data.productType : null;

  if (!productType) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load product type</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <VariantDetailClient
      productId={productId}
      variantId={variantId}
      product={product}
      variant={variant}
      productType={productType}
      channels={channels}
      warehouses={warehouses}
    />
  );
}
