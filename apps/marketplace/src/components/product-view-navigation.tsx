"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function ProductViewNavigation({
  productId,
  variantCount,
  firstVariantId,
}: {
  firstVariantId?: string | null;
  productId: string;
  variantCount: number;
}) {
  const pathname = usePathname();
  const encodedProductId = encodeURIComponent(productId);

  const productHref = `/products/${encodedProductId}`;
  const variantsHref =
    variantCount > 0 && firstVariantId
      ? `/products/${encodedProductId}/variants/${encodeURIComponent(firstVariantId)}`
      : `/products/${encodedProductId}/variants/new`;

  // Check if we're on a variants page
  // Match pattern: /products/[productId]/variants[/variantId or /new]
  const isVariants = Boolean(
    pathname?.match(/\/products\/[^/]+\/variants(\/|$)/),
  );

  const linkClasses =
    "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const activeLinkClasses = "bg-background text-foreground shadow-sm";

  return (
    <div className="mr-auto inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
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
