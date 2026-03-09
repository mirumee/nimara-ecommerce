"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@nimara/ui/components/card";

type Variant = {
  id: string;
  name: string;
  sku?: string | null;
};

type Props = {
  productId: string;
  variants: Variant[];
};

export function VariantsList({ productId, variants }: Props) {
  const pathname = usePathname();
  const encodedProductId = encodeURIComponent(productId);

  // Extract variantId from pathname
  // Pathname will be like: /products/[productId]/variants/[variantId] or /products/[productId]/variants/new
  const pathSegments = pathname?.split("/") ?? [];
  const variantsIndex = pathSegments.findIndex((seg) => seg === "variants");
  const variantIdOrNew =
    variantsIndex >= 0 && variantsIndex < pathSegments.length - 1
      ? decodeURIComponent(pathSegments[variantsIndex + 1])
      : null;

  const isNewVariant = variantIdOrNew === "new";
  const currentVariantId = isNewVariant ? null : variantIdOrNew;

  return (
    <Card className="mt-20">
      <CardHeader>
        <CardTitle>Variants</CardTitle>
      </CardHeader>

      <div>
        {/* Show existing variants */}
        {variants.map((v, index) => {
          const isActive = v.id === currentVariantId;
          const showDivider = index !== variants.length - 1 || isNewVariant;

          return (
            <div key={v.id}>
              {index === 0 && <div className="border-t" />}
              <Link
                href={`/products/${encodedProductId}/variants/${encodeURIComponent(v.id)}`}
                className={[
                  "flex flex-col gap-1 px-6 py-4 hover:bg-accent",
                  isActive ? "bg-accent" : "",
                ].join(" ")}
              >
                <h3 className="text-sm font-medium">{v.name}</h3>
                <h4 className="text-xs text-muted-foreground">
                  SKU: {v.sku ?? "N/A"}
                </h4>
              </Link>

              {showDivider ? <div className="border-t" /> : null}
            </div>
          );
        })}

        {/* Show "New Variant" as disabled/active when on new variant page */}
        {isNewVariant && (
          <>
            <div className="border-t" />
            <div className="flex flex-col gap-1 bg-accent px-6 py-4 opacity-60">
              <h3 className="text-sm font-medium">New Variant</h3>
              <h4 className="text-xs text-muted-foreground">Creating...</h4>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
