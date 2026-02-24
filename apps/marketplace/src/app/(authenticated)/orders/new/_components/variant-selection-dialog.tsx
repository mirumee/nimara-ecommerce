"use client";

import { ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { ScrollArea } from "@nimara/ui/components/scroll-area";

import { formatPrice } from "@/lib/utils";

import { getProductDetail, getProductsForOrder } from "../actions";

export type VariantLineDraft = {
  productName?: string;
  quantity: number;
  sku: string;
  thumbnail?: { alt: string | null; url: string } | null;
  unitPrice?: { amount: number; currency: string } | null;
  variantId: string;
  variantName: string;
};

type ProductHit = {
  id: string;
  name: string;
  thumbnail: { url: string; alt: string | null } | null;
};

type VariantRow = {
  id: string;
  name: string;
  sku: string;
  unitPrice: { amount: number; currency: string } | null;
};

type VariantMeta = {
  id: string;
  name: string;
  sku: string;
  unitPrice: { amount: number; currency: string } | null;
  productId?: string;
  productName?: string;
  thumbnail?: { alt: string | null; url: string } | null;
};

export function VariantSelectionDialog({
  channelName,
  channelId,
  initialLines,
  onOpenChange,
  onSave,
  open,
}: {
  channelName?: string;
  channelId?: string;
  initialLines: VariantLineDraft[];
  onOpenChange: (open: boolean) => void;
  onSave: (lines: VariantLineDraft[]) => void;
  open: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [variantsByProductId, setVariantsByProductId] = useState<
    Record<string, VariantRow[]>
  >({});
  const [loadingVariantsByProductId, setLoadingVariantsByProductId] = useState<
    Record<string, boolean>
  >({});
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(
    new Set(),
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Record<string, VariantMeta>>({});

  const prevOpenRef = useRef(false);
  const variantsFetchSeq = useRef(0);

  const initialSelectedIds = useMemo(
    () => new Set(initialLines.map((l) => l.variantId)),
    [initialLines],
  );

  const loadProducts = useCallback(async (searchTerm?: string) => {
    setIsLoadingProducts(true);
    try {
      const res = await getProductsForOrder({
        first: 50,
        search: searchTerm?.trim() || undefined,
      });
      if (!res.ok) {
        setProducts([]);
        return;
      }

      const nodes =
        res.data.products?.edges?.map((e) => e.node).filter(Boolean) ?? [];

      const mapped = nodes.map((p) => ({
        id: p.id,
        name: p.name,
        thumbnail: p.thumbnail ?? null,
      }));

      setProducts(mapped);
      // By default show variants under each product (like screenshot)
      setExpandedProductIds(new Set(mapped.map((p) => p.id)));
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (prevOpenRef.current) return;
    prevOpenRef.current = true;

    setSearch("");
    setSelectedVariantIds(new Set(initialSelectedIds));
    setExpandedProductIds(new Set());
    setVariantsByProductId({});
    setLoadingVariantsByProductId({});
    setQuantities(
      initialLines.reduce<Record<string, number>>((acc, l) => {
        acc[l.variantId] = Math.max(1, l.quantity ?? 1);
        return acc;
      }, {}),
    );
    setMeta(
      initialLines.reduce<Record<string, VariantMeta>>((acc, l) => {
        acc[l.variantId] = {
          id: l.variantId,
          name: l.variantName,
          sku: l.sku,
          unitPrice: l.unitPrice ?? null,
          productName: l.productName,
          thumbnail: l.thumbnail ?? null,
        };
        return acc;
      }, {}),
    );
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Prefetch variants + prices for all products shown in the list.
  useEffect(() => {
    if (!open) return;
    if (products.length === 0) return;

    const seq = ++variantsFetchSeq.current;
    let cancelled = false;

    setLoadingVariantsByProductId(() => {
      const next: Record<string, boolean> = {};
      for (const p of products) next[p.id] = true;
      return next;
    });

    const concurrency = 6;
    let idx = 0;
    const variantsUpdates: Record<string, VariantRow[]> = {};
    const metaUpdates: Record<string, VariantMeta> = {};

    const worker = async () => {
      while (idx < products.length) {
        const product = products[idx];
        idx += 1;

        const res = await getProductDetail(product.id);
        if (!res.ok || !res.data.product) {
          variantsUpdates[product.id] = [];
          continue;
        }

        const p = res.data.product;
        const vs = (p.variants ?? []).filter(Boolean);
        const mapped: VariantRow[] = vs.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          unitPrice: (() => {
            const byChannel = channelId
              ? v.channelListings?.find((cl) => cl.channel.id === channelId)
                  ?.price
              : null;
            if (byChannel) {
              return { amount: byChannel.amount, currency: byChannel.currency };
            }
            const gross = v.pricing?.price?.gross ?? null;
            return gross
              ? { amount: gross.amount, currency: gross.currency }
              : null;
          })(),
        }));

        variantsUpdates[product.id] = mapped;

        for (const variant of mapped) {
          metaUpdates[variant.id] = {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            unitPrice: variant.unitPrice,
            productId: product.id,
            productName: p.name ?? product.name,
            thumbnail: p.thumbnail ?? product.thumbnail ?? null,
          };
        }
      }
    };

    void Promise.all(
      Array.from({ length: Math.min(concurrency, products.length) }, () =>
        worker(),
      ),
    ).then(() => {
      if (cancelled) return;
      if (seq !== variantsFetchSeq.current) return;

      setVariantsByProductId(variantsUpdates);
      setMeta((prev) => ({ ...prev, ...metaUpdates }));
      setLoadingVariantsByProductId(() => {
        const next: Record<string, boolean> = {};
        for (const p of products) next[p.id] = false;
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [channelId, open, products]);

  const toggleVariant = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
        setQuantities((qPrev) => ({
          ...qPrev,
          [variantId]: qPrev[variantId] ?? 1,
        }));
      }
      return next;
    });
  };

  const setVariantQty = (variantId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [variantId]: Math.max(1, qty) }));
  };

  // Fix: read current expanded state BEFORE calling setExpandedProductIds so we
  // never trigger a state update (expand) from inside a state updater function.
  const toggleExpandProduct = (product: ProductHit) => {
    const isCurrentlyExpanded = expandedProductIds.has(product.id);

    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyExpanded) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });
  };

  const toggleProductSelection = (productId: string) => {
    const vs = variantsByProductId[productId] ?? [];
    if (vs.length === 0) {
      return;
    }
    const allSelected = vs.every((v) => selectedVariantIds.has(v.id));
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const v of vs) next.delete(v.id);
      } else {
        for (const v of vs) {
          next.add(v.id);
          setQuantities((qPrev) => ({ ...qPrev, [v.id]: qPrev[v.id] ?? 1 }));
        }
      }
      return next;
    });
  };

  const productSelectionState = useCallback(
    (productId: string): { checked: boolean; indeterminate: boolean } => {
      const vs = variantsByProductId[productId] ?? [];
      if (vs.length === 0) return { checked: false, indeterminate: false };
      const some = vs.some((v) => selectedVariantIds.has(v.id));
      const all = vs.every((v) => selectedVariantIds.has(v.id));
      return { checked: all, indeterminate: some && !all };
    },
    [selectedVariantIds, variantsByProductId],
  );

  const handleConfirm = () => {
    const lines: VariantLineDraft[] = [];

    for (const variantId of selectedVariantIds) {
      const existing = initialLines.find((l) => l.variantId === variantId);
      const m = meta[variantId];
      const qty = quantities[variantId] ?? existing?.quantity ?? 1;

      lines.push({
        variantId,
        quantity: Math.max(1, qty),
        sku: m?.sku ?? existing?.sku ?? "",
        variantName: m?.name ?? existing?.variantName ?? variantId,
        productName: m?.productName ?? existing?.productName,
        thumbnail: m?.thumbnail ?? existing?.thumbnail ?? undefined,
        unitPrice: m?.unitPrice ?? existing?.unitPrice ?? undefined,
      });
    }

    onSave(lines);
    onOpenChange(false);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setExpandedProductIds(new Set());
    setVariantsByProductId({});
    setLoadingVariantsByProductId({});
    void loadProducts(search).finally(() => setIsSearching(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Add product{channelName ? ` from ${channelName}` : ""}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            You can only add products available for the order&apos;s channel
          </p>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching || isLoadingProducts}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[400px]">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No products found
              </div>
            ) : (
              <div>
                {products.map((product) => {
                  const expanded = expandedProductIds.has(product.id);
                  const variants = variantsByProductId[product.id] ?? [];
                  const isLoadingVariants = Boolean(
                    loadingVariantsByProductId[product.id],
                  );
                  const { checked, indeterminate } = productSelectionState(
                    product.id,
                  );

                  return (
                    <div key={product.id}>
                      {/* Product row */}
                      <div className="border-b">
                        <div className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/50">
                          <ProductCheckbox
                            checked={checked}
                            indeterminate={indeterminate}
                            disabled={
                              isLoadingVariants || variants.length === 0
                            }
                            onChange={() => toggleProductSelection(product.id)}
                          />
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            onClick={() => toggleExpandProduct(product)}
                          >
                            {product.thumbnail?.url ? (
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                                <Image
                                  src={product.thumbnail.url}
                                  alt={product.thumbnail.alt || product.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded border bg-muted" />
                            )}
                            <span className="min-w-0 truncate text-sm font-medium">
                              {product.name}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                            onClick={() => toggleExpandProduct(product)}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {expanded ? (
                          <div className="bg-background">
                            {isLoadingVariants ? (
                              <div className="flex items-center gap-2 px-4 py-3 pl-16 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading variants...
                              </div>
                            ) : variants.length === 0 ? (
                              <div className="px-4 py-3 pl-16 text-sm text-muted-foreground">
                                No variants for this product
                              </div>
                            ) : (
                              variants.map((variant) => {
                                const checkedVariant = selectedVariantIds.has(
                                  variant.id,
                                );
                                const qty = quantities[variant.id] ?? 1;
                                const canSelect = Boolean(variant.unitPrice);
                                return (
                                  <div
                                    key={variant.id}
                                    className="flex w-full items-center justify-between border-t px-4 py-2.5 pl-16 hover:bg-muted/50"
                                  >
                                    <button
                                      type="button"
                                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                      onClick={() => {
                                        if (!canSelect) return;
                                        toggleVariant(variant.id);
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={checkedVariant}
                                        disabled={!canSelect}
                                        onChange={() =>
                                          toggleVariant(variant.id)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div className="min-w-0">
                                        <div className="truncate text-sm">
                                          {variant.name}
                                        </div>
                                      </div>
                                    </button>
                                    <div className="flex items-center gap-3">
                                      {variant.unitPrice ? (
                                        <span className="shrink-0 text-sm text-muted-foreground">
                                          {formatPrice(
                                            variant.unitPrice.amount,
                                            variant.unitPrice.currency,
                                          )}
                                        </span>
                                      ) : (
                                        <span className="shrink-0 text-sm text-muted-foreground">
                                          No price in channel
                                        </span>
                                      )}
                                      <Input
                                        className="w-20"
                                        type="number"
                                        min={1}
                                        value={qty}
                                        disabled={!checkedVariant || !canSelect}
                                        onChange={(e) => {
                                          const next = parseInt(
                                            e.target.value,
                                            10,
                                          );
                                          setVariantQty(
                                            variant.id,
                                            Number.isFinite(next) && next > 0
                                              ? next
                                              : 1,
                                          );
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedVariantIds.size === 0}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
