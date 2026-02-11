import { Card, CardContent } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

import { NewVariantClient } from "./_components/new-variant-client";

export default async function NewVariantPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawProductId } = await params;
  const productId = decodeURIComponent(rawProductId);
  const token = await getServerAuthToken();

  const productResult = await productsService.getProduct(
    { id: productId },
    token,
  );
  const product = productResult.ok ? productResult.data.product : null;

  if (!product) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {!productResult.ok || !product
              ? "Failed to load product"
              : "Product not found"}
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
      variantCount={variantCount}
      firstVariantId={firstVariantId}
    />
  );
}
