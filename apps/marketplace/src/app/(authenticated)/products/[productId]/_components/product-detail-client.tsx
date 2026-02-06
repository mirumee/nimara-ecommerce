"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";

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
import { SelectField, type SelectOption } from "@/components/fields/select-field";
import { Textarea } from "@/components/ui/textarea";
import type {
  AttributeInputTypeEnum,
  AttributeValueInput,
  Channels,
  ProductChannelListingAddInput,
  ProductDetail,
} from "@/graphql/generated/client";

import {
  productMediaCreate,
  productMediaDelete,
  updateProduct,
  updateProductChannelListing,
} from "../actions";
import { productUpdateSchema, type ProductUpdateFormValues } from "../schema";

type Props = {
  channels: NonNullable<Channels["channels"]>;
  categories: Array<{ id: string; name: string; slug: string }>;
  collections: Array<{ id: string; name: string; slug: string }>;
  product: NonNullable<ProductDetail["product"]>;
  productId: string;
  productTypes: Array<{ hasVariants: boolean; id: string; name: string; slug: string }>;
};

type MediaDraftItem = { id: string; url: string };

function normalizeMaybeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    return new URL(raw).toString();
  } catch {
    try {
      return new URL(`https://${raw}`).toString();
    } catch {
      return null;
    }
  }
}

function tryExtractEditorJsPlainText(value?: string | null): string {
  if (!value) {
    return "";
  }

  try {
    const parsed = JSON.parse(value) as {
      blocks?: Array<{ type?: string; data?: { text?: string } }>;
    };

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.blocks)) {
      return value;
    }

    return parsed.blocks
      .map((b) => (b?.data?.text ? String(b.data.text) : ""))
      .filter((t) => t.trim().length > 0)
      .join("\n\n");
  } catch {
    return value;
  }
}

function toEditorJsJSONString(plainText: string): string {
  const blocks = plainText
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({
      type: "paragraph",
      data: { text },
    }));

  return JSON.stringify({
    time: Date.now(),
    blocks,
    version: "2.28.2",
  });
}

function buildAttributeValueInputs(
  assignedAttributes: NonNullable<
    NonNullable<ProductDetail["product"]>["assignedAttributes"]
  >,
  attributeValues: Record<string, unknown>,
): AttributeValueInput[] {
  const inputs: AttributeValueInput[] = [];

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
        // Unsupported attribute type for now (REFERENCE, FILE, etc.)
        break;
      }
    }
  }

  return inputs;
}

