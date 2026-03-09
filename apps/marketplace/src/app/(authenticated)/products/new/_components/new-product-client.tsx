"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { CollectionsField } from "@/components/fields/collections-field";
import { InputField } from "@/components/fields/input-field";
import {
  SelectField,
  type SelectOption,
} from "@/components/fields/select-field";
import { ChannelAvailabilitySection } from "@/components/product-availability-section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  AttributeInputTypeEnum,
  AttributeValueInput,
  Channels,
  ProductChannelListingAddInput,
  ProductTypeDetail,
} from "@/graphql/generated/client";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import { cn } from "@/lib/utils";

import {
  createDefaultVariantAfterProductCreate,
  createProduct,
  getProductTypeDetail,
  updateProductChannelListing,
} from "../actions";
import { type ProductCreateFormValues, productCreateSchema } from "../schema";

type Props = {
  categories: Array<{ id: string; name: string; slug: string }>;
  channels: NonNullable<Channels["channels"]>;
  collections: Array<{
    id: string;
    metadata: Array<{ key: string; value: string }>;
    name: string;
    slug: string;
  }>;
  productTypes: Array<{
    hasVariants: boolean;
    id: string;
    name: string;
    slug: string;
  }>;
};

function toEditorJsJSONString(plainText: string): string {
  const blocks = plainText
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", data: { text } }));

  return JSON.stringify({
    time: Date.now(),
    blocks,
    version: "2.28.2",
  });
}

function buildAttributeValueInputs(
  productAttributes: NonNullable<
    NonNullable<ProductTypeDetail["productType"]>["productAttributes"]
  >,
  attributeValues: Record<string, unknown>,
): AttributeValueInput[] {
  const inputs: AttributeValueInput[] = [];

  for (const attribute of productAttributes) {
    const attributeId = attribute.id;
    const inputType = attribute.inputType;
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
        inputs.push({
          id: attributeId,
          richText: toEditorJsJSONString(String(value)),
        });
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
        // Unsupported attribute type for now (REFERENCE, FILE, etc.)
        break;
      }
    }
  }

  return inputs;
}

