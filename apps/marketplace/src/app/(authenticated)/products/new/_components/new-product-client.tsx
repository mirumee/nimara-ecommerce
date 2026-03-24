"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  type FieldPath,
  FormProvider,
  useForm,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { useToast } from "@nimara/ui/hooks";
import {
  isEditorJsPayloadEffectivelyEmpty,
  toEditorJsPayloadJson,
} from "@nimara/ui/lib/richText";

import { EditorJsFormField } from "@/components/editor-js-form-field";
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
          richText: toEditorJsPayloadJson(String(value)),
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

function getErrorAtPath(errors: unknown, path: string): unknown {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }

    return (acc as Record<string, unknown>)[key];
  }, errors);
}

function validateRequiredAttributes(
  form: UseFormReturn<ProductCreateFormValues>,
  productAttributes: NonNullable<
    NonNullable<ProductTypeDetail["productType"]>["productAttributes"]
  >,
  t: (key: string) => string,
): boolean {
  const attributeValues: Record<string, unknown> =
    form.getValues("attributes") ?? {};

  let hasAttributeErrors = false;
  let firstMissingFieldName: FieldPath<ProductCreateFormValues> | null = null;

  form.clearErrors("attributes");

  for (const attribute of productAttributes) {
    if (!attribute.valueRequired) {
      continue;
    }

    const fieldName = `attributes.${attribute.id}`;
    const rawValue = attributeValues[attribute.id];
    const inputType = attribute.inputType;

    let isEmpty = false;

    switch (inputType) {
      case "BOOLEAN" as AttributeInputTypeEnum: {
        isEmpty = rawValue === undefined || rawValue === null;
        break;
      }
      case "MULTISELECT" as AttributeInputTypeEnum: {
        isEmpty = !Array.isArray(rawValue) || rawValue.length === 0;
        break;
      }
      default: {
        const normalized =
          rawValue === undefined || rawValue === null
            ? ""
            : String(rawValue).trim();

        isEmpty = normalized.length === 0;
        break;
      }
    }

    if (isEmpty) {
      hasAttributeErrors = true;

      const typedFieldName = fieldName as FieldPath<ProductCreateFormValues>;

      if (!firstMissingFieldName) {
        firstMissingFieldName = typedFieldName;
      }

      form.setError(typedFieldName, {
        type: "manual",
        message: t("common.required"),
      });
    }
  }

  if (firstMissingFieldName) {
    form.setFocus(firstMissingFieldName);
  }

  return hasAttributeErrors;
}

