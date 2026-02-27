"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImageIcon, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nimara/ui/components/tooltip";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { CollectionsField } from "@/components/fields/collections-field";
import { InputField } from "@/components/fields/input-field";
import {
  SelectField,
  type SelectOption,
} from "@/components/fields/select-field";
import { ChannelAvailabilitySection } from "@/components/product-availability-section";
import { ProductViewNavigation } from "@/components/product-view-navigation";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type {
  AttributeInputTypeEnum,
  AttributeValueInput,
  Channels,
  ProductChannelListingAddInput,
  ProductDelete_Mutation,
  ProductDetail,
} from "@/graphql/generated/client";
import { cn } from "@/lib/utils";

import {
  deleteProduct,
  productMediaCreate,
  productMediaDelete,
  productMediaReorder,
  updateProduct,
  updateProductChannelListing,
  uploadProductMedia,
} from "../actions";
import { type ProductUpdateFormValues, productUpdateSchema } from "../schema";

type Props = {
  categories: Array<{ id: string; name: string; slug: string }>;
  channels: NonNullable<Channels["channels"]>;
  collections: Array<{ id: string; name: string; slug: string }>;
  product: NonNullable<ProductDetail["product"]>;
  productId: string;
  productTypes: Array<{
    hasVariants: boolean;
    id: string;
    name: string;
    slug: string;
  }>;
};

type MediaDraftItem = { id: string; url: string };

