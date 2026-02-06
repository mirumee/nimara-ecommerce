import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";

import { ProductViewNavigation } from "@/components/product-view-navigation";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService, productsService } from "@/services";

import { ProductDetailClient } from "./_components/product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawId } = await params;
  const productId = decodeURIComponent(rawId);
  const token = await getServerAuthToken();

  const [
    result,
    channelsResult,
    categoriesResult,
    collectionsResult,
    productTypesResult,
  ] = await Promise.all([
    productsService.getProduct({ id: productId }, token),
    configurationService.getChannels(token),
    productsService.getCategories({ first: 100 }, token),
    productsService.getCollections({ first: 100 }, token),
    productsService.getProductTypes({ first: 100 }, token),
  ]);

  if (!result.ok || !result.data.product) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {!result.ok ? "Failed to load product" : "Product not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = result.data.product;
  const channels = channelsResult.ok ? channelsResult.data.channels ?? [] : [];
  const categories =
    categoriesResult.ok && categoriesResult.data.categories?.edges
      ? categoriesResult.data.categories.edges.map((e) => e.node)
      : [];
  const collections =
    collectionsResult.ok && collectionsResult.data.collections?.edges
      ? collectionsResult.data.collections.edges.map((e) => e.node)
      : [];
  const productTypes =
    productTypesResult.ok && productTypesResult.data.productTypes?.edges
      ? productTypesResult.data.productTypes.edges.map((e) => e.node)
      : [];

  return (
    <div className="[view-transition-name:main-content]">
      <div className="flex flex-col items-center justify-between gap-4">
        <Button asChild className="self-start" type="button" variant="ghost">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> All products
          </Link>
        </Button>

        <ProductViewNavigation
          productId={productId}
          variantCount={product.variants?.length ?? 0}
          firstVariantId={product.variants?.[0]?.id}
        />

        <ProductDetailClient
          productId={productId}
          product={product}
          channels={channels}
          categories={categories}
          collections={collections}
          productTypes={productTypes}
        />
      </div>
    </div>
  );
}
