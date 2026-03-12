"use client";

import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { ScrollArea } from "@nimara/ui/components/scroll-area";
import { useToast } from "@nimara/ui/hooks";

import { useDebounce } from "@/hooks/use-debounce";

import {
  addProductsToCollection,
  getAvailableProducts,
  removeProductsFromCollection,
} from "../actions";

type Product = {
  id: string;
  name: string;
  productType: {
    name: string;
  } | null;
  slug: string;
  thumbnail: {
    alt: string | null;
    url: string;
  } | null;
};

type Props = {
  assignedProductIds: string[];
  collectionId: string;
  onOpenChange: (open: boolean) => void;
  onProductsAssigned?: () => void;
  open: boolean;
};

export function ProductSelectionDialog({
  open,
  onOpenChange,
  collectionId,
  assignedProductIds,
  onProductsAssigned,
}: Props) {
  const t = useTranslations();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Sync state when dialog opens/closes. Do not depend on debouncedSearch so that
  // typing in search does not reset selectedProductIds.
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedProductIds(new Set());
      setProducts([]);

      return;
    }

    setSearchQuery("");
    setSelectedProductIds(new Set(assignedProductIds));
    void loadProducts("");
  }, [open, assignedProductIds]);

  // Reload product list when search term changes (debounced). Does not reset selection.
  // Only depends on debouncedSearch so opening the dialog does not run this (effect above loads with "").
  useEffect(() => {
    if (!open) {
      return;
    }

    void loadProducts();
  }, [debouncedSearch]);

  // Load products when dialog is open and (optionally) when search term changes.
  // Uses searchOverride when opening so we load with "" immediately instead of stale debounce.
  const loadProducts = async (searchOverride?: string) => {
    const search =
      searchOverride !== undefined ? searchOverride : debouncedSearch;

    setIsLoading(true);
    try {
      const result = await getAvailableProducts({
        first: 50,
        search: search || undefined,
      });

      if (!result.ok) {
        toast({
          title: t(
            "marketplace.collections.assigned-products.toast-load-failed",
          ),
          description: t(
            "marketplace.collections.assigned-products.toast-load-failed-desc",
          ),
          variant: "destructive",
        });

        return;
      }

      const allProducts =
        result.data.products?.edges.map((edge) => edge.node) ?? [];

      // Show all products (including already assigned ones)
      setProducts(allProducts);
    } catch (error) {
      toast({
        title: t("marketplace.collections.assigned-products.toast-load-failed"),
        description:
          error instanceof Error
            ? error.message
            : t("common.toast-unknown-error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProductIds);

    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      // Calculate which products to add and which to remove
      const currentSelection = Array.from(selectedProductIds);
      const previouslyAssigned = assignedProductIds;

      const toAdd = currentSelection.filter(
        (id) => !previouslyAssigned.includes(id),
      );
      const toRemove = previouslyAssigned.filter(
        (id) => !currentSelection.includes(id),
      );

      // Perform add and remove operations
      const promises: Promise<unknown>[] = [];

      if (toAdd.length > 0) {
        promises.push(
          addProductsToCollection(collectionId, toAdd).then((result) => {
            if (!result.ok) {
              throw new Error(
                result.errors
                  .map(
                    (e: { message?: string | null }) =>
                      e.message || t("common.toast-unknown-error"),
                  )
                  .join(", "),
              );
            }
            const errors =
              (
                result.data as {
                  collectionAddProducts?: {
                    errors?: Array<{ message?: string | null }>;
                  };
                }
              )?.collectionAddProducts?.errors ?? [];

            if (errors.length > 0) {
              throw new Error(
                errors
                  .map((e: { message?: string | null }) => e.message)
                  .filter((msg): msg is string => Boolean(msg))
                  .join(", ") || t("common.toast-unknown-error"),
              );
            }
          }),
        );
      }

      if (toRemove.length > 0) {
        promises.push(
          removeProductsFromCollection(collectionId, toRemove).then(
            (result) => {
              if (!result.ok) {
                throw new Error(
                  result.errors
                    .map(
                      (e: { message?: string | null }) =>
                        e.message || t("common.toast-unknown-error"),
                    )
                    .join(", "),
                );
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
                throw new Error(
                  errors
                    .map((e: { message?: string | null }) => e.message)
                    .filter((msg): msg is string => Boolean(msg))
                    .join(", ") || t("common.toast-unknown-error"),
                );
              }
            },
          ),
        );
      }

      if (promises.length === 0) {
        // No changes made
        onOpenChange(false);

        return;
      }

      await Promise.all(promises);

      const addedCount = toAdd.length;
      const removedCount = toRemove.length;
      let message = "";

      if (addedCount > 0 && removedCount > 0) {
        const addedPart = t(
          "marketplace.collections.assigned-products.message-added-part",
          {
            count: addedCount,
          },
        );
        const removedPart = t(
          "marketplace.collections.assigned-products.message-removed-part",
          {
            count: removedCount,
          },
        );

        message = `${addedPart} and ${removedPart}.`;
      } else if (addedCount > 0) {
        message = t("marketplace.collections.assigned-products.message-added", {
          count: addedCount,
        });
      } else if (removedCount > 0) {
        message = t(
          "marketplace.collections.assigned-products.message-removed",
          {
            count: removedCount,
          },
        );
      }

      toast({
        title: t("marketplace.collections.assigned-products.toast-updated"),
        description: message,
      });
      onProductsAssigned?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t(
          "marketplace.collections.assigned-products.toast-update-failed",
        ),
        description:
          error instanceof Error
            ? error.message
            : t("common.toast-unknown-error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("marketplace.collections.assigned-products.dialog-title")}
          </DialogTitle>
          <DialogDescription>
            {t("marketplace.collections.assigned-products.dialog-description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t(
                "marketplace.collections.assigned-products.search-placeholder",
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? t(
                        "marketplace.collections.assigned-products.empty-search",
                      )
                    : t(
                        "marketplace.collections.assigned-products.empty-no-products",
                      )}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                    {product.thumbnail?.url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded border">
                        <Image
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt || product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded border bg-muted" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.productType?.name || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="text-sm text-muted-foreground">
            {t("marketplace.collections.assigned-products.selected-count", {
              count: selectedProductIds.size,
            })}
            {assignedProductIds.length > 0 && (
              <span className="ml-2">
                {t(
                  "marketplace.collections.assigned-products.already-assigned",
                  { count: assignedProductIds.length },
                )}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              t("marketplace.collections.assigned-products.assign-save-button")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
