import type { ReactNode } from "react";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

import { VariantsList } from "./_components/variants-list";

export default async function VariantsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawProductId } = await params;
  const productId = decodeURIComponent(rawProductId);

  const token = await getServerAuthToken();
  const productResult = await productsService.getProduct(
    { id: productId },
    token,
  );

  const variants = productResult.ok
    ? (productResult.data.product?.variants ?? [])
    : [];

  return (
    <div className="w-full">
      <div className="flex flex-row gap-4">
        <div className="basis-3/4">{children}</div>

        <div className="min-w-80 basis-1/4">
          <VariantsList productId={productId} variants={variants} />
        </div>
      </div>
    </div>
  );
}
