"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImageIcon, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
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
import { Label } from "@nimara/ui/components/label";
import { Skeleton } from "@nimara/ui/components/skeleton";
import { useToast } from "@nimara/ui/hooks";

import { InputField } from "@/components/fields/input-field";
import {
  type Channel,
  ChannelAvailabilitySection,
} from "@/components/product-availability-section";
import { Textarea } from "@/components/ui/textarea";
import type { CollectionDetail_collection_Collection } from "@/graphql/generated/client";
import { METADATA_KEYS } from "@/lib/saleor/consts";

import {
  deleteCollection,
  updateCollection,
  updateCollectionChannelListing,
  uploadCollectionBackgroundImage,
} from "../actions";
import {
  type CollectionUpdateFormValues,
  collectionUpdateSchema,
} from "../schema";
import { AssignedProductsSection } from "./assigned-products-section";

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
    .map((text) => ({ type: "paragraph", data: { text } }));

  return JSON.stringify({
    time: Date.now(),
    blocks,
    version: "2.28.2",
  });
}

type Props = {
  channels: Channel[];
  collection: NonNullable<CollectionDetail_collection_Collection>;
  collectionId: string;
};

export function CollectionDetailClient({
  collection,
  collectionId,
  channels,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(collection.backgroundImage?.url || null);

  // Check if collection is default
  const isDefaultCollection = useMemo(() => {
    const defaultMeta = collection.metadata?.find(
      (m) => m.key === METADATA_KEYS.VENDOR_DEFAULT_COLLECTION,
    );

    return defaultMeta?.value === "true";
  }, [collection.metadata]);

  const defaultChannelAvailability = useMemo(() => {
    const byChannelId = new Map(
      collection.channelListings?.map((l) => [l.channel.id, l]) ?? [],
    );

    return Object.fromEntries(
      channels.map((ch) => {
        const listing = byChannelId.get(ch.id);

        return [
          ch.id,
          {
            isPublished: listing?.isPublished ?? false,
            publishedAt: listing?.publishedAt ?? undefined,
            setPublicationDate: Boolean(listing?.publishedAt),
          },
        ];
      }),
    );
  }, [channels, collection.channelListings]);

  const form = useForm<CollectionUpdateFormValues>({
    resolver: zodResolver(collectionUpdateSchema),
    defaultValues: {
      name: collection.name ?? "",
      slug: collection.slug ?? "",
      description: tryExtractEditorJsPlainText(collection.description),
      seo: {
        title: collection.seoTitle ?? "",
        description: collection.seoDescription ?? "",
      },
      metadata: [],
      privateMetadata: [],
      channelAvailability: defaultChannelAvailability,
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        // Avoid running update/channel-update if delete is in progress (e.g. race after confirm delete)
        if (isDeleting) {
          return;
        }

        const result = await updateCollection(
          {
            id: collectionId,
            input: {
              name: values.name,
              slug: values.slug || null,
              description: toEditorJsJSONString(values.description ?? ""),
            },
          },
          collectionId,
        );

        if (!result.ok) {
          toast({
            title: "Failed to update collection",
            description: result.errors
              .map(
                (e: { message?: string | null }) =>
                  e.message || "Unknown error",
              )
              .join(", "),
            variant: "destructive",
          });

          return;
        }

        const errors =
          (
            result.data as {
              collectionUpdate?: {
                errors?: Array<{ message?: string | null }>;
              };
            }
          )?.collectionUpdate?.errors ?? [];

        if (errors.length > 0) {
          toast({
            title: "Failed to update collection",
            description:
              errors
                .map((e: { message?: string | null }) => e.message)
                .filter(Boolean)
                .join(", ") || "Unknown error",
            variant: "destructive",
          });

          return;
        }

        const updateChannels: Array<{
          channelId: string;
          isPublished: boolean;
          publishedAt?: string | null;
        }> = [];

        const selectedChannelIds = new Set(
          Object.keys(values.channelAvailability ?? {}),
        );

        // Process all channels - ensure every channel is included
        for (const channel of channels) {
          const config = values.channelAvailability?.[channel.id];

          // If channel is not configured in form, skip it (shouldn't happen, but safety check)
          if (!config) {
            continue;
          }

          // If Hidden is selected but publication date is set, treat as scheduled visibility
          const hasScheduledPublication =
            !config.isPublished &&
            config.setPublicationDate &&
            config.publishedAt;

          if (config.isPublished || hasScheduledPublication) {
            let publishedAt: string | null = null;

            if (
              (config.setPublicationDate || hasScheduledPublication) &&
              config.publishedAt
            ) {
              // Convert datetime-local format to ISO string
              const dateValue = new Date(config.publishedAt);

              if (!isNaN(dateValue.getTime())) {
                publishedAt = dateValue.toISOString();
              }
            }
            updateChannels.push({
              channelId: channel.id,
              isPublished: true,
              publishedAt,
            });
          } else {
            // Keep channel listing but mark as unpublished (hidden)
            // This ensures the channel is counted in the list view
            updateChannels.push({
              channelId: channel.id,
              isPublished: false,
              publishedAt: null,
            });
          }
        }

        // Remove collection from channels that were unchecked in Manage
        const currentListingChannelIds = new Set(
          collection.channelListings?.map((l) => l.channel.id) ?? [],
        );
        const removeChannels = [...currentListingChannelIds].filter(
          (id) => !selectedChannelIds.has(id),
        );

        const channelResult = await updateCollectionChannelListing(
          {
            id: collectionId,
            input: {
              addChannels:
                updateChannels.length > 0 ? updateChannels : undefined,
              removeChannels:
                removeChannels.length > 0 ? removeChannels : undefined,
            },
          },
          collectionId,
        );

        if (!channelResult.ok) {
          toast({
            title: "Collection updated, but channel update failed",
            description: channelResult.errors
              .map(
                (e: { message?: string | null }) =>
                  e.message || "Unknown error",
              )
              .join(", "),
            variant: "destructive",
          });
          router.refresh();

          return;
        }

        const channelErrors =
          (
            channelResult.data as {
              collectionChannelListingUpdate?: {
                errors?: Array<{ message?: string | null }>;
              };
            }
          )?.collectionChannelListingUpdate?.errors ?? [];

        if (channelErrors.length > 0) {
          toast({
            title: "Collection updated, but channel update failed",
            description:
              channelErrors
                .map((e: { message?: string | null }) => e.message)
                .filter(Boolean)
                .join(", ") || "Unknown error",
            variant: "destructive",
          });
          router.refresh();

          return;
        }

        toast({
          title: "Collection updated",
          description: "Changes saved successfully.",
        });
        form.reset(values, { keepDirty: false });
        router.refresh();
      } catch (error) {
        toast({
          title: "Failed to update collection",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    (errors) => {
      // Handle validation errors
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => {
          const errorObj = error as { message?: string } | undefined;

          if (errorObj?.message) {
            return `${field}: ${errorObj.message}`;
          }

          return null;
        })
        .filter((msg): msg is string => msg !== null);

      toast({
        title: "Validation error",
        description:
          errorMessages.length > 0
            ? errorMessages.join(", ")
            : "Please check the form fields",
        variant: "destructive",
      });
    },
  );

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const result = await uploadCollectionBackgroundImage(
        collectionId,
        file,
        collection.name ?? undefined,
      );

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

      const uploadedImageUrl = result.data.collection?.backgroundImage?.url;

      if (uploadedImageUrl && typeof uploadedImageUrl === "string") {
        setBackgroundImagePreview(uploadedImageUrl);
      }

      toast({
        title: "Image uploaded",
        description: "Background image has been uploaded successfully.",
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });

      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });

      return;
    }

    // Upload the file immediately (don't set preview yet - will use server response)
    void handleImageUpload(file);
  };

  const handleRemoveImage = async () => {
    setIsRemovingImage(true);
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to remove images.",
          variant: "destructive",
        });
        setIsRemovingImage(false);

        return;
      }

      // Get GraphQL endpoint
      const graphqlEndpoint = `${window.location.origin}/api/graphql`;

      // Call collectionUpdate mutation with backgroundImage set to null
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation CollectionUpdate($id: ID!, $input: CollectionInput!) {
            collectionUpdate(id: $id, input: $input) {
              errors {
                field
                message
                code
              }
              collection {
                id
                backgroundImage {
                  url
                  alt
                }
              }
            }
          }`,
          variables: {
            id: collectionId,
            input: {
              backgroundImage: null,
            },
          },
          operationName: "CollectionUpdate",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.errors) {
        toast({
          title: "Failed to remove image",
          description:
            result.errors
              ?.map((e: { message?: string }) => e.message)
              .join(", ") || "Failed to remove image",
          variant: "destructive",
        });
        setIsRemovingImage(false);

        return;
      }

      if (!result.data?.collectionUpdate) {
        toast({
          title: "Failed to remove image",
          description: "No data returned from server",
          variant: "destructive",
        });
        setIsRemovingImage(false);

        return;
      }

      const errors = result.data.collectionUpdate.errors || [];

      if (errors.length > 0) {
        toast({
          title: "Failed to remove image",
          description:
            errors
              .map((e: { message?: string }) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });
        setIsRemovingImage(false);

        return;
      }

      // Clear preview
      setBackgroundImagePreview(null);

      toast({
        title: "Image removed",
        description: "Background image has been removed successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to remove image",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCollection(collectionId);

      if (!result.ok) {
        toast({
          title: "Failed to delete collection",
          description: result.errors
            .map(
              (e: { message?: string | null }) => e.message || "Unknown error",
            )
            .join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data?.collectionDelete?.errors ?? [];

      if (errors.length > 0) {
        toast({
          title: "Failed to delete collection",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      // Deletion is successful if there are no errors
      // Saleor returns the deleted collection object in the response on success

      // Close the delete dialog first
      setShowDeleteDialog(false);

      toast({
        title: "Collection deleted",
        description: "The collection has been deleted successfully.",
      });

      // Navigate away using router.replace to prevent back navigation to deleted collection
      router.replace("/collections");
    } catch (error) {
      toast({
        title: "Failed to delete collection",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="min-h-screen">
          <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/collections">
                    <ArrowLeft className="h-4 w-4" />
                    All collections
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                  {collection.name ?? "Collection"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {!isDefaultCollection && (
                  <Button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                )}
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Save{" "}
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 px-6 pb-6">
            <div className="flex w-full gap-4">
              <div className="flex grow basis-2/3 flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <InputField label="Name" name="name" />
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        {...form.register("description")}
                        placeholder="Description"
                        rows={7}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Background Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isUploadingImage ? (
                      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                        <Skeleton className="h-full w-full" />
                      </div>
                    ) : backgroundImagePreview ? (
                      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                        <Image
                          src={backgroundImagePreview}
                          alt={
                            collection.backgroundImage?.alt ||
                            collection.name ||
                            "Collection"
                          }
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute right-2 top-2 flex gap-2">
                          <label htmlFor="background-image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer bg-background/90 backdrop-blur-sm hover:bg-background"
                              disabled={isRemovingImage || isSubmitting}
                              asChild
                            >
                              <span className="flex items-center gap-1.5">
                                <ImageIcon className="h-4 w-4" />
                                Replace
                              </span>
                            </Button>
                          </label>
                          <input
                            id="background-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInputChange}
                            disabled={isRemovingImage || isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="bg-destructive/90 backdrop-blur-sm hover:bg-destructive"
                            onClick={handleRemoveImage}
                            disabled={isRemovingImage || isSubmitting}
                            aria-label="Remove image"
                          >
                            {isRemovingImage ? (
                              <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Remove
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-12">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                          DROP HERE TO UPLOAD
                        </p>
                        <label htmlFor="background-image-upload-empty">
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4 cursor-pointer"
                            disabled={isUploadingImage || isSubmitting}
                            asChild
                          >
                            <span>
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                "Upload image"
                              )}
                            </span>
                          </Button>
                        </label>
                        <input
                          id="background-image-upload-empty"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileInputChange}
                          disabled={isUploadingImage || isSubmitting}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <AssignedProductsSection
                  collectionId={collectionId}
                  collectionName={collection.name}
                  products={collection.products?.edges.map((e) => e.node) ?? []}
                  onProductsChange={() => router.refresh()}
                />
              </div>

              <div className="flex grow basis-1/3 flex-col gap-4">
                <ChannelAvailabilitySection
                  variant="collection"
                  channels={channels}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;?
              This action cannot be undone and will remove all products from
              this collection.
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
                "Delete collection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
