"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { InputField } from "@/components/fields/input-field";
import { SelectField, type SelectOption } from "@/components/fields/select-field";
import { ProductViewNavigation } from "@/components/product-view-navigation";
import type {
  AttributeInputTypeEnum,
  BulkAttributeValueInput,
  Channels,
  ProductDetail,
  ProductTypeDetail,
  ProductVariantDetail,
  Warehouses,
} from "@/graphql/generated/client";

import { productVariantBulkUpdate } from "../actions";
import { variantUpdateSchema, type VariantUpdateFormValues } from "../schema";
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
              if (typeof v === "string") return v;
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
  productId: string;
  variantId: string;
  product: NonNullable<ProductDetail["product"]>;
  variant: NonNullable<ProductVariantDetail["productVariant"]>;
  productType: NonNullable<ProductTypeDetail["productType"]>;
  channels: NonNullable<Channels["channels"]>;
  warehouses: NonNullable<Warehouses["warehouses"]>["edges"][number]["node"][];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const variantCount = product.variants?.length ?? 0;
  const firstVariantId = product.variants?.[0]?.id ?? null;

  const selectionAttributes = useMemo(
    () =>
      productType.assignedVariantAttributes?.filter((a) => a.variantSelection) ??
      [],
    [productType.assignedVariantAttributes],
  );
  const nonSelectionAttributes = useMemo(
    () =>
      productType.assignedVariantAttributes?.filter((a) => !a.variantSelection) ??
      [],
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
          price: number;
          costPrice?: number;
          priorPrice?: number;
          preorderThreshold?: number;
        }>;
        update: Array<{
          channelListing: string;
          price?: number;
          costPrice?: number;
          priorPrice?: number;
          preorderThreshold?: number;
        }>;
        remove: string[];
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
        create: Array<{ warehouse: string; quantity: number }>;
        update: Array<{ stock: string; quantity: number }>;
        remove: string[];
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
            .map((e: { message?: string | null }) => e.message || "Unknown error")
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

      toast({ title: "Variant updated", description: "Changes saved successfully." });
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

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="grid w-full gap-4">
        <div className="flex flex-col gap-4">
          <Button asChild className="self-start" type="button" variant="ghost">
            <Link href={`/products/${encodeURIComponent(productId)}`}>
              Back to product
            </Link>
          </Button>

          <ProductViewNavigation
            productId={productId}
            variantCount={variantCount}
            firstVariantId={firstVariantId}
          />

          <Card>
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
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Selection Attributes
                  </h4>
                  {selectionAttributes.map(({ attribute }) => {
                    const inputType = attribute.inputType;
                    const fieldName = `attributes.${attribute.id}` as const;
                    const choices =
                      attribute.choices?.edges
                        ?.map((e) => e.node)
                        .filter(
                          (n): n is { name: string | null; slug: string | null } =>
                            Boolean(n && "slug" in n),
                        )
                        .map((n) => ({
                          value: n.slug ?? "",
                          label: n.name ?? n.slug ?? "",
                        }))
                        .filter((o) => o.value) ?? [];

                    if (inputType === ("BOOLEAN" as AttributeInputTypeEnum)) {
                      return (
                        <CheckboxField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
                        />
                      );
                    }

                    if (
                      inputType === ("DROPDOWN" as AttributeInputTypeEnum) ||
                      inputType === ("SWATCH" as AttributeInputTypeEnum)
                    ) {
                      return (
                        <SelectField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
                          options={choices}
                          placeholder="Select value"
                        />
                      );
                    }

                    if (inputType === ("MULTISELECT" as AttributeInputTypeEnum)) {
                      return (
                        <SelectField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
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
                        label={attribute.name ?? attribute.slug ?? "Attribute"}
                      />
                    );
                  })}
                </div>

                <div className="border-t" />

                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Non-selection Attributes
                  </h4>
                  {nonSelectionAttributes.map(({ attribute }) => {
                    const inputType = attribute.inputType;
                    const fieldName = `attributes.${attribute.id}` as const;
                    const choices =
                      attribute.choices?.edges
                        ?.map((e) => e.node)
                        .filter(
                          (n): n is { name: string | null; slug: string | null } =>
                            Boolean(n && "slug" in n),
                        )
                        .map((n) => ({
                          value: n.slug ?? "",
                          label: n.name ?? n.slug ?? "",
                        }))
                        .filter((o) => o.value) ?? [];

                    if (inputType === ("BOOLEAN" as AttributeInputTypeEnum)) {
                      return (
                        <CheckboxField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
                        />
                      );
                    }

                    if (
                      inputType === ("DROPDOWN" as AttributeInputTypeEnum) ||
                      inputType === ("SWATCH" as AttributeInputTypeEnum)
                    ) {
                      return (
                        <SelectField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
                          options={choices}
                          placeholder="Select value"
                        />
                      );
                    }

                    if (inputType === ("MULTISELECT" as AttributeInputTypeEnum)) {
                      return (
                        <SelectField
                          key={attribute.id}
                          name={fieldName}
                          label={attribute.name ?? attribute.slug ?? "Attribute"}
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
                        label={attribute.name ?? attribute.slug ?? "Attribute"}
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

        <Card className="sticky bottom-0 z-10">
          <CardHeader className="flex flex-row flex-wrap justify-between gap-4">
            <Button type="button" variant="destructive" disabled className="m-0">
              Delete variant
            </Button>

            <span className="flex flex-row justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push(`/products/${encodeURIComponent(productId)}`)}
              >
                Discard
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                Save{" "}
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              </Button>
            </span>
          </CardHeader>
        </Card>
      </form>
    </FormProvider>
  );
}

