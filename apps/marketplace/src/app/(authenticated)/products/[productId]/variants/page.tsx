import { redirect } from "next/navigation";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

/**
 * Default variants segment: redirect to first variant or to "new variant" when
 * the product has no variants (e.g. hasVariants false with default variant not
 * yet returned by API, or product with no variants created yet).
 */
export default async function VariantsDefaultPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawProductId } = await params;
  const productId = decodeURIComponent(rawProductId);
  const token = await getServerAuthToken();

  const result = await productsService.getProduct({ id: productId }, token);
  const variants = result.ok ? (result.data.product?.variants ?? []) : [];
  const firstVariantId = variants[0]?.id;

  const encodedProductId = encodeURIComponent(productId);

  if (firstVariantId) {
    redirect(
      `/products/${encodedProductId}/variants/${encodeURIComponent(firstVariantId)}`,
    );
  }

  redirect(`/products/${encodedProductId}/variants/new`);
}
