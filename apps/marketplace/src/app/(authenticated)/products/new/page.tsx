"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product creation form will be implemented here.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Product name and description</li>
            <li>Product type selection</li>
            <li>Category selection</li>
            <li>Attributes configuration</li>
            <li>Media upload</li>
            <li>Pricing and variants</li>
            <li>Channel availability</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
