"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

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
import { SelectField } from "@/components/fields/select-field";
import { ProductViewNavigation } from "@/components/product-view-navigation";
import type {
  AttributeInputTypeEnum,
  AttributeValueInput,
  Channels,
  ProductDetail,
  ProductTypeDetail,
  Warehouses,
} from "@/graphql/generated/client";

import {
  createProductVariant,
  updateProductVariantChannelListing,
} from "../actions";
import { type VariantCreateFormValues, variantCreateSchema } from "../schema";
import { VariantChannelListingSection } from "./variant-channel-listing-section";
import { VariantStocksSection } from "./variant-stocks-section";

function buildVariantAttributeValueInputs(
  assignedVariantAttributes: NonNullable<
    NonNullable<ProductTypeDetail["productType"]>["assignedVariantAttributes"]
  >,
  attributeValues: Record<string, unknown>,
): AttributeValueInput[] {
  const inputs: AttributeValueInput[] = [];

  for (const assignedAttribute of assignedVariantAttributes) {
    const attribute = assignedAttribute.attribute;

    if (!attribute) {
      continue;
    }

    const attributeId = attribute.id;
    const inputType = attribute.inputType;
    const valueRequired = attribute.valueRequired ?? false;
    const value = attributeValues[attributeId];

    // Skip if value is missing and attribute is not required
    if ((value === undefined || value === null) && !valueRequired) {
      continue;
    }

    // For required attributes without values, skip - validation will catch this
    if (valueRequired && (value === undefined || value === null)) {
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

interface NewVariantClientProps {
  channels: NonNullable<Channels["channels"]>;
  firstVariantId?: string | null;
  product: NonNullable<ProductDetail["product"]>;
  productId: string;
  productType: NonNullable<ProductTypeDetail["productType"]>;
  variantCount: number;
  warehouses: NonNullable<Warehouses["warehouses"]>["edges"][number]["node"][];
}

export function NewVariantClient({
  productId,
  product,
  productType,
  channels,
  warehouses,
  variantCount,
  firstVariantId,
}: NewVariantClientProps) {
  const router = useRouter();
  const { toast } = useToast();

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
    return Object.fromEntries(
      warehouses.map((w) => [
        w.id,
        {
          isAssigned: false,
          warehouseName: w.name,
          quantity: "0",
        },
      ]),
    );
  }, [warehouses]);

  const defaultChannelListings = useMemo(() => {
    return channels.map((ch) => ({
      channelId: ch.id,
      isAvailableForPurchase: false,
      price: "0.00",
      costPrice: "0.00",
      priorPrice: "0.00",
    }));
  }, [channels]);

  const form = useForm<VariantCreateFormValues>({
    resolver: zodResolver(
      variantCreateSchema,
    ) as Resolver<VariantCreateFormValues>,
    defaultValues: {
      name: product.name ?? "",
      sku: "",
      trackInventory: false,
      weight: {
        value: "0.00",
        unit: "KG",
      },
      attributes: {},
      channelListings: defaultChannelListings,
      stocks: defaultStocks,
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Validate required attributes before submitting
      const requiredAttributes = (productType.assignedVariantAttributes ?? [])
        .filter((assignedAttr) => assignedAttr.attribute?.valueRequired)
        .map((assignedAttr) => assignedAttr.attribute)
        .filter(Boolean);

      const missingRequiredAttributes = requiredAttributes.filter(
        (attr) =>
          !attr ||
          values.attributes?.[attr.id] === undefined ||
          values.attributes?.[attr.id] === null ||
          (typeof values.attributes?.[attr.id] === "string" &&
            !String(values.attributes[attr.id]).trim()) ||
          (Array.isArray(values.attributes?.[attr.id]) &&
            (values.attributes[attr.id] as unknown[]).length === 0),
      );

      if (missingRequiredAttributes.length > 0) {
        toast({
          title: "Required attributes missing",
          description: `Please provide values for: ${missingRequiredAttributes
            .map((a) => a?.name)
            .filter(Boolean)
            .join(", ")}`,
          variant: "destructive",
        });

        return;
      }

      const attributesInput = buildVariantAttributeValueInputs(
        productType.assignedVariantAttributes ?? [],
        values.attributes ?? {},
      );

      const stocksInput = Object.entries(values.stocks ?? {})
        .filter(([_, stock]) => stock.isAssigned)
        .map(([warehouseId, stock]) => ({
          warehouse: warehouseId,
          quantity: parseInt(stock.quantity ?? "0", 10) || 0,
        }));

      const weightValue = parseFloat(values.weight?.value ?? "0") || 0;
      const weightUnit = values.weight?.unit ?? "KG";

      const result = await createProductVariant(
        {
          input: {
            product: productId,
            name: values.name,
            sku: values.sku || undefined,
            trackInventory: values.trackInventory,
            weight:
              weightValue > 0
                ? { value: weightValue, unit: weightUnit }
                : undefined,
            attributes: attributesInput,
            stocks: stocksInput.length > 0 ? stocksInput : undefined,
          },
        },
        productId,
      );

      if (!result.ok) {
        const errorMessages =
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
            ? result.errors
                .map(
                  (e: { code?: string; message?: string | null }) =>
                    e.code || e.message || "Unknown error",
                )
                .join(", ")
            : result.errors && typeof result.errors === "object"
              ? JSON.stringify(result.errors)
              : "Unexpected HTTP error";

        toast({
          title: "Failed to create variant",
          description: errorMessages,
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.productVariantCreate?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to create variant",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      const variantId = result.data.productVariantCreate?.productVariant?.id;

      if (!variantId) {
        toast({
          title: "Failed to create variant",
          description: "Variant was created but ID is missing.",
          variant: "destructive",
        });

        return;
      }

      // Update channel listings (include all channels so pricing is never discarded)
      const channelListingsInput = (values.channelListings ?? []).map(
        (listing) => {
          const price = listing.price ? parseFloat(listing.price) : undefined;
          const costPrice = listing.costPrice
            ? parseFloat(listing.costPrice)
            : undefined;
          const priorPrice = listing.priorPrice
            ? parseFloat(listing.priorPrice)
            : undefined;

          return {
            channelId: listing.channelId,
            price: price ?? 0,
            costPrice,
            priorPrice,
            preorderThreshold: listing.preorderThreshold,
          };
        },
      );

      if (channelListingsInput.length > 0) {
        const channelListingResult = await updateProductVariantChannelListing(
          {
            id: variantId,
            input: channelListingsInput,
          },
          productId,
          variantId,
        );

        if (!channelListingResult.ok) {
          toast({
            title: "Variant created, but channel listing update failed",
            description: channelListingResult.errors
              .map(
                (e: { message?: string | null }) =>
                  e.message || "Unknown error",
              )
              .join(", "),
            variant: "destructive",
          });
          router.replace(`/products/${productId}/variants/${variantId}`);

          return;
        }

        const channelErrors =
          channelListingResult.data.productVariantChannelListingUpdate
            ?.errors ?? [];

        if (channelErrors.length > 0) {
          toast({
            title: "Variant created, but channel listing update failed",
            description:
              channelErrors
                .map((e) => e.message)
                .filter(Boolean)
                .join(", ") || "Unknown error",
            variant: "destructive",
          });
          router.replace(`/products/${productId}/variants/${variantId}`);

          return;
        }
      }

      toast({
        title: "Variant created",
        description: "Variant has been created successfully.",
      });

      router.replace(`/products/${productId}/variants/${variantId}`);
    } catch (error) {
      console.error("Unexpected error while creating variant:", error);

      toast({
        title: "Failed to create variant",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please check the console for details.",
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

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
                <h1 className="text-2xl font-semibold">Add New Variant</h1>
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                Save{" "}
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
              </Button>
            </div>
          </div>

          {/* Main content: offset below sticky bar */}
          <div className="mt-20">
            <div className="mb-4 px-6">
              <ProductViewNavigation
                productId={productId}
                variantCount={variantCount}
                firstVariantId={firstVariantId}
              />
            </div>
            <div className="flex flex-col gap-4 px-6 pb-6">
              <Card id="variant-details-card" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Variant Details</CardTitle>
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
    </FormProvider>
  );
}