function AttributesSection({
  productAttributes,
}: {
  productAttributes: NonNullable<
    NonNullable<ProductTypeDetail["productType"]>["productAttributes"]
  >;
}) {
  const { register } = useFormContext<ProductCreateFormValues>();

  if (!productAttributes?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No attributes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attributes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productAttributes.map((attribute) => {
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

          const inputType = attribute.inputType;

          return (
            <div key={attribute.id} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <Label className="font-medium">
                  {attribute.name ?? attribute.slug ?? "Attribute"}
                  {attribute.valueRequired ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>
              </div>

              {inputType === ("BOOLEAN" as AttributeInputTypeEnum) ? (
                <CheckboxField name={fieldName} label="Enabled" />
              ) : inputType === ("DROPDOWN" as AttributeInputTypeEnum) ||
                inputType === ("SWATCH" as AttributeInputTypeEnum) ? (
                <SelectField
                  name={fieldName}
                  label={undefined}
                  options={choices}
                  placeholder="Select value"
                />
              ) : inputType === ("MULTISELECT" as AttributeInputTypeEnum) ? (
                <SelectField
                  name={fieldName}
                  label={undefined}
                  options={choices}
                  isMulti
                  placeholder="Select values"
                  searchPlaceholder={`Search ${attribute.name ?? attribute.slug ?? "attribute"}`}
                />
              ) : inputType === ("DATE" as AttributeInputTypeEnum) ? (
                <Input type="date" {...register(fieldName)} />
              ) : inputType === ("DATE_TIME" as AttributeInputTypeEnum) ? (
                <Input type="datetime-local" {...register(fieldName)} />
              ) : inputType === ("NUMERIC" as AttributeInputTypeEnum) ? (
                <Input type="number" step="0.01" {...register(fieldName)} />
              ) : inputType === ("RICH_TEXT" as AttributeInputTypeEnum) ? (
                <Textarea
                  {...register(fieldName)}
                  placeholder="Plain text will be converted to EditorJS JSON on save."
                />
              ) : (
                <Input {...register(fieldName)} placeholder="Value" />
              )}

              {inputType === ("FILE" as AttributeInputTypeEnum) ? (
                <p className="text-xs text-muted-foreground">
                  File attributes are not supported during creation.
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function NewProductClient({
  channels,
  categories,
  collections,
  productTypes,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [productTypeDetail, setProductTypeDetail] =
    useState<ProductTypeDetail | null>(null);
  const [isLoadingProductType, setIsLoadingProductType] = useState(false);

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      categories
        .map((c) => ({ value: c.id, label: c.name || c.slug }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );

  const productTypeOptions: SelectOption[] = useMemo(
    () =>
      productTypes
        .map((pt) => ({ value: pt.id, label: pt.name || pt.slug }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [productTypes],
  );

  const collectionOptions = useMemo(
    () =>
      collections
        .map((c) => ({ value: c.id, label: c.name || c.slug }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [collections],
  );

  const defaultCollectionIds = useMemo(() => {
    // Find the vendor's default collection (created during sign-up)
    const defaultCollection = collections.find((c) =>
      c.metadata?.some(
        (m) =>
          m.key === METADATA_KEYS.VENDOR_DEFAULT_COLLECTION &&
          m.value === "true",
      ),
    );

    if (defaultCollection) {
      return [
        {
          value: defaultCollection.id,
          label: defaultCollection.name || defaultCollection.slug,
        },
      ];
    }

    return [];
  }, [collections]);

  // Start empty: channels are added only when user selects them in Manage channels modal
  const defaultChannelAvailability = useMemo(() => ({}), []);

  const defaultChannelListings = useMemo(() => {
    return channels.map((ch) => ({
      channelId: ch.id,
      price: "",
      costPrice: "",
    }));
  }, [channels]);

  const form = useForm<ProductCreateFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productCreateSchema as any),
    defaultValues: {
      name: "",
      description: "",
      seo: {
        title: "",
        description: "",
      },
      media: [],
      productTypeId: "",
      categoryId: "",
      collectionIds: defaultCollectionIds,
      channelAvailability: defaultChannelAvailability,
      attributes: {},
      weight: { value: "0.00", unit: "KG" },
      channelListings: defaultChannelListings,
      sku: "",
      taxClassId: "",
    },
    mode: "onChange",
  });

  // Watch productTypeId for reactivity (must be after form initialization)
  const selectedProductTypeId = form.watch("productTypeId");

  // Get hasVariants from productTypes list (faster than fetching detail)
  const selectedProductType = useMemo(() => {
    if (!selectedProductTypeId) {
      return null;
    }

    return productTypes.find((pt) => pt.id === selectedProductTypeId) ?? null;
  }, [selectedProductTypeId, productTypes]);

  const hasVariants = selectedProductType?.hasVariants ?? false;
  const isProductTypeSelected = Boolean(selectedProductTypeId);

  // Fetch product type details when product type is selected (for attributes)
  useEffect(() => {
    if (selectedProductTypeId) {
      setIsLoadingProductType(true);

      getProductTypeDetail({ id: selectedProductTypeId })
        .then((result) => {
          if (result.ok && result.data.productType) {
            setProductTypeDetail(result.data);
            // Reset attributes when product type changes
            form.setValue("attributes", {});
          } else {
            // Silently fail - we already have hasVariants from the list
            // Only show error if we really need the detail
            console.warn("Failed to load product type detail:", result.errors);
          }
        })
        .catch((error) => {
          // Silently fail - we already have hasVariants from the list
          console.warn("Error loading product type detail:", error);
        })
        .finally(() => {
          setIsLoadingProductType(false);
        });
    } else {
      setProductTypeDetail(null);
      form.setValue("attributes", {});
    }
  }, [selectedProductTypeId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (!values.productTypeId) {
        toast({
          title: "Product type required",
          description: "Please select a product type.",
          variant: "destructive",
        });

        return;
      }

      const productAttributes =
        productTypeDetail?.productType?.productAttributes ?? [];
      const attributesInput = buildAttributeValueInputs(
        productAttributes,
        values.attributes,
      );

      const hasVariants = selectedProductType?.hasVariants ?? false;

      const result = await createProduct({
        input: {
          name: values.name,
          slug: values.slug || null,
          description: values.description
            ? toEditorJsJSONString(values.description)
            : null,
          seo: {
            title: values.seo.title || null,
            description: values.seo.description || null,
          },
          productType: values.productTypeId,
          category: values.categoryId || null,
          collections: (values.collectionIds ?? []).map((c) => c.value),
          attributes: attributesInput,
          // Only include weight and taxClass for products without variants
          ...(!hasVariants && {
            weight:
              values.weight?.value && parseFloat(values.weight.value) > 0
                ? {
                    value: parseFloat(values.weight.value),
                    unit: values.weight.unit || "KG",
                  }
                : null,
            taxClass: values.taxClassId || null,
          }),
        },
      });

      if (!result.ok) {
        const message = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to create product",
          description: message,
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.productCreate?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to create product",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      const productId = result.data.productCreate?.product?.id;

      if (!productId) {
        toast({
          title: "Failed to create product",
          description: "Product was created but ID is missing.",
          variant: "destructive",
        });

        return;
      }

      // Persist channel selection for all products: every channel selected in
      // Manage channels modal is saved (published or not). Product must be in
      // channels before variant channel listings can be set (when !hasVariants).
      const updateChannels: ProductChannelListingAddInput[] = [];

      for (const channel of channels) {
        const config = values.channelAvailability?.[channel.id];

        if (config === undefined) {
          continue;
        }

        updateChannels.push({
          channelId: channel.id,
          isPublished: config.isPublished ?? false,
          isAvailableForPurchase: config.isAvailableForPurchase ?? false,
          visibleInListings: config.visibleInListings ?? false,
        });
      }

      if (updateChannels.length > 0) {
        const channelListingResult = await updateProductChannelListing(
          {
            id: productId,
            input: {
              updateChannels,
              removeChannels: [],
            },
          },
          productId,
        );

        if (!channelListingResult.ok) {
          toast({
            title: "Product created, but channel listing update failed",
            description: "Please update channel availability manually.",
            variant: "destructive",
          });
          router.replace(`/products/${productId}`);

          return;
        }
      }

      // When product type hasVariants is false: create default variant and set
      // its channel listings (same order as Saleor dashboard).
      if (!hasVariants) {
        const variantResult = await createDefaultVariantAfterProductCreate(
          productId,
          {
            productName: values.name,
            sku: values.sku?.trim() || undefined,
            weight:
              values.weight?.value && parseFloat(values.weight.value) > 0
                ? {
                    value: parseFloat(values.weight.value),
                    unit: values.weight.unit || "KG",
                  }
                : null,
            channelListings: values.channelListings ?? [],
            channelAvailability: values.channelAvailability ?? {},
          },
        );

        if (!variantResult.ok) {
          const msg = variantResult.errors
            .map((e: { message?: string }) => e.message ?? "Unknown error")
            .join(", ");

          toast({
            title: "Product created, but variant create failed",
            description: msg,
            variant: "destructive",
          });
          router.replace(`/products/${productId}`);

          return;
        }
      }

      toast({
        title: "Product created",
        description: "Product has been created successfully.",
      });

      router.replace(`/products/${productId}`);
    } catch (error) {
      toast({
        title: "Failed to create product",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const productAttributes =
    productTypeDetail?.productType?.productAttributes ?? [];

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="min-h-screen">
          {/* Sticky header bar */}
          <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    All products
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">Add New Product</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Create Product{" "}
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </Button>
              </div>
            </div>
          </div>

          {/* Main content: offset below sticky bar */}
          <div className="mx-auto mt-20 px-6 pb-6">
            <div className="grid w-full gap-4">
              <div className="flex w-full gap-4">
                <div className="flex grow basis-2/3 flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                      <InputField label="Product Name" name="name" />
                      <div className="grid gap-2">
                        <Label>Product Description</Label>
                        <Textarea
                          {...form.register("description")}
                          placeholder="Enter product description"
                          disabled={isSubmitting}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {isProductTypeSelected && !hasVariants && (
                    <>
                      {/* Shipping and Inventory Sections - Side by Side */}
                      <div className="flex gap-4">
                        {/* Shipping Section */}
                        <Card className="flex-1">
                          <CardHeader>
                            <CardTitle>Shipping</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="weight">Weight</Label>
                              <div className="relative">
                                <Input
                                  id="weight"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...form.register("weight.value")}
                                  disabled={isSubmitting}
                                  className="pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  KG
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Inventory Section */}
                        <Card className="flex-1">
                          <CardHeader>
                            <CardTitle>Inventory</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-4">
                            <InputField
                              label="SKU (Stock Keeping Unit)"
                              name="sku"
                              inputProps={{
                                placeholder: "Enter SKU",
                                disabled: isSubmitting,
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      {/* Pricing Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Channel Name</TableHead>
                                <TableHead className="w-56">
                                  Selling Price
                                </TableHead>
                                <TableHead className="w-56">
                                  Cost Price
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {channels.map((channel, index) => {
                                const available =
                                  form.watch(
                                    `channelAvailability.${channel.id}.isPublished`,
                                  ) ?? false;

                                return (
                                  <TableRow key={channel.id}>
                                    <TableCell className="font-medium">
                                      {channel.name}
                                    </TableCell>
                                    <TableCell>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          disabled={!available || isSubmitting}
                                          {...form.register(
                                            `channelListings.${index}.price`,
                                          )}
                                          className={cn(
                                            "pr-12",
                                            (!available || isSubmitting) &&
                                              "opacity-50",
                                          )}
                                          aria-label={`${channel.name} selling price`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                          {channel.currencyCode}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          disabled={!available || isSubmitting}
                                          {...form.register(
                                            `channelListings.${index}.costPrice`,
                                          )}
                                          className={cn(
                                            "pr-12",
                                            (!available || isSubmitting) &&
                                              "opacity-50",
                                          )}
                                          aria-label={`${channel.name} cost price`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                          {channel.currencyCode}
                                        </span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {isLoadingProductType ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Attributes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Loading attributes...
                        </p>
                      </CardContent>
                    </Card>
                  ) : productAttributes.length > 0 ? (
                    <AttributesSection productAttributes={productAttributes} />
                  ) : selectedProductTypeId ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Attributes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          No attributes for this product type
                        </p>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Search Engine Preview Section - at the bottom of left column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Engine Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <InputField label="SEO Title" name="seo.title" />
                      <InputField
                        label="SEO Description"
                        name="seo.description"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex grow basis-1/3 flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organize product</CardTitle>
                      <CardDescription>
                        Select categories, collections, and product type.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <SelectField
                        name="productTypeId"
                        label="Product Type"
                        options={productTypeOptions}
                        placeholder="Select product type"
                      />
                      <SelectField
                        name="categoryId"
                        label="Product Category"
                        options={categoryOptions}
                        placeholder="Select category"
                      />

                      <CollectionsField
                        name="collectionIds"
                        label="Product Collections"
                        options={collectionOptions}
                        placeholder="Select collections"
                      />
                    </CardContent>
                  </Card>

                  <ChannelAvailabilitySection
                    channels={channels}
                    disabledReason={
                      !isProductTypeSelected
                        ? "no-product-type"
                        : hasVariants
                          ? "has-variants"
                          : null
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