function normalizeMaybeUrl(input: string): string | null {
  const raw = input.trim();

  if (!raw) {
    return null;
  }

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
      blocks?: Array<{ data?: { text?: string }; type?: string }>;
    };

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.blocks)
    ) {
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
        {assignedAttributes.map((assigned) => {
          const attribute = assigned.attribute;
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
                <p className="text-xs text-muted-foreground">Required</p>
              ) : null}

              {inputType === ("FILE" as AttributeInputTypeEnum) ? (
                <p className="text-xs text-muted-foreground">
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Only include channels that have listings for this product
  const channelsWithListings = useMemo(() => {
    const listingChannelIds = new Set(
      product.channelListings?.map((l) => l.channel.id) ?? [],
    );

    return channels.filter((ch) => listingChannelIds.has(ch.id));
  }, [channels, product.channelListings]);

  const defaultChannelAvailability = useMemo(() => {
    const byChannelId = new Map(
      product.channelListings?.map((l) => [l.channel.id, l]) ?? [],
    );

    // Only create entries for channels that have listings
    return Object.fromEntries(
      channelsWithListings.map((ch) => {
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
  }, [channelsWithListings, product.channelListings]);

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
            slug: product.slug || null,
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
            description: del.ok
              ? del.data.productMediaDelete?.errors
                  .map((e: { message?: string | null }) => e.message)
                  .filter(Boolean)
                  .join(", ") || "Unknown error"
              : del.errors
                  .map(
                    (e: { message?: string | null }) =>
                      e.message || "Unknown error",
                  )
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
            description: created.ok
              ? created.data.productMediaCreate?.errors
                  .map((e: { message?: string | null }) => e.message)
                  .filter(Boolean)
                  .join(", ") || "Unknown error"
              : created.errors
                  .map(
                    (e: { message?: string | null }) =>
                      e.message || "Unknown error",
                  )
                  .join(", "),
            variant: "destructive",
          });
        } else {
          const createdMedia = created.data.productMediaCreate.media;

          setMediaDraft((prev) => [
            ...prev,
            { id: createdMedia.id, url: createdMedia.url },
          ]);
          setPendingMediaUrl("");
          setIsAddMediaOpen(false);
        }
      }

      const updateChannels: ProductChannelListingAddInput[] = [];
      const selectedChannelIds = new Set(
        Object.keys(values.channelAvailability ?? {}),
      );

      // Every channel selected in Manage gets saved (published or not)
      for (const channel of channels) {
        const config = values.channelAvailability?.[channel.id];

        if (!config) {
          continue;
        }

        updateChannels.push({
          channelId: channel.id,
          isPublished: config.isPublished ?? false,
          isAvailableForPurchase: config.isAvailableForPurchase ?? false,
          visibleInListings: config.visibleInListings ?? false,
        });
      }

      // Remove product from channels that were unchecked in Manage
      const currentListingChannelIds = new Set(
        product.channelListings?.map((l) => l.channel.id) ?? [],
      );
      const removeChannels = [...currentListingChannelIds].filter(
        (id) => !selectedChannelIds.has(id),
      );

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
              description:
                "Some media changes failed. Please review the Media section.",
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

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const result = await uploadProductMedia(productId, file);

      if (!result.ok) {
        toast({
          title: "Failed to upload image",
          description:
            result.errors
              .map((e: { message?: string }) => e.message)
              .filter(Boolean)
              .join(", ") || "Failed to upload image",
          variant: "destructive",
        });

        return;
      }

      const uploadedMedia = result.data.media;

      if (uploadedMedia) {
        setMediaDraft((prev) => [
          ...prev,
          { id: uploadedMedia.id, url: uploadedMedia.url },
        ]);
      }

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to upload image",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });

      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });

      return;
    }

    void handleImageUpload(file);
  };

  const handleSaveMediaUrl = async () => {
    if (!pendingMediaUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a media URL.",
        variant: "destructive",
      });

      return;
    }

    const normalizedUrl = normalizeMaybeUrl(pendingMediaUrl);

    if (!normalizedUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });

      return;
    }

    try {
      const result = await productMediaCreate(
        {
          input: {
            product: product.id,
            mediaUrl: normalizedUrl,
            alt: "",
          },
        },
        productId,
      );

      if (!result.ok || (result.data.productMediaCreate?.errors ?? []).length) {
        toast({
          title: "Failed to add media",
          description: result.ok
            ? result.data.productMediaCreate?.errors
                .map((e: { message?: string | null }) => e.message)
                .filter(Boolean)
                .join(", ") || "Unknown error"
            : result.errors
                .map(
                  (e: { message?: string | null }) =>
                    e.message || "Unknown error",
                )
                .join(", "),
          variant: "destructive",
        });

        return;
      }

      const createdMedia = result.data.productMediaCreate?.media;

      if (createdMedia) {
        setMediaDraft((prev) => [
          ...prev,
          { id: createdMedia.id, url: createdMedia.url },
        ]);
        setPendingMediaUrl("");
        setIsAddMediaOpen(false);
        toast({
          title: "Media added",
          description: "Media URL has been added successfully.",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Failed to add media",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please drop an image file.",
        variant: "destructive",
      });

      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please drop an image smaller than 10MB.",
        variant: "destructive",
      });

      return;
    }

    void handleImageUpload(file);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const result = await productMediaDelete({ id: mediaId }, productId);

      if (!result.ok || (result.data.productMediaDelete?.errors ?? []).length) {
        toast({
          title: "Failed to delete media",
          description: result.ok
            ? result.data.productMediaDelete?.errors
                .map((e: { message?: string | null }) => e.message)
                .filter(Boolean)
                .join(", ") || "Unknown error"
            : result.errors
                .map(
                  (e: { message?: string | null }) =>
                    e.message || "Unknown error",
                )
                .join(", "),
          variant: "destructive",
        });

        return;
      }

      setMediaDraft((prev) => prev.filter((m) => m.id !== mediaId));
      toast({
        title: "Media deleted",
        description: "Media has been deleted successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete media",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleMediaDragStart = (e: React.DragEvent, mediaId: string) => {
    setDraggedMediaId(mediaId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", mediaId);
  };

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleMediaDragEnd = () => {
    setDraggedMediaId(null);
  };

  const handleMediaDrop = async (e: React.DragEvent, targetMediaId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedMediaId || draggedMediaId === targetMediaId) {
      setDraggedMediaId(null);

      return;
    }

    const draggedIndex = mediaDraft.findIndex((m) => m.id === draggedMediaId);
    const targetIndex = mediaDraft.findIndex((m) => m.id === targetMediaId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedMediaId(null);

      return;
    }

    // Reorder the media array
    const newMediaOrder = [...mediaDraft];

    const [draggedItem] = newMediaOrder.splice(draggedIndex, 1);

    newMediaOrder.splice(targetIndex, 0, draggedItem);

    // Optimistically update UI
    const previousOrder = mediaDraft;

    setMediaDraft(newMediaOrder);
    setDraggedMediaId(null);

    // Call API to persist the new order
    try {
      setIsReordering(true);

      const mediaIds = newMediaOrder.map((m) => m.id);
      const result = await productMediaReorder(
        { productId, mediaIds },
        productId,
      );

      if (!result.ok) {
        // Revert on error
        setMediaDraft(previousOrder);
        toast({
          title: "Failed to reorder media",
          description: result.errors
            .map(
              (e: { message?: string | null }) => e.message || "Unknown error",
            )
            .join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors =
        (
          result.data as {
            productMediaReorder?: {
              errors?: Array<{ message?: string | null }>;
            };
          }
        )?.productMediaReorder?.errors ?? [];

      if (errors.length > 0) {
        // Revert on error
        setMediaDraft(previousOrder);
        toast({
          title: "Failed to reorder media",
          description:
            errors
              .map((e: { message?: string | null }) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      // Update mediaDraft with the new order from the server response
      const updatedMedia =
        (
          result.data as {
            productMediaReorder?: {
              product?: { media?: Array<{ id: string; url: string }> };
            };
          }
        )?.productMediaReorder?.product?.media ?? [];

      if (updatedMedia.length > 0) {
        setMediaDraft(updatedMedia.map((m) => ({ id: m.id, url: m.url })));
      }

      router.refresh();
    } catch (error) {
      // Revert on error
      setMediaDraft(previousOrder);
      toast({
        title: "Failed to reorder media",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  const productStatus = product.channelListings?.some((l) => l.isPublished)
    ? "Published"
    : "Draft";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);

      if (!result.ok) {
        toast({
          title: "Failed to delete product",
          description: result.errors
            .map((e) => e.message || "Unknown error")
            .join(", "),
          variant: "destructive",
        });

        return;
      }

      const data = result.data as unknown as ProductDelete_Mutation;
      const errors = data?.productDelete?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to delete product",
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
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });

      router.replace("/products");
    } catch (error) {
      toast({
        title: "Failed to delete product",
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
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    All products
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                  {product.name ?? "Product"}
                </h1>
                <ColorBadge label={productStatus} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
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
                variantCount={product.variants?.length ?? 0}
                firstVariantId={product.variants?.[0]?.id}
              />
            </div>
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

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Media</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUploadingImage || isSubmitting}
                            >
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>Upload</>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const input = document.createElement("input");

                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement;

                                  if (target.files?.[0]) {
                                    handleFileInputChange({
                                      target,
                                    } as React.ChangeEvent<HTMLInputElement>);
                                  }
                                };
                                input.click();
                              }}
                              disabled={isUploadingImage || isSubmitting}
                            >
                              Upload Images
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setIsAddMediaOpen(true)}
                              disabled={isUploadingImage || isSubmitting}
                            >
                              Upload URL
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                      {mediaDraft.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                          {mediaDraft.map((m) => (
                            <div
                              key={m.id}
                              draggable
                              onDragStart={(e) => handleMediaDragStart(e, m.id)}
                              onDragOver={handleMediaDragOver}
                              onDragEnd={handleMediaDragEnd}
                              onDrop={(e) => handleMediaDrop(e, m.id)}
                              className={`group relative aspect-square overflow-hidden rounded-lg border transition-opacity ${
                                draggedMediaId === m.id
                                  ? "cursor-grabbing opacity-50"
                                  : draggedMediaId
                                    ? "cursor-move opacity-90"
                                    : "cursor-grab opacity-100"
                              }`}
                            >
                              <Image
                                src={m.url}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 h-8 w-8 bg-destructive/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                                onClick={() => handleDeleteMedia(m.id)}
                                disabled={isSubmitting || isReordering}
                                aria-label="Delete media"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {isAddMediaOpen ? (
                        <div className="grid gap-3 rounded-lg border p-3">
                          <div className="text-sm font-medium">
                            Add media URL
                          </div>
                          <div className="grid gap-2">
                            <Label>URL</Label>
                            <Input
                              value={pendingMediaUrl}
                              onChange={(e) =>
                                setPendingMediaUrl(e.target.value)
                              }
                              placeholder="https://example.com/image.jpg"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                              Enter a URL and click Save to add it.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPendingMediaUrl("");
                                  setIsAddMediaOpen(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={handleSaveMediaUrl}
                                disabled={
                                  isSubmitting || !pendingMediaUrl.trim()
                                }
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => {
                            const input = document.createElement("input");

                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const target = e.target as HTMLInputElement;

                              if (target.files?.[0]) {
                                handleFileInputChange({
                                  target,
                                } as React.ChangeEvent<HTMLInputElement>);
                              }
                            };
                            input.click();
                          }}
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 py-12 transition-colors ${
                            isDragOver
                              ? "border-primary bg-muted/50"
                              : "border-muted-foreground/25 hover:border-muted-foreground/40"
                          }`}
                        >
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-sm font-medium text-muted-foreground">
                            DROP HERE TO UPLOAD
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <AttributesSection
                    assignedAttributes={product.assignedAttributes ?? []}
                  />

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Variants</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${productId}/variants/new`}>
                          Add Variant
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {product.variants && product.variants.length > 0 ? (
                        <TooltipProvider delayDuration={300}>
                          <div className="space-y-2">
                            {/* Three-column header (Variant column wider for long names/SKUs) */}
                            <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr] gap-4 px-3 py-1.5 text-xs font-medium text-muted-foreground [&>div]:flex [&>div]:items-center">
                              <div>Variant</div>
                              <div>Channels</div>
                              <div className="justify-end text-right">
                                Stock
                              </div>
                            </div>
                            {product.variants.map((variant) => {
                              const channelListings =
                                variant.channelListings?.filter(
                                  (l) => l.price != null,
                                ) ?? [];
                              const stocks = variant.stocks ?? [];
                              const maxVisible = 3;

                              const hasZeroChannelPrice = channelListings.some(
                                (l) => Number(l.price?.amount ?? 0) === 0,
                              );
                              const hasZeroStock = stocks.some(
                                (s) => s.quantity === 0,
                              );

                              return (
                                <Link
                                  key={variant.id}
                                  href={`/products/${productId}/variants/${variant.id}`}
                                  className="grid grid-cols-[minmax(0,2fr)_1fr_1fr] items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted"
                                >
                                  {/* Column 1: Variant name + SKU (wider, truncate if long) */}
                                  <div className="flex min-w-0 items-center">
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="truncate font-medium"
                                        title={variant.name}
                                      >
                                        {variant.name}
                                      </p>
                                      <p
                                        className="truncate text-sm text-muted-foreground"
                                        title={variant.sku ?? undefined}
                                      >
                                        SKU: {variant.sku || "-"}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Column 2: Pricing per channel */}
                                  <div className="flex min-w-0 flex-col items-start justify-center gap-0.5 text-xs">
                                    {channelListings.length === 0 ? (
                                      <span className="text-xs font-medium text-destructive">
                                        No channels
                                      </span>
                                    ) : channelListings.length <= maxVisible ? (
                                      channelListings.map((l) => {
                                        const priceAmount =
                                          l.price != null
                                            ? Number(l.price.amount)
                                            : null;
                                        const isZeroPrice =
                                          priceAmount !== null &&
                                          priceAmount === 0;

                                        return (
                                          <span
                                            key={l.channel.id}
                                            className={cn(
                                              "truncate",
                                              isZeroPrice && "text-destructive",
                                            )}
                                          >
                                            <span className="font-medium">
                                              {l.channel.name}
                                            </span>
                                            :{" "}
                                            {l.price
                                              ? `${l.price.currency} ${Number(l.price.amount).toFixed(2)}`
                                              : "—"}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className={cn(
                                              "text-xs font-medium",
                                              hasZeroChannelPrice
                                                ? "text-destructive"
                                                : "text-green-600",
                                            )}
                                          >
                                            {channelListings.length} channels
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="flex flex-col gap-0.5 text-xs">
                                            {channelListings.map((l) => {
                                              const isZero =
                                                Number(l.price?.amount ?? 0) ===
                                                0;

                                              return (
                                                <div
                                                  key={l.channel.id}
                                                  className={cn(
                                                    isZero &&
                                                      "text-destructive",
                                                  )}
                                                >
                                                  <span className="font-medium">
                                                    {l.channel.name}
                                                  </span>
                                                  :{" "}
                                                  {l.price
                                                    ? `${l.price.currency} ${Number(l.price.amount).toFixed(2)}`
                                                    : "—"}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  {/* Column 3: Warehouses with stock (right-aligned) */}
                                  <div className="flex min-w-0 flex-col items-end justify-center gap-0.5 text-right text-xs">
                                    {stocks.length === 0 ? (
                                      <span className="text-xs font-medium text-destructive">
                                        No stock
                                      </span>
                                    ) : stocks.length <= maxVisible ? (
                                      stocks.map((s) => (
                                        <span
                                          key={s.warehouse.id}
                                          className={cn(
                                            "truncate",
                                            s.quantity === 0 &&
                                              "text-destructive",
                                          )}
                                        >
                                          <span className="font-medium">
                                            {s.warehouse.name}
                                          </span>
                                          : {s.quantity}
                                        </span>
                                      ))
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className={cn(
                                              "text-xs font-medium",
                                              hasZeroStock
                                                ? "text-destructive"
                                                : "text-green-600",
                                            )}
                                          >
                                            {stocks.length} warehouses
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="flex flex-col gap-0.5 text-xs">
                                            {stocks.map((s) => (
                                              <div
                                                key={s.warehouse.id}
                                                className={cn(
                                                  s.quantity === 0 &&
                                                    "text-destructive",
                                                )}
                                              >
                                                <span className="font-medium">
                                                  {s.warehouse.name}
                                                </span>
                                                : {s.quantity} in stock
                                              </div>
                                            ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </TooltipProvider>
                      ) : (
                        <p className="text-muted-foreground">No variants</p>
                      )}
                    </CardContent>
                  </Card>

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

                  <ChannelAvailabilitySection
                    channels={channelsWithListings}
                    allChannels={channels}
                    disabledReason={null}
                    isEditPage={true}
                    totalChannelsCount={channels.length}
                    product={{
                      productType: product.productType,
                      variants: product.variants,
                      channelListings: product.channelListings,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{product.name}&rdquo;? This
              action cannot be undone.
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
                "Delete product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