function AttributesSection({
  productAttributes,
}: {
  productAttributes: NonNullable<
    NonNullable<ProductTypeDetail["productType"]>["productAttributes"]
  >;
}) {
  const t = useTranslations();
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<ProductCreateFormValues>();

  if (!productAttributes?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("common.attributes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("marketplace.products.new.no-attributes")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.attributes")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productAttributes.map((attribute) => {
          const fieldName = `attributes.${attribute.id}` as const;
          const fieldError = getErrorAtPath(errors, fieldName) as
            | { message?: unknown }
            | undefined;

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
          const shouldShowInlineError =
            inputType !== ("BOOLEAN" as AttributeInputTypeEnum) &&
            inputType !== ("DROPDOWN" as AttributeInputTypeEnum) &&
            inputType !== ("SWATCH" as AttributeInputTypeEnum) &&
            inputType !== ("MULTISELECT" as AttributeInputTypeEnum);

          return (
            <div key={attribute.id} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <Label className="font-medium">
                  {attribute.name ??
                    attribute.slug ??
                    t("common.attribute-fallback")}
                  {attribute.valueRequired ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>
              </div>

              {inputType === ("BOOLEAN" as AttributeInputTypeEnum) ? (
                <CheckboxField name={fieldName} label={t("common.enabled")} />
              ) : inputType === ("DROPDOWN" as AttributeInputTypeEnum) ||
                inputType === ("SWATCH" as AttributeInputTypeEnum) ? (
                <SelectField
                  name={fieldName}
                  label={undefined}
                  options={choices}
                  placeholder={t("common.select-value")}
                />
              ) : inputType === ("MULTISELECT" as AttributeInputTypeEnum) ? (
                <SelectField
                  name={fieldName}
                  label={undefined}
                  options={choices}
                  isMulti
                  placeholder={t("common.select-values")}
                  searchPlaceholder={t(
                    "marketplace.products.new.search-attribute",
                    {
                      name:
                        attribute.name ??
                        attribute.slug ??
                        t("common.attribute-fallback"),
                    },
                  )}
                />
              ) : inputType === ("DATE" as AttributeInputTypeEnum) ? (
                <Input
                  type="date"
                  {...register(fieldName)}
                  className={cn(
                    fieldError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              ) : inputType === ("DATE_TIME" as AttributeInputTypeEnum) ? (
                <Input
                  type="datetime-local"
                  {...register(fieldName)}
                  className={cn(
                    fieldError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              ) : inputType === ("NUMERIC" as AttributeInputTypeEnum) ? (
                <Input
                  type="number"
                  step="0.01"
                  {...register(fieldName)}
                  className={cn(
                    fieldError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              ) : inputType === ("RICH_TEXT" as AttributeInputTypeEnum) ? (
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <EditorJsFormField
                      key={attribute.id}
                      initialJson={
                        typeof field.value === "string" ? field.value : ""
                      }
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      className={
                        fieldError
                          ? "ring-2 ring-destructive ring-offset-2"
                          : undefined
                      }
                      aria-label={
                        attribute.name ??
                        attribute.slug ??
                        t("common.attribute-fallback")
                      }
                    />
                  )}
                />
              ) : (
                <Input
                  {...register(fieldName)}
                  placeholder={t("common.value")}
                  className={cn(
                    fieldError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              )}

              {shouldShowInlineError && fieldError ? (
                <p className="text-sm text-destructive">
                  {String(fieldError.message ?? "")}
                </p>
              ) : null}

              {inputType === ("FILE" as AttributeInputTypeEnum) ? (
                <p className="text-xs text-muted-foreground">
                  {t("marketplace.products.new.file-attributes-unsupported")}
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
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  const [productTypeDetail, setProductTypeDetail] =
    useState<ProductTypeDetail | null>(null);
  const [isLoadingProductType, setIsLoadingProductType] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
            const productAttributes =
              result.data.productType.productAttributes ?? [];
            const defaultAttributeValues: Record<string, unknown> = {};

            for (const attribute of productAttributes) {
              if (
                attribute.inputType === ("BOOLEAN" as AttributeInputTypeEnum)
              ) {
                defaultAttributeValues[attribute.id] = false;
              }
            }

            // Reset attributes when product type changes and apply defaults
            form.setValue("attributes", defaultAttributeValues, {
              shouldDirty: false,
            });
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
          title: t("marketplace.products.new.toast-product-type-required"),
          description: t(
            "marketplace.products.new.toast-product-type-required-desc",
          ),
          variant: "destructive",
        });

        return;
      }

      const productAttributes =
        productTypeDetail?.productType?.productAttributes ?? [];

      if (
        productAttributes.length > 0 &&
        validateRequiredAttributes(form, productAttributes, t)
      ) {
        return;
      }

      const attributesInput = buildAttributeValueInputs(
        productAttributes,
        values.attributes,
      );

      const hasVariants = selectedProductType?.hasVariants ?? false;

      const result = await createProduct({
        input: {
          name: values.name,
          slug: values.slug || null,
          description: isEditorJsPayloadEffectivelyEmpty(values.description)
            ? null
            : toEditorJsPayloadJson(values.description ?? ""),
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
          .map(
            (e: { message?: string | null }) =>
              e.message || t("common.toast-unknown-error"),
          )
          .join(", ");

        toast({
          title: t("marketplace.products.new.toast-create-failed"),
          description: message,
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.productCreate?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: t("marketplace.products.new.toast-create-failed"),
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || t("common.toast-unknown-error"),
          variant: "destructive",
        });

        return;
      }

      const productId = result.data.productCreate?.product?.id;

      if (!productId) {
        toast({
          title: t("marketplace.products.new.toast-create-failed"),
          description: t("marketplace.products.new.toast-id-missing"),
          variant: "destructive",
        });

        return;
      }

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
            title: t("marketplace.products.new.toast-channel-listing-failed"),
            description: t(
              "marketplace.products.new.toast-channel-listing-failed-desc",
            ),
            variant: "destructive",
          });
          router.replace(`/products/${productId}`);

          return;
        }
      }

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
            .map(
              (e: { message?: string }) =>
                e.message ?? t("common.toast-unknown-error"),
            )
            .join(", ");

          toast({
            title: t("marketplace.products.new.toast-variant-create-failed"),
            description: msg,
            variant: "destructive",
          });
          router.replace(`/products/${productId}`);

          return;
        }
      }

      toast({
        title: t("marketplace.products.new.toast-created"),
        description: t("marketplace.products.new.toast-created-desc"),
      });

      setIsRedirecting(true);
      router.replace(`/products/${productId}`);
    } catch (error) {
      toast({
        title: t("marketplace.products.new.toast-create-failed"),
        description:
          error instanceof Error
            ? error.message
            : t("common.toast-unknown-error"),
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = isSubmitting || isRedirecting;
  const productAttributes =
    productTypeDetail?.productType?.productAttributes ?? [];

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="min-h-screen">
          <Dialog open={isLoading}>
            <DialogContent withCloseButton={false} className="w-full max-w-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <DialogTitle>
                    {t("marketplace.products.new.creating-dialog-title")}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {t("marketplace.products.new.creating-dialog-desc")}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {/* Sticky header bar */}
          <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    {t("marketplace.products.new.all-products")}
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                  {t("marketplace.products.new.title")}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {t("marketplace.products.new.create-button")}{" "}
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
                      <CardTitle>
                        {t("marketplace.products.new.product-information")}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                      <InputField
                        label={t("marketplace.products.new.product-name")}
                        name="name"
                      />
                      <div className="grid gap-2">
                        <Label>
                          {t("marketplace.products.new.product-description")}
                        </Label>
                        <Controller
                          name="description"
                          control={form.control}
                          render={({ field }) => (
                            <EditorJsFormField
                              initialJson={field.value ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              disabled={isSubmitting}
                              aria-label={t(
                                "marketplace.products.new.product-description",
                              )}
                            />
                          )}
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
                            <CardTitle>{t("common.shipping")}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="weight">
                                {t("common.weight")}
                              </Label>
                              <div className="relative">
                                <Input
                                  id="weight"
                                  type="number"
                                  step="0.01"
                                  placeholder={t("common.numeric-placeholder")}
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
                            <CardTitle>{t("common.inventory")}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-4">
                            <InputField
                              label={t("common.sku-label")}
                              name="sku"
                              inputProps={{
                                placeholder: t("common.sku-placeholder"),
                                disabled: isSubmitting,
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      {/* Pricing Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("common.pricing")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  {t("common.channel-name")}
                                </TableHead>
                                <TableHead className="w-56">
                                  {t("common.selling-price")}
                                </TableHead>
                                <TableHead className="w-56">
                                  {t("common.cost-price")}
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
                                          placeholder={t(
                                            "common.numeric-placeholder",
                                          )}
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
                                          placeholder={t(
                                            "common.numeric-placeholder",
                                          )}
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
                        <CardTitle>{t("common.attributes")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t("marketplace.products.new.loading-attributes")}
                        </p>
                      </CardContent>
                    </Card>
                  ) : productAttributes.length > 0 ? (
                    <AttributesSection productAttributes={productAttributes} />
                  ) : selectedProductTypeId ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("common.attributes")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t("marketplace.products.new.no-attributes-for-type")}
                        </p>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Search Engine Preview Section - at the bottom of left column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("marketplace.products.new.search-engine-preview")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <InputField
                        label={t("marketplace.products.new.seo-title")}
                        name="seo.title"
                      />
                      <InputField
                        label={t("marketplace.products.new.seo-description")}
                        name="seo.description"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex grow basis-1/3 flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("marketplace.products.new.organize-product")}
                      </CardTitle>
                      <CardDescription>
                        {t("marketplace.products.new.organize-product-desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <SelectField
                        name="productTypeId"
                        label={t("marketplace.products.new.product-type")}
                        options={productTypeOptions}
                        placeholder={t(
                          "marketplace.products.new.select-product-type",
                        )}
                      />
                      <SelectField
                        name="categoryId"
                        label={t("marketplace.products.new.product-category")}
                        options={categoryOptions}
                        placeholder={t(
                          "marketplace.products.new.select-category",
                        )}
                      />

                      <CollectionsField
                        name="collectionIds"
                        label={t(
                          "marketplace.products.new.product-collections",
                        )}
                        options={collectionOptions}
                        placeholder={t(
                          "marketplace.products.new.select-collections",
                        )}
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
