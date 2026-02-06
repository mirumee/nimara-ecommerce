import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

export default async function VariantDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ productId: string; variantId: string }>;
}) {
  const { productId: rawProductId, variantId: rawVariantId } = await params;
  const productId = decodeURIComponent(rawProductId);
  const variantId = decodeURIComponent(rawVariantId);

  const token = await getServerAuthToken();
  const productResult = await productsService.getProduct({ id: productId }, token);

  const variants = productResult.ok ? productResult.data.product?.variants ?? [] : [];

  return (
    <div className="w-full">
      <div className="flex flex-row gap-4">
        <div className="basis-3/4">{children}</div>

        <div className="min-w-80 basis-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>

            <div>
              {variants.map((v, index) => {
                const isActive = v.id === variantId;
                const showDivider = index !== variants.length - 1;

                return (
                  <div key={v.id}>
                    <Link
                      href={`/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(v.id)}`}
                      className={[
                        "hover:bg-accent flex flex-col gap-1 py-4 px-6",
                        isActive ? "bg-accent" : "",
                      ].join(" ")}
                    >
                      <h3 className="text-sm font-medium">{v.name}</h3>
                      <h4 className="text-muted-foreground text-xs">
                        SKU: {v.sku ?? "N/A"}
                      </h4>
                    </Link>

                    {showDivider ? <div className="border-t" /> : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

