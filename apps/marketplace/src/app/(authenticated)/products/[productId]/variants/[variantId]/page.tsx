"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

export default function VariantDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const variantId = params.variantId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/products/${productId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Variant Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Variant ID: {variantId}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Variant editing form will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
