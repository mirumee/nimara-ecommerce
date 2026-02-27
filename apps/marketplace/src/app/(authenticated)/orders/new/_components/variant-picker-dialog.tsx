"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { ScrollArea } from "@nimara/ui/components/scroll-area";

import { getProductDetail, searchProducts } from "../actions";
import { PickerDialogShell } from "./picker-dialog-shell";

type ProductHit = { id: string; name: string };
type VariantHit = { id: string; name: string; sku: string };

export function VariantPickerDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  onAdd: (line: { quantity: number; variantId: string }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<ProductHit[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [variants, setVariants] = useState<VariantHit[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSearch("");
    setProducts([]);
    setSelectedProductId("");
    setVariants([]);
    setSelectedVariantId("");
    setQuantity(1);
  }, [open]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [selectedVariantId, variants],
  );

  const handleSearchProducts = async () => {
    const q = search.trim();

    if (!q) {
      setProducts([]);

      return;
    }
    setIsSearching(true);
    try {
      const res = await searchProducts(q);

      if (!res.ok) {
        setProducts([]);

        return;
      }
      const nodes =
        res.data.products?.edges?.map((e) => e.node).filter(Boolean) ?? [];

      setProducts(nodes.map((p) => ({ id: p.id, name: p.name })));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickProduct = async (productId: string) => {
    setSelectedProductId(productId);
    setSelectedVariantId("");
    setVariants([]);

    setIsLoadingVariants(true);
    try {
      const res = await getProductDetail(productId);

      if (!res.ok) {
        setVariants([]);

        return;
      }
      const vs = res.data.product?.variants ?? [];

      const mapped: VariantHit[] = vs
        .filter(Boolean)
        .map((v) => ({ id: v.id, name: v.name, sku: v.sku ?? "" }));

      setVariants(mapped);
      if (mapped[0]?.id) {
        setSelectedVariantId(mapped[0].id);
      }
    } finally {
      setIsLoadingVariants(false);
    }
  };

  return (
    <PickerDialogShell
      open={open}
      title="Assign product"
      onOpenChange={onOpenChange}
      primaryLabel="Assign and save"
      onPrimary={() => {
        if (!selectedVariant || quantity <= 0) {
          return;
        }
        onAdd({ quantity, variantId: selectedVariant.id });
        onOpenChange(false);
      }}
      primaryDisabled={!selectedVariant || quantity <= 0}
      footerLeft={
        selectedVariant ? `1 variant selected (${selectedVariant.sku})` : ""
      }
    >
      <div className="grid gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSearchProducts();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSearchProducts()}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-md border">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {products.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No products
                  </div>
                ) : (
                  products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={[
                        "w-full rounded-md px-3 py-2 text-left text-sm",
                        "hover:bg-muted",
                        selectedProductId === p.id ? "bg-muted" : "",
                      ].join(" ")}
                      onClick={() => void handlePickProduct(p.id)}
                    >
                      <div className="font-medium">{p.name}</div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {isLoadingVariants ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    Loading variants...
                  </div>
                ) : variants.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    Pick a product to see variants
                  </div>
                ) : (
                  variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={[
                        "w-full rounded-md px-3 py-2 text-left text-sm",
                        "hover:bg-muted",
                        selectedVariantId === v.id ? "bg-muted" : "",
                      ].join(" ")}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.sku}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {selectedVariant
              ? `${selectedVariant.name} (${selectedVariant.sku})`
              : "No variant selected"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Qty</span>
            <Input
              className="w-24"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        </div>
      </div>
    </PickerDialogShell>
  );
}
