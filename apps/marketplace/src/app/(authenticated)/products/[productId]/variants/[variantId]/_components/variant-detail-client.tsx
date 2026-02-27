"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { InputField } from "@/components/fields/input-field";
import { SelectField } from "@/components/fields/select-field";
import { ProductViewNavigation } from "@/components/product-view-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  AttributeInputTypeEnum,
  BulkAttributeValueInput,
  Channels,
  ProductDetail,
  ProductTypeDetail,
  ProductVariantDelete_Mutation,
  ProductVariantDetail,
  Warehouses,
} from "@/graphql/generated/client";

import { deleteVariant, productVariantBulkUpdate } from "../actions";
import { type VariantUpdateFormValues, variantUpdateSchema } from "../schema";
import { VariantChannelListingSection } from "./variant-channel-listing-section";
import { VariantStocksSection } from "./variant-stocks-section";

function buildBulkAttributeValueInputs(
  assignedAttributes: NonNullable<
    NonNullable<ProductVariantDetail["productVariant"]>["assignedAttributes"]
  >,
  attributeValues: Record<string, unknown>,
): BulkAttributeValueInput[] {
  const inputs: BulkAttributeValueInput[] = [];

  for (const assigned of assignedAttributes) {
    const attributeId = assigned.attribute.id;
    const inputType = assigned.attribute.inputType;
    const value = attributeValues[attributeId];

    if (value === undefined || value === null) {
      continue;
    }

    switch (inputType) {
      case "BOOLEAN" as AttributeInputTypeEnum: {
        inputs.push({ id: attributeId, boolean: Boolean(value) });
        break;
      }
      case "DATE" as AttributeInputTypeEnum: {
        if (String(value).trim()) {
          inputs.push({ id: attributeId, date: String(value) });
        }
        break;
      }
      case "DATE_TIME" as AttributeInputTypeEnum: {
        if (String(value).trim()) {
          inputs.push({ id: attributeId, dateTime: String(value) });
        }
        break;
      }
      case "NUMERIC" as AttributeInputTypeEnum: {
        if (String(value).trim()) {
          inputs.push({ id: attributeId, numeric: String(value) });
        }
        break;
      }
      case "PLAIN_TEXT" as AttributeInputTypeEnum: {
        inputs.push({ id: attributeId, plainText: String(value) });
        break;
      }
      case "RICH_TEXT" as AttributeInputTypeEnum: {
        inputs.push({ id: attributeId, richText: String(value) });
        break;
      }
      case "DROPDOWN" as AttributeInputTypeEnum: {
        if (String(value).trim()) {
          inputs.push({ id: attributeId, dropdown: { value: String(value) } });
        }
        break;
      }
      case "SWATCH" as AttributeInputTypeEnum: {
        if (String(value).trim()) {
          inputs.push({ id: attributeId, swatch: { value: String(value) } });
        }
        break;
      }
      case "MULTISELECT" as AttributeInputTypeEnum: {
        if (Array.isArray(value) && value.length > 0) {
          const selected = value
            .map((v) => {
              if (typeof v === "string") {
                return v;
              }
              if (v && typeof v === "object" && "value" in v) {
                return String((v as { value?: unknown }).value ?? "");
              }

              return "";
            })
            .filter(Boolean);

          inputs.push({
            id: attributeId,
            multiselect: selected.map((v) => ({ value: v })),
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  return inputs;
}

function defaultVariantAttributes(
  assignedAttributes: NonNullable<
    NonNullable<ProductVariantDetail["productVariant"]>["assignedAttributes"]
  >,
) {
  const values: Record<string, unknown> = {};

  for (const assigned of assignedAttributes ?? []) {
    const id = assigned.attribute.id;

    switch (assigned.__typename) {
      case "AssignedBooleanAttribute":
        values[id] = assigned.booleanValue ?? false;
        break;
      case "AssignedDateAttribute":
        values[id] = assigned.dateValue ?? "";
        break;
      case "AssignedDateTimeAttribute":
        values[id] = assigned.dateTimeValue ?? "";
        break;
      case "AssignedNumericAttribute":
        values[id] = assigned.numericValue ?? "";
        break;
      case "AssignedPlainTextAttribute":
        values[id] = assigned.plainTextValue ?? "";
        break;
      case "AssignedTextAttribute":
        values[id] =
          typeof assigned.textValue === "string"
            ? assigned.textValue
            : JSON.stringify(assigned.textValue ?? "", null, 2);
        break;
      case "AssignedSingleChoiceAttribute":
        values[id] = assigned.singleChoiceValue?.slug ?? "";
        break;
      case "AssignedMultiChoiceAttribute":
        values[id] =
          assigned.multiChoiceValue
            ?.map((v) => ({
              value: v.slug ?? "",
              label: v.name ?? v.slug ?? "",
            }))
            .filter((o) => o.value) ?? [];
        break;
      case "AssignedSwatchAttribute":
        values[id] = assigned.swatchValue?.slug ?? "";
        break;
      default:
        break;
    }
  }

  return values;
}

export function VariantDetailClient({
  productId,
  variantId,
  product,
  variant,
  productType,
  channels,
  warehouses,
}: {
  channels: NonNullable<Channels["channels"]>;
  product: NonNullable<ProductDetail["product"]>;
  productId: string;
  productType: NonNullable<ProductTypeDetail["productType"]>;
  variant: NonNullable<ProductVariantDetail["productVariant"]>;
  variantId: string;
  warehouses: NonNullable<Warehouses["warehouses"]>["edges"][number]["node"][];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const variantCount = product.variants?.length ?? 0;
  const firstVariantId = product.variants?.[0]?.id ?? null;

  const selectionAttributes = useMemo(
    () =>
      productType.assignedVariantAttributes?.filter(
        (a) => a.variantSelection,
      ) ?? [],
    [productType.assignedVariantAttributes],
  );
  const nonSelectionAttributes = useMemo(
    () =>
      productType.assignedVariantAttributes?.filter(
        (a) => !a.variantSelection,
      ) ?? [],
    [productType.assignedVariantAttributes],
  );

  const defaultStocks = useMemo(() => {
    const byWarehouseId = new Map(
      (variant.stocks ?? []).map((s) => [s.warehouse.id, s]),
    );

    return Object.fromEntries(
      warehouses.map((w) => {
        const stock = byWarehouseId.get(w.id);

        return [
          w.id,
          {
            isAssigned: Boolean(stock),
            stockId: stock?.id,
            warehouseName: w.name,
            quantity: stock?.quantity?.toString() ?? "0",
            quantityAllocated: stock?.quantityAllocated?.toString() ?? "0",
          },
        ];
      }),
    );
  }, [variant.stocks, warehouses]);

  const defaultChannelListings = useMemo(() => {
    const byChannelId = new Map(
      (variant.channelListings ?? []).map((l) => [l.channel.id, l]),
    );

    return channels.map((ch) => {
      const listing = byChannelId.get(ch.id);

      return {
        listingId: listing?.id,
        channelId: ch.id,
        isAvailableForPurchase: Boolean(listing?.id),
        price: listing?.price?.amount?.toString() ?? "0.00",
        costPrice: listing?.costPrice?.amount?.toString() ?? "0.00",
        priorPrice: listing?.priorPrice?.amount?.toString() ?? "0.00",
        preorderThreshold: listing?.preorderThreshold?.quantity ?? undefined,
      };
    });
  }, [channels, variant.channelListings]);

  const form = useForm<VariantUpdateFormValues>({
    resolver: zodResolver(variantUpdateSchema),
    defaultValues: {
      name: variant.name ?? "",
      sku: variant.sku ?? "",
      trackInventory: variant.trackInventory ?? false,
      weight: {
        value: variant.weight?.value?.toString() ?? "0.00",
        unit: variant.weight?.unit ?? "KG",
      },
      attributes: defaultVariantAttributes(variant.assignedAttributes ?? []),
      channelListings: defaultChannelListings,
      stocks: defaultStocks,
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const attributesInput = buildBulkAttributeValueInputs(
        variant.assignedAttributes ?? [],
        values.attributes ?? {},
      );

      const channelListings = (values.channelListings ?? []).reduce<{
        create: Array<{
          channelId: string;
          costPrice?: number;
          preorderThreshold?: number;
          price: number;
          priorPrice?: number;
        }>;
        remove: string[];
        update: Array<{
          channelListing: string;
          costPrice?: number;
          preorderThreshold?: number;
          price?: number;
          priorPrice?: number;
        }>;
      }>(
        (acc, listing) => {
          const price = listing.price ? parseFloat(listing.price) : undefined;
          const costPrice = listing.costPrice
            ? parseFloat(listing.costPrice)
            : undefined;
          const priorPrice = listing.priorPrice
            ? parseFloat(listing.priorPrice)
            : undefined;

          if (listing.listingId) {
            if (listing.isAvailableForPurchase) {
              acc.update.push({
                channelListing: listing.listingId,
                price,
                costPrice,
                priorPrice,
                preorderThreshold: listing.preorderThreshold,
              });
            } else {
              acc.remove.push(listing.listingId);
            }
          } else if (listing.isAvailableForPurchase) {
            acc.create.push({
              channelId: listing.channelId,
              price: price ?? 0,
              costPrice,
              priorPrice,
              preorderThreshold: listing.preorderThreshold,
            });
          }

          return acc;
        },
        { create: [], update: [], remove: [] },
      );

      const stocksInput = Object.entries(values.stocks ?? {}).reduce<{
        create: Array<{ quantity: number; warehouse: string }>;
        remove: string[];
        update: Array<{ quantity: number; stock: string }>;
      }>(
        (acc, [warehouseId, stock]) => {
          const quantity = parseInt(stock.quantity ?? "0", 10) || 0;
          const isAssigned = Boolean(stock.isAssigned);

          if (stock.stockId) {
            if (isAssigned) {
              acc.update.push({ stock: stock.stockId, quantity });
            } else {
              acc.remove.push(stock.stockId);
            }
          } else if (isAssigned) {
            acc.create.push({ warehouse: warehouseId, quantity });
          }

          return acc;
        },
        { create: [], update: [], remove: [] },
      );

      const result = await productVariantBulkUpdate(
        {
          product: productId,
          variants: [
            {
              id: variantId,
              name: values.name,
              sku: values.sku || null,
              trackInventory: values.trackInventory,
              weight: parseFloat(values.weight?.value ?? "0") || 0,
              attributes: attributesInput,
              channelListings,
              stocks: stocksInput,
            },
          ],
        },
        productId,
        variantId,
      );

      if (!result.ok) {
        toast({
          title: "Failed to update variant",
          description: result.errors
            .map(
              (e: { message?: string | null }) => e.message || "Unknown error",
            )
            .join(", "),
          variant: "destructive",
        });

        return;
      }

      const topErrors = result.data.productVariantBulkUpdate?.errors ?? [];
      const rowErrors =
        result.data.productVariantBulkUpdate?.results?.[0]?.errors ?? [];
      const errors = [...topErrors, ...(rowErrors ?? [])].filter(Boolean);

      if (errors.length > 0) {
        toast({
          title: "Failed to update variant",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Variant updated",
        description: "Changes saved successfully.",
      });
      form.reset(values, { keepDirty: false });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update variant",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVariant(variantId, productId);

      if (!result.ok) {
        toast({
          title: "Failed to delete variant",
          description: result.errors
            .map((e) => e.message || "Unknown error")
            .join(", "),
          variant: "destructive",
        });

        return;
      }

      const data = result.data as unknown as ProductVariantDelete_Mutation;
      const errors = data?.productVariantDelete?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to delete variant",
          description:
            errors
              .map((e: { message?: string | null }) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      setShowDeleteDialog(false);
      toast({
        title: "Variant deleted",
        description: "The variant has been deleted successfully.",
      });

      router.replace(`/products/${encodeURIComponent(productId)}`);
    } catch (error) {
      toast({
        title: "Failed to delete variant",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
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
                <h1 className="text-2xl font-semibold">
                  {variant.name ?? product.name ?? "Variant"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      More actions
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/products/${encodeURIComponent(productId)}/variants/new`}
                      >
                        Add new variant
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setShowDeleteDialog(true)}
                    >
                      Delete variant
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Save{" "}
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </Button>
              </div>
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
              <Card id="variant-details-card" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Edit variant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <InputField
                      name="name"
                      label="Name"
                      inputProps={{ placeholder: "Variant name" }}
                    />

                    <div className="grid gap-2">
                      <Label htmlFor="weight.value">Weight (kg)</Label>
                      <Input
                        id="weight.value"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register("weight.value")}
                      />
                    </div>
                  </div>

                  <div className="border-t" />

                  <VariantChannelListingSection channels={channels} />

                  <div className="border-t" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Attributes</h3>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Selection Attributes
                      </h4>
                      {selectionAttributes.map(({ attribute }) => {
                        const inputType = attribute.inputType;
                        const fieldName = `attributes.${attribute.id}` as const;
                        const choices =
                          attribute.choices?.edges
                            ?.map((e) => e.node)
                            .filter(
                              (
                                n,
                              ): n is {
                                id: string;
                                name: string | null;
                                slug: string | null;
                              } => Boolean(n && "slug" in n),
                            )
                            .map((n) => ({
                              value: n.slug ?? "",
                              label: n.name ?? n.slug ?? "",
                            }))
                            .filter((o) => o.value) ?? [];

                        if (
                          inputType === ("BOOLEAN" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <CheckboxField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                            />
                          );
                        }

                        if (
                          inputType ===
                            ("DROPDOWN" as AttributeInputTypeEnum) ||
                          inputType === ("SWATCH" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <SelectField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                              options={choices}
                              placeholder="Select value"
                            />
                          );
                        }

                        if (
                          inputType ===
                          ("MULTISELECT" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <SelectField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                              options={choices}
                              isMulti
                              placeholder="Select values"
                              searchPlaceholder={`Search ${attribute.name ?? attribute.slug ?? "attribute"}`}
                            />
                          );
                        }

                        return (
                          <InputField
                            key={attribute.id}
                            name={fieldName}
                            label={
                              attribute.name ?? attribute.slug ?? "Attribute"
                            }
                          />
                        );
                      })}
                    </div>

                    <div className="border-t" />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Non-selection Attributes
                      </h4>
                      {nonSelectionAttributes.map(({ attribute }) => {
                        const inputType = attribute.inputType;
                        const fieldName = `attributes.${attribute.id}` as const;
                        const choices =
                          attribute.choices?.edges
                            ?.map((e) => e.node)
                            .filter(
                              (
                                n,
                              ): n is {
                                id: string;
                                name: string | null;
                                slug: string | null;
                              } => Boolean(n && "slug" in n),
                            )
                            .map((n) => ({
                              value: n.slug ?? "",
                              label: n.name ?? n.slug ?? "",
                            }))
                            .filter((o) => o.value) ?? [];

                        if (
                          inputType === ("BOOLEAN" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <CheckboxField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                            />
                          );
                        }

                        if (
                          inputType ===
                            ("DROPDOWN" as AttributeInputTypeEnum) ||
                          inputType === ("SWATCH" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <SelectField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                              options={choices}
                              placeholder="Select value"
                            />
                          );
                        }

                        if (
                          inputType ===
                          ("MULTISELECT" as AttributeInputTypeEnum)
                        ) {
                          return (
                            <SelectField
                              key={attribute.id}
                              name={fieldName}
                              label={
                                attribute.name ?? attribute.slug ?? "Attribute"
                              }
                              options={choices}
                              isMulti
                              placeholder="Select values"
                              searchPlaceholder={`Search ${attribute.name ?? attribute.slug ?? "attribute"}`}
                            />
                          );
                        }

                        return (
                          <InputField
                            key={attribute.id}
                            name={fieldName}
                            label={
                              attribute.name ?? attribute.slug ?? "Attribute"
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t" />

                  <VariantStocksSection />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the variant &ldquo;
              {variant.name || variant.sku || variantId}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete variant"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
