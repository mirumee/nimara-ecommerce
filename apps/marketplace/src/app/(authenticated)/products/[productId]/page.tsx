import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawId } = await params;
  const productId = decodeURIComponent(rawId);
  const token = await getServerAuthToken();

  const result = await productsService.getProduct({ id: productId }, token);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.slug}</p>
          </div>
        </div>
        <Button>Edit Product</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">
                  {product.description ? (
                    <span dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <span className="text-muted-foreground">No description</span>
                  )}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product Type</p>
                  <p className="mt-1">{product.productType?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="mt-1">{product.category?.name || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variants</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${productId}/variants/new`}>Add Variant</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {product.variants && product.variants.length > 0 ? (
                <div className="space-y-2">
                  {product.variants
                    .filter((v): v is NonNullable<typeof v> => v != null)
                    .map((variant) => (
                      <Link
                        key={variant.id}
                        href={`/products/${productId}/variants/${variant.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {variant.sku || "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {variant.pricing?.price?.gross
                              ? `${variant.pricing.price.gross.currency} ${variant.pricing.price.gross.amount.toFixed(2)}`
                              : "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stock:{" "}
                            {variant.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No variants</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              {product.thumbnail?.url ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={product.thumbnail.url}
                    alt={product.thumbnail.alt || product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Channel Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Availability</CardTitle>
            </CardHeader>
            <CardContent>
              {product.channelListings && product.channelListings.length > 0 ? (
                <div className="space-y-2">
                  {product.channelListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <span className="text-sm">{listing.channel.name}</span>
                      {listing.isPublished ? (
                        <span className="text-xs text-green-600">Published</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Draft</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No channels</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