function AttributesSection({
  assignedAttributes,
}: {
  assignedAttributes: NonNullable<
    NonNullable<ProductDetail["product"]>["assignedAttributes"]
  >;
}) {
  const { register } = useFormContext<ProductUpdateFormValues>();

  if (!assignedAttributes?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No attributes</p>
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
        {assignedAttributes.map((assigned) => {
          const attribute = assigned.attribute;
          const fieldName = `attributes.${attribute.id}` as const;

          const choices =
            attribute.choices?.edges
              ?.map((e) => e.node)
              .filter(
                (n): n is { id: string; name: string | null; slug: string | null } =>
                  Boolean(n && "slug" in n),
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

              {attribute.valueRequired ? (
                <p className="text-muted-foreground text-xs">Required</p>
              ) : null}

              {inputType === ("FILE" as AttributeInputTypeEnum) ? (
                <p className="text-muted-foreground text-xs">
                  File attributes are read-only here.
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AvailabilitySection({ channels }: { channels: Props["channels"] }) {
  const { watch, setValue } = useFormContext<ProductUpdateFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map((channel) => {
          const published = watch(`channelAvailability.${channel.id}.isPublished`);

          return (
            <div key={channel.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium">{channel.name}</div>
                <div className="text-muted-foreground text-xs">
                  {channel.currencyCode}
                </div>
              </div>

              <div className="grid gap-3">
                <CheckboxField
                  name={`channelAvailability.${channel.id}.isPublished`}
                  label="Published"
                />
                <CheckboxField
                  name={`channelAvailability.${channel.id}.isAvailableForPurchase`}
                  label="Available for purchase"
                  disabled={!published}
                />
                <CheckboxField
                  name={`channelAvailability.${channel.id}.visibleInListings`}
                  label="Visible in listings"
                  disabled={!published}
                />
              </div>

              {!published ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 text-muted-foreground"
                  onClick={() => {
                    setValue(
                      `channelAvailability.${channel.id}.isAvailableForPurchase`,
                      false,
                    );
                    setValue(
                      `channelAvailability.${channel.id}.visibleInListings`,
                      false,
                    );
                  }}
                >
                  Clear purchase/listing flags
                </Button>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ProductDetailClient({
  productId,
  product,
  channels,
  categories,
  collections,
  productTypes,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [mediaDraft, setMediaDraft] = useState<MediaDraftItem[]>(
    (product.media ?? []).map((m) => ({ id: m.id, url: m.url })),
  );
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [pendingMediaUrl, setPendingMediaUrl] = useState("");

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

  const defaultChannelAvailability = useMemo(() => {
    const byChannelId = new Map(
      product.channelListings?.map((l) => [l.channel.id, l]) ?? [],
    );

    return Object.fromEntries(
      channels.map((ch) => {
        const listing = byChannelId.get(ch.id);
        return [
          ch.id,
          {
            isPublished: listing?.isPublished ?? false,
            isAvailableForPurchase: listing?.isAvailableForPurchase ?? false,
            visibleInListings: listing?.visibleInListings ?? false,
          },
        ];
      }),
    );
  }, [channels, product.channelListings]);

  const defaultAttributes = useMemo(() => {
    const values: Record<string, unknown> = {};

    for (const assigned of product.assignedAttributes ?? []) {
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
  }, [product.assignedAttributes]);

  const form = useForm<ProductUpdateFormValues>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      name: product.name ?? "",
      slug: product.slug ?? "",
      description: tryExtractEditorJsPlainText(product.description),
      seo: {
        title: product.seoTitle ?? "",
        description: product.seoDescription ?? "",
      },
      media: [],
      productTypeId: product.productType?.id ?? "",
      categoryId: product.category?.id ?? "",
      collectionIds:
        product.collections?.map((c) => ({
          value: c.id,
          label: c.name ?? c.id,
        })) ?? [],
      channelAvailability: defaultChannelAvailability,
      attributes: defaultAttributes,
    },
    mode: "onChange",
  });

  // Media editing is handled via Saleor `productMedia*` mutations (URL-based).

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const assignedAttributes = product.assignedAttributes ?? [];
      const attributesInput = buildAttributeValueInputs(
        assignedAttributes,
        values.attributes,
      );

      const result = await updateProduct(
        {
          id: product.id,
          input: {
            name: values.name,
            slug: values.slug || null,
            description: toEditorJsJSONString(values.description ?? ""),
            seo: {
              title: values.seo.title || null,
              description: values.seo.description || null,
            },
            category: values.categoryId || null,
            collections: (values.collectionIds ?? []).map((c) => c.value),
            attributes: attributesInput,
          },
        },
        productId,
      );

      if (!result.ok) {
        const message = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to update product",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const errors = result.data.productUpdate?.errors ?? [];
      if (errors.length > 0) {
        toast({
          title: "Failed to update product",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });
        return;
      }

      // Sync media: create new, update alt for existing, delete removed
      let mediaHadErrors = false;
      const originalMedia = product.media ?? [];
      const originalById = new Map(originalMedia.map((m) => [m.id, m]));
      const draftExistingIds = new Set(mediaDraft.map((m) => m.id));

      const toDelete = originalMedia
        .filter((m) => !draftExistingIds.has(m.id))
        .map((m) => m.id);

      const normalizedPendingUrl =
        isAddMediaOpen && pendingMediaUrl.trim()
          ? normalizeMaybeUrl(pendingMediaUrl)
          : null;

      for (const id of toDelete) {
        const del = await productMediaDelete({ id }, productId);
        if (!del.ok || (del.data.productMediaDelete?.errors ?? []).length) {
          mediaHadErrors = true;
          toast({
            title: "Product updated, but media delete failed",
            description:
              del.ok
                ? del.data.productMediaDelete?.errors
                    .map((e: { message?: string | null }) => e.message)
                    .filter(Boolean)
                    .join(", ") || "Unknown error"
                : del.errors
                    .map((e: { message?: string | null }) => e.message || "Unknown error")
                    .join(", "),
            variant: "destructive",
          });
          // Continue syncing the rest
        }
      }

      if (isAddMediaOpen && pendingMediaUrl.trim() && !normalizedPendingUrl) {
        mediaHadErrors = true;
        toast({
          title: "Product updated, but media create failed",
          description: `Invalid URL: ${pendingMediaUrl}`,
          variant: "destructive",
        });
      }

      if (normalizedPendingUrl) {
        const created = await productMediaCreate(
          {
            input: {
              product: product.id,
              mediaUrl: normalizedPendingUrl,
              // Keep behavior aligned with Saleor Dashboard (empty string, not null)
              alt: "",
            },
          },
          productId,
        );

        if (
          !created.ok ||
          (created.data.productMediaCreate?.errors ?? []).length ||
          !created.data.productMediaCreate?.media
        ) {
          mediaHadErrors = true;
          toast({
            title: "Product updated, but media create failed",
            description:
              created.ok
                ? created.data.productMediaCreate?.errors
                    .map((e: { message?: string | null }) => e.message)
                    .filter(Boolean)
                    .join(", ") || "Unknown error"
                : created.errors
                    .map((e: { message?: string | null }) => e.message || "Unknown error")
                    .join(", "),
            variant: "destructive",
          });
        } else {
          const createdMedia = created.data.productMediaCreate.media;
          setMediaDraft((prev) => [...prev, { id: createdMedia.id, url: createdMedia.url }]);
          setPendingMediaUrl("");
          setIsAddMediaOpen(false);
        }
      }

      const updateChannels: ProductChannelListingAddInput[] = [];
      const removeChannels: string[] = [];

      for (const channel of channels) {
        const config = values.channelAvailability?.[channel.id];
        if (!config) continue;

        if (config.isPublished) {
          updateChannels.push({
            channelId: channel.id,
            isPublished: true,
            isAvailableForPurchase: config.isAvailableForPurchase,
            visibleInListings: config.visibleInListings,
          });
        } else {
          removeChannels.push(channel.id);
        }
      }

      const channelListingResult = await updateProductChannelListing(
        {
          id: product.id,
          input: {
            updateChannels,
            removeChannels,
          },
        },
        productId,
      );

      if (!channelListingResult.ok) {
        const message = channelListingResult.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Updated product, but channel listing update failed",
          description: message,
          variant: "destructive",
        });
        router.refresh();
        return;
      }

      const channelErrors =
        channelListingResult.data.productChannelListingUpdate?.errors ?? [];
      if (channelErrors.length > 0) {
        toast({
          title: "Updated product, but channel listing update failed",
          description:
            channelErrors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });
        router.refresh();
        return;
      }

      toast(
        mediaHadErrors
          ? {
              title: "Product updated with media errors",
              description: "Some media changes failed. Please review the Media section.",
              variant: "destructive",
            }
          : {
              title: "Product updated",
              description: "Changes saved successfully.",
            },
      );

      if (!mediaHadErrors) {
        form.reset(values, { keepDirty: false });
      }
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="grid w-full gap-4">
        <div className="flex w-full gap-4">
          <div className="flex grow basis-2/3 flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <InputField label="Product Name" name="name" />
                <InputField
                  label="Slug"
                  name="slug"
                  inputProps={{
                    placeholder:
                      "Product slug, if not provided, it will be generated from the product name",
                  }}
                />
                <div className="grid gap-2">
                  <Label>Product Description</Label>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Enter product description"
                    disabled={isSubmitting}
                  />
                </div>
                <InputField label="SEO Title" name="seo.title" />
                <InputField label="SEO Description" name="seo.description" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                {product.thumbnail?.url ? (
                  <div className="relative aspect-square w-56 overflow-hidden rounded-lg border">
                    <Image
                      src={product.thumbnail.url}
                      alt={product.thumbnail.alt || product.name || "Product"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}

                {mediaDraft.length ? (
                  <div className="flex flex-col gap-3">
                    {mediaDraft.map((m) => (
                      <div
                        key={m.id}
                        className="grid gap-2 rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                              <Image
                                src={m.url}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium" title={m.url}>
                                {m.url}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setMediaDraft((prev) =>
                                prev.filter((x) =>
                                  x.id !== m.id,
                                ),
                              );
                            }}
                            aria-label="Remove media"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No media</p>
                )}

                {!isAddMediaOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddMediaOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add media URL
                  </Button>
                ) : (
                  <div className="grid gap-3 rounded-lg border p-3">
                    <div className="text-sm font-medium">Add media</div>
                    <div className="grid gap-2">
                      <Label>URL</Label>
                      <Input
                        value={pendingMediaUrl}
                        onChange={(e) => setPendingMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-muted-foreground text-xs">
                        Click Save to upload this URL.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setPendingMediaUrl("");
                          setIsAddMediaOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <AttributesSection assignedAttributes={product.assignedAttributes ?? []} />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${productId}/variants/new`}>Add Variant</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <Link
                        key={variant.id}
                        href={`/products/${productId}/variants/${variant.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {variant.sku || "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {variant.pricing?.price?.gross
                              ? `${variant.pricing.price.gross.currency} ${variant.pricing.price.gross.amount.toFixed(2)}`
                              : "-"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No variants</p>
                )}
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
                  disabled
                  description="Changing product type is disabled."
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

            <AvailabilitySection channels={channels} />
          </div>
        </div>

        <Card className="sticky bottom-0 z-10">
          <CardHeader className="flex flex-row flex-wrap justify-between gap-4">
            <Button type="button" variant="destructive" disabled className="m-0">
              Delete product
            </Button>

            <span className="flex flex-row justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push("/products")}
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
