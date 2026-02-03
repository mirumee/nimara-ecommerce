"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

export default function NewVariantPage() {
  const params = useParams();
  const productId = params.productId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/products/${productId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Variant</h1>
      </div>

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
  );
}
