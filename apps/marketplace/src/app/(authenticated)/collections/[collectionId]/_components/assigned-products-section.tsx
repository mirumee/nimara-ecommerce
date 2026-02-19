"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { useToast } from "@nimara/ui/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CollectionDetail_collection_Collection } from "@/graphql/generated/client";

import { removeProductsFromCollection } from "../actions";
import { ProductSelectionDialog } from "./product-selection-dialog";

type AssignedProduct = NonNullable<
  NonNullable<
    CollectionDetail_collection_Collection["products"]
  >["edges"][number]["node"]
>;

type Props = {
  collectionId: string;
  collectionName?: string | null;
  onProductsChange?: () => void;
  products: AssignedProduct[];
};

export function AssignedProductsSection({
  collectionId,
  collectionName,
  products,
  onProductsChange,
}: Props) {
  const { toast } = useToast();
  const [isRemoveLoading, setIsRemoveLoading] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemoveProduct = async (productId: string) => {
    setIsRemoveLoading(productId);
    try {
      const result = await removeProductsFromCollection(collectionId, [
        productId,
      ]);

      if (!result.ok) {
        toast({
          title: "Failed to remove product",
          description: result.errors
            .map(
              (e: { message?: string | null }) => e.message || "Unknown error",
            )
            .join(", "),
          variant: "destructive",
        });
        setIsRemoveLoading(null);

        return;
      }

      const errors =
        (
          result.data as {
            collectionRemoveProducts?: {
              errors?: Array<{ message?: string | null }>;
            };
          }
        )?.collectionRemoveProducts?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to remove product",
          description:
            errors
              .map((e: { message?: string | null }) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });
        setIsRemoveLoading(null);

        return;
      }

      toast({
        title: "Product removed",
        description: "Product has been removed from collection.",
      });
      onProductsChange?.();
    } catch (error) {
      toast({
        title: "Failed to remove product",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRemoveLoading(null);
    }
  };

  const handleProductsAssigned = () => {
    setIsDialogOpen(false);
    onProductsChange?.();
  };

  const getChannelCount = (product: AssignedProduct): number => {
    return product.channelListings?.filter((l) => l.isPublished).length ?? 0;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products in {collectionName}</CardTitle>
              <CardDescription>
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} assigned
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              Assign product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No products assigned to this collection yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Name</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const channelCount = getChannelCount(product);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.thumbnail?.url ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded border">
                            <Image
                              src={product.thumbnail.url}
                              alt={product.thumbnail.alt || product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded border bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.productType?.name || "—"}</TableCell>
                      <TableCell>
                        {channelCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {channelCount}{" "}
                            {channelCount === 1 ? "Channel" : "Channels"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No channels
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(product.id)}
                          disabled={isRemoveLoading === product.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        collectionId={collectionId}
        assignedProductIds={products.map((p) => p.id)}
        onProductsAssigned={handleProductsAssigned}
      />
    </>
  );
}
