"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function ProductViewNavigation({
  productId,
  variantCount,
  firstVariantId,
}: {
  productId: string;
  variantCount: number;
  firstVariantId?: string | null;
}) {
  const pathname = usePathname();
  const encodedProductId = encodeURIComponent(productId);

  const productHref = `/products/${encodedProductId}`;
  const variantsHref =
    variantCount > 0 && firstVariantId
      ? `/products/${encodedProductId}/variants/${encodeURIComponent(firstVariantId)}`
      : `/products/${encodedProductId}/variants/new`;

  const isVariants = pathname?.includes(`/products/${encodedProductId}/variants`);

  const linkClasses =
    "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const activeLinkClasses = "bg-background text-foreground shadow-sm";

  return (
    <div className="text-muted-foreground bg-muted mr-auto inline-flex h-10 items-center justify-start rounded-md p-1">
      <Link
        href={productHref}
        className={cn(linkClasses, !isVariants && activeLinkClasses)}
      >
        Product
      </Link>

      <Link
        href={variantsHref}
        className={cn(linkClasses, isVariants && activeLinkClasses)}
      >
        Variants
      </Link>
    </div>
  );
}

