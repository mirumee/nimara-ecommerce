"use client";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

export function AssignedProductsSection() {
  // For new collections, products can only be assigned after creation
  // This section is shown but disabled until the collection is saved
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products in a new collection</CardTitle>
            <CardDescription>
              Assign products after creating the collection
            </CardDescription>
          </div>
          <Button type="button" variant="outline" disabled>
            Assign product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Create the collection first to assign products.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
