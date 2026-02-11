"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { ProductViewNavigation } from "@/components/product-view-navigation";

interface NewVariantClientProps {
  firstVariantId?: string | null;
  productId: string;
  variantCount: number;
}

export function NewVariantClient({
  productId,
  variantCount,
  firstVariantId,
}: NewVariantClientProps) {
  return (
    <div className="min-h-screen">
      {/* Sticky header bar */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href={`/products/${encodeURIComponent(productId)}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to product
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">Add New Variant</h1>
          </div>
          <Button size="sm" disabled>
            Save
          </Button>
        </div>
      </div>

      {/* Main content: offset below sticky bar */}
      <div className="mx-auto mt-20 px-6 pb-6">
        <div className="mb-4">
          <ProductViewNavigation
            productId={productId}
            variantCount={variantCount}
            firstVariantId={firstVariantId}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Variant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Variant creation form will be implemented here.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                This page will include:
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Variant name and SKU</li>
                <li>Pricing configuration</li>
                <li>Stock management</li>
                <li>Attributes</li>
                <li>Media upload</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
