"use client";

import { AlertCircle, AlertTriangle, Package, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@nimara/ui/components/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nimara/ui/components/tooltip";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { ManageChannelAvailabilityModal } from "./manage-channel-availability-modal";

/** Minimal form shape required by ChannelAvailabilitySection (no dependency on create/update schemas). */
export type ProductChannelAvailabilityFormValues = {
  channelAvailability: Record<
    string,
    {
      isAvailableForPurchase?: boolean;
      isPublished: boolean;
      visibleInListings: boolean;
    }
  >;
};

/** Form shape for collection availability (isPublished, optional publication date). */
export type CollectionChannelAvailabilityFormValues = {
  channelAvailability: Record<
    string,
    {
      isPublished: boolean;
      publishedAt?: string | null;
      setPublicationDate?: boolean;
    }
  >;
};

/** Base form shape accepted by the shared component for both product and collection. */
export type ChannelAvailabilityFormValues =
  | ProductChannelAvailabilityFormValues
  | CollectionChannelAvailabilityFormValues;

export type ProductAvailabilityDisabledReason =
  | "no-product-type"
  | "has-variants"
  | null;

export type Channel = {
  currencyCode: string;
  id: string;
  name: string;
  shippingZones?: Array<{
    id: string;
    name: string;
    warehouses: Array<{ id: string; name: string }>;
  }>;
  warehouses?: Array<{ id: string; name: string }>;
};

type ChannelIssue = {
  message: string;
  severity: "error" | "warning"; // error = red, warning = orange
  type:
    | "missing-variants"
    | "availability"
    | "pricing"
    | "variant-listing"
    | "variant-pricing"
    | "stock"
    | "stock-unreachable";
};

type ProductData = {
  channelListings?: Array<{
    channel: { id: string };
    isAvailableForPurchase?: boolean | null;
    isPublished: boolean;
    pricing?: {
      priceRange?: {
        start?: { gross?: { amount: number } } | null;
      } | null;
    } | null;
    visibleInListings?: boolean | null;
  }> | null;
  productType?: { hasVariants: boolean } | null;
  variants?: Array<{
    channelListings?: Array<{
      channel: { id: string };
      price?: { amount: number } | null;
    }> | null;
    id: string;
    stocks?: Array<{
      quantity: number;
      warehouse?: { id: string; name: string } | null;
    }> | null;
  }> | null;
} | null;

export type AvailabilitySectionVariant = "product" | "collection";

type Props = {
  allChannels?: Channel[]; // All available channels (for modal, product only)
  channels: Channel[]; // Channels with listings (for display)
  disabledReason?: ProductAvailabilityDisabledReason; // Product only
  isEditPage?: boolean; // Product only
  product?: ProductData; // Product only
  totalChannelsCount?: number; // Product only
  variant?: AvailabilitySectionVariant; // "product" | "collection", default "product"
};

export function ChannelAvailabilitySection({
  channels,
  allChannels,
  disabledReason = null,
  isEditPage = false,
  product,
  totalChannelsCount,
  variant = "product",
}: Props) {
  // All hooks must be called at the top, before any conditional returns
  const t = useTranslations();
  const { watch, setValue, control, register } =
    useFormContext<ChannelAvailabilityFormValues>();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get current channel availability state (must be called unconditionally)
  const channelAvailability = watch("channelAvailability") ?? {};

  // Filter to only show channels that have entries in channelAvailability
  // Use allChannels if available (for edit page) to include newly selected channels
  const channelsToFilter = allChannels ?? channels;
  const availableChannels = channelsToFilter.filter(
    (channel) => channelAvailability[channel.id] !== undefined,
  );

  // Check if product has missing variants (shown in Delivery configuration section)
  // Always show as an error when product has no variants, regardless of product type
  const hasMissingVariants = useMemo(() => {
    if (!isEditPage || !product) {
      return false;
    }

    // Always show error if no variants exist
    const hasNoVariants = !product.variants || product.variants.length === 0;

    return hasNoVariants;
  }, [product, isEditPage]);

  // Detect issues for each channel
  // This mirrors Saleor's backend validation logic for channel availability
  const getChannelIssues = (channelId: string): ChannelIssue[] => {
    if (!product || !isEditPage) {
      return [];
    }

    const issues: ChannelIssue[] = [];
    // Use allChannels to find channel name to ensure we get the correct name
    const channelName =
      (allChannels ?? channels).find((ch) => ch.id === channelId)?.name ||
      t("marketplace.configuration.channel-availability.this-channel");

    // Check for missing variants (applies to all channels)
    // Maps to Saleor error: CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT
    if (hasMissingVariants) {
      issues.push({
        severity: "error",
        type: "missing-variants",
        message: t(
          "marketplace.configuration.channel-availability.no-variants-created",
        ),
      });
    }

    const listing = product.channelListings?.find(
      (l) => l.channel.id === channelId,
    );

    // If product is not assigned to channel, only show variant error
    if (!listing) {
      return issues;
    }

    // Check for availability issues (only if published)
    if (listing.isPublished) {
      // Product is published but not available for purchase
      if (listing.isAvailableForPurchase === false) {
        issues.push({
          severity: "error",
          type: "availability",
          message: t(
            "marketplace.configuration.channel-availability.has-availability-issues-error",
          ),
        });
      }

      // Product is published but hidden from listings
      if (listing.visibleInListings === false) {
        issues.push({
          severity: "warning",
          type: "availability",
          message: t(
            "marketplace.configuration.channel-availability.hidden-from-listings",
          ),
        });
      }
    }

    // Variant-level checks (only if variants exist)
    // These checks run independently - each adds its issue if detected
    // This matches Saleor Dashboard's approach where checks don't short-circuit
    if (product.variants && product.variants.length > 0) {
      // Check if any variant has a channel listing for this channel
      // Maps to Saleor Dashboard's checkNoVariantInChannel
      const hasVariantInChannel = product.variants.some((variant) =>
        variant.channelListings?.some((cl) => cl.channel.id === channelId),
      );

      if (!hasVariantInChannel) {
        issues.push({
          severity: "error",
          type: "variant-listing",
          message: t(
            "marketplace.configuration.channel-availability.no-variant-listed",
          ),
        });
      }

      // Check if any variant has a price set for this channel
      // Maps to Saleor Dashboard's checkNoVariantPriced
      // This check runs independently even if no variants are listed
      const hasVariantWithPrice = product.variants.some((variant) =>
        variant.channelListings?.some(
          (cl) =>
            cl.channel.id === channelId &&
            cl.price !== null &&
            (cl.price?.amount ?? 0) > 0,
        ),
      );

      if (!hasVariantWithPrice) {
        issues.push({
          severity: "error",
          type: "variant-pricing",
          message: t(
            "marketplace.configuration.channel-availability.no-variant-price",
            {
              channelName,
            },
          ),
        });
      }

      // Get warehouses assigned to this channel
      const channelWarehouseIds = new Set(
        (allChannels ?? channels)
          .find((ch) => ch.id === channelId)
          ?.warehouses?.map((w) => w.id) ?? [],
      );

      // Stock checks (matches Saleor Dashboard's warehouseChecks)
      // Only run if channel has warehouses assigned
      if (channelWarehouseIds.size > 0) {
        // Check if any variant has stock in warehouses assigned to THIS channel
        // Maps to Saleor Dashboard's checkNoStock logic
        // This checks ALL variants, not just those listed in channel
        const hasStockInChannelWarehouse = product.variants.some((variant) =>
          variant.stocks?.some(
            (stock) =>
              stock.quantity > 0 &&
              stock.warehouse?.id &&
              channelWarehouseIds.has(stock.warehouse.id),
          ),
        );

        if (!hasStockInChannelWarehouse) {
          issues.push({
            severity: "warning", // Stock is a warning, not a blocking error
            type: "stock",
            message: t(
              "marketplace.configuration.channel-availability.no-stock-in-warehouses",
              {
                channelName,
              },
            ),
          });
        }

        // Check for "Stock unreachable" - requires shipping zones data
        // Maps to Saleor Dashboard's checkWarehouseNotInShippingZone logic
        const channel = (allChannels ?? channels).find(
          (ch) => ch.id === channelId,
        );
        const shippingZones = channel?.shippingZones ?? [];

        if (shippingZones.length > 0) {
          // Get all warehouse IDs that have stock (from any variant)
          const warehouseIdsWithStock = new Set<string>();

          product.variants.forEach((variant) => {
            variant.stocks?.forEach((stock) => {
              if (stock.quantity > 0 && stock.warehouse?.id) {
                warehouseIdsWithStock.add(stock.warehouse.id);
              }
            });
          });

          // Get all warehouse IDs that are in shipping zones for this channel
          const warehouseIdsInShippingZones = new Set<string>();

          shippingZones.forEach((zone) => {
            zone.warehouses?.forEach((warehouse) => {
              warehouseIdsInShippingZones.add(warehouse.id);
            });
          });

          // Check if ANY warehouse with stock is ALSO in a shipping zone AND assigned to this channel
          const hasReachableStock = Array.from(warehouseIdsWithStock).some(
            (warehouseId) =>
              warehouseIdsInShippingZones.has(warehouseId) &&
              channelWarehouseIds.has(warehouseId),
          );

          // If there are warehouses with stock but NONE are reachable, show error
          if (warehouseIdsWithStock.size > 0 && !hasReachableStock) {
            issues.push({
              severity: "warning",
              type: "stock-unreachable",
              message: t(
                "marketplace.configuration.channel-availability.stock-unreachable",
                {
                  channelName,
                },
              ),
            });
          }
        }
      }
    } else if (listing.isPublished) {
      // Product is published but has no variants (for products that should have variants)
      // This is already covered by hasMissingVariants check above
      // But we also check product-level pricing as fallback
      if (
        listing.pricing?.priceRange?.start?.gross &&
        (!listing.pricing.priceRange.start.gross.amount ||
          listing.pricing.priceRange.start.gross.amount === 0)
      ) {
        issues.push({
          severity: "error",
          type: "pricing",
          message: t(
            "marketplace.configuration.channel-availability.no-price-set",
          ),
        });
      }
    }

    return issues;
  };

  // Calculate total issues count, separating problems (errors) from warnings
  const { totalProblems, totalWarnings } = useMemo(() => {
    let problems = 0;
    let warnings = 0;

    availableChannels.forEach((channel) => {
      const issues = getChannelIssues(channel.id);

      issues.forEach((issue) => {
        if (issue.severity === "error") {
          problems++;
        } else {
          warnings++;
        }
      });
    });

    return { totalProblems: problems, totalWarnings: warnings };
  }, [availableChannels, channels, product, hasMissingVariants]);

  // Filter channels based on search query (must be called unconditionally)
  const filteredChannels = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();

    if (!query) {
      return availableChannels.sort((a, b) => a.name.localeCompare(b.name));
    }

    return availableChannels
      .filter(
        (channel) =>
          channel.name.toLowerCase().includes(query) ||
          channel.currencyCode.toLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableChannels, debouncedSearch]);

  // Now we can do conditional returns after all hooks have been called
  if (disabledReason === "no-product-type") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("marketplace.configuration.channel-availability.availability")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t(
              "marketplace.configuration.channel-availability.option-no-product-type",
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (disabledReason === "has-variants") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("marketplace.configuration.channel-availability.availability")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t(
              "marketplace.configuration.channel-availability.option-has-variants",
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Collection variant: only channels selected in Manage modal, Visible/Hidden + optional publication date
  if (variant === "collection") {
    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) {
        return "";
      }

      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return "";
      }
    };

    // Show only channels that have an entry in channelAvailability (selected in Manage modal)
    const collectionDisplayChannels = channels.filter(
      (channel) => channelAvailability[channel.id] !== undefined,
    );
    const configuredCount = collectionDisplayChannels.length;

    // Filter by search (same logic as product)
    const query = debouncedSearch.toLowerCase().trim();
    const collectionFilteredChannels = query
      ? collectionDisplayChannels
          .filter(
            (channel) =>
              channel.name.toLowerCase().includes(query) ||
              channel.currencyCode.toLowerCase().includes(query),
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      : [...collectionDisplayChannels].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

    type CollectionEntry =
      CollectionChannelAvailabilityFormValues["channelAvailability"][string];

    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {t(
                    "marketplace.configuration.channel-availability.availability",
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "marketplace.configuration.channel-availability.in-channels",
                    {
                      configured: String(configuredCount),
                      total: String(channels.length),
                    },
                  )}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManageModalOpen(true)}
              >
                {t("marketplace.configuration.channel-availability.manage")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search input (same as product) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t(
                  "marketplace.configuration.channel-availability.search-placeholder",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {collectionDisplayChannels.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t(
                  "marketplace.configuration.channel-availability.no-channels-selected-collection",
                )}
              </div>
            ) : collectionFilteredChannels.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t(
                  "marketplace.configuration.channel-availability.no-channels-found-matching",
                  { query: searchQuery },
                )}
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {collectionFilteredChannels.map((channel) => {
                  const entry = channelAvailability[channel.id] as
                    | CollectionEntry
                    | undefined;
                  const isPublished = entry?.isPublished ?? false;
                  const publishedAt = entry?.publishedAt;
                  const hasPublicationDate = Boolean(publishedAt);
                  const visibleLabel = hasPublicationDate
                    ? t(
                        "marketplace.configuration.channel-availability.visible-since",
                        { date: formatDate(publishedAt) },
                      )
                    : t(
                        "marketplace.configuration.channel-availability.visible",
                      );

                  return (
                    <AccordionItem
                      key={channel.id}
                      value={channel.id}
                      className="mb-2 rounded-lg border data-[state=open]:border-primary"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex w-full items-center justify-between pr-4">
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {channel.currencyCode}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-4 pt-2">
                          <RadioGroup
                            value={isPublished ? "visible" : "hidden"}
                            onValueChange={(value) => {
                              setValue(
                                `channelAvailability.${channel.id}.isPublished`,
                                value === "visible",
                              );
                              if (value === "visible") {
                                setValue(
                                  `channelAvailability.${channel.id}.publishedAt`,
                                  undefined,
                                );
                                setValue(
                                  `channelAvailability.${channel.id}.setPublicationDate`,
                                  false,
                                );
                              }
                            }}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="visible"
                                id={`${channel.id}-visible`}
                              />
                              <Label
                                htmlFor={`${channel.id}-visible`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {visibleLabel}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="hidden"
                                id={`${channel.id}-hidden`}
                              />
                              <Label
                                htmlFor={`${channel.id}-hidden`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {t(
                                  "marketplace.configuration.channel-availability.hidden",
                                )}
                              </Label>
                            </div>
                          </RadioGroup>
                          {!isPublished && (
                            <div className="flex items-center space-x-2">
                              <CheckboxField
                                name={`channelAvailability.${channel.id}.setPublicationDate`}
                                label={t(
                                  "marketplace.configuration.channel-availability.set-publication-date",
                                )}
                              />
                            </div>
                          )}
                          {!isPublished &&
                            watch(
                              `channelAvailability.${channel.id}.setPublicationDate`,
                            ) && (
                              <div className="grid gap-2">
                                <Label
                                  htmlFor={`${channel.id}-publishedAt`}
                                  className="text-sm"
                                >
                                  {t(
                                    "marketplace.configuration.channel-availability.publication-date",
                                  )}
                                </Label>
                                <Input
                                  type="datetime-local"
                                  id={`${channel.id}-publishedAt`}
                                  {...register(
                                    `channelAvailability.${channel.id}.publishedAt`,
                                  )}
                                  defaultValue={
                                    publishedAt
                                      ? new Date(publishedAt)
                                          .toISOString()
                                          .slice(0, 16)
                                      : new Date().toISOString().slice(0, 16)
                                  }
                                  onChange={(e) => {
                                    setValue(
                                      `channelAvailability.${channel.id}.publishedAt`,
                                      e.target.value,
                                    );
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <ManageChannelAvailabilityModal
          channels={channels}
          open={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          variant="collection"
        />
      </>
    );
  }

  // Product variant: Manage modal, search, accordion, issues
  // Count channels with availability configured (regardless of published status)
  const configuredChannelsCount = availableChannels.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {t(
                  "marketplace.configuration.channel-availability.availability",
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "marketplace.configuration.channel-availability.in-channels",
                  {
                    configured: String(configuredChannelsCount),
                    total: String(
                      totalChannelsCount ?? configuredChannelsCount,
                    ),
                  },
                )}
              </CardDescription>
              {isEditPage && (totalProblems > 0 || totalWarnings > 0) && (
                <div className="mt-1 text-sm text-destructive">
                  {totalProblems > 0 && (
                    <span>
                      {t(
                        "marketplace.configuration.channel-availability.problem-count",
                        { count: totalProblems },
                      )}
                    </span>
                  )}
                  {totalProblems > 0 && totalWarnings > 0 && <span>, </span>}
                  {totalWarnings > 0 && (
                    <span className="text-orange-500">
                      {t(
                        "marketplace.configuration.channel-availability.warning-count",
                        { count: totalWarnings },
                      )}{" "}
                      {t(
                        "marketplace.configuration.channel-availability.found",
                      )}
                    </span>
                  )}
                  {totalProblems > 0 && totalWarnings === 0 && (
                    <span>
                      {" "}
                      {t(
                        "marketplace.configuration.channel-availability.found",
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManageModalOpen(true)}
            >
              {t("marketplace.configuration.channel-availability.manage")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(
                "marketplace.configuration.channel-availability.search-placeholder",
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {availableChannels.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t(
                "marketplace.configuration.channel-availability.no-channels-selected-product",
              )}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t(
                "marketplace.configuration.channel-availability.no-channels-found-matching",
                { query: searchQuery },
              )}
            </div>
          ) : (
            <TooltipProvider delayDuration={300}>
              <Accordion
                type={isEditPage ? "single" : "multiple"}
                className="w-full"
                {...(isEditPage && { collapsible: true })}
              >
                {filteredChannels.map((channel) => {
                  const published = watch(
                    `channelAvailability.${channel.id}.isPublished`,
                  );
                  const availableForPurchase =
                    watch(
                      `channelAvailability.${channel.id}.isAvailableForPurchase`,
                    ) ?? false;
                  const visibleInListings =
                    watch(
                      `channelAvailability.${channel.id}.visibleInListings`,
                    ) ?? true;
                  const issues = getChannelIssues(channel.id);
                  const hasIssues = issues.length > 0;

                  return (
                    <AccordionItem
                      key={channel.id}
                      value={channel.id}
                      className="mb-2 rounded-lg border data-[state=open]:border-primary"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex w-full items-center justify-between pr-4">
                          <div className="flex items-center gap-2">
                            {isEditPage && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      hasIssues
                                        ? "bg-destructive/80"
                                        : published
                                          ? "bg-green-500"
                                          : "bg-muted-foreground/50",
                                      "h-2 w-2 shrink-0 rounded-full",
                                    )}
                                    aria-label={
                                      hasIssues
                                        ? t(
                                            "marketplace.configuration.channel-availability.channel-has-issues",
                                          )
                                        : published
                                          ? t(
                                              "marketplace.configuration.channel-availability.channel-is-published",
                                            )
                                          : t(
                                              "marketplace.configuration.channel-availability.channel-not-published",
                                            )
                                    }
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {hasIssues
                                    ? t(
                                        "marketplace.configuration.channel-availability.channel-has-issues-tooltip",
                                      )
                                    : published
                                      ? t(
                                          "marketplace.configuration.channel-availability.channel-is-published",
                                        )
                                      : t(
                                          "marketplace.configuration.channel-availability.channel-not-published",
                                        )}
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <div className="font-medium">{channel.name}</div>
                            {hasIssues && (
                              <>
                                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive/80" />
                                <span className="text-xs text-destructive/80">
                                  {issues.length}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {channel.currencyCode}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-4 pt-2">
                          {isEditPage && hasIssues && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                              <span className="font-medium text-green-600">
                                {t(
                                  "marketplace.configuration.channel-availability.issues",
                                )}
                              </span>
                              <span className="text-muted-foreground">
                                {t(
                                  "marketplace.configuration.channel-availability.has-availability-issues",
                                )}
                              </span>
                            </div>
                          )}
                          {isEditPage ? (
                            <>
                              {/* Published Toggle */}
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-sm font-medium">
                                    {t(
                                      "marketplace.configuration.channel-availability.published",
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {published
                                      ? t(
                                          "marketplace.configuration.channel-availability.published-description-visible",
                                        )
                                      : t(
                                          "marketplace.configuration.channel-availability.published-description-hidden",
                                        )}
                                  </p>
                                </div>
                                <Controller
                                  control={control}
                                  name={`channelAvailability.${channel.id}.isPublished`}
                                  render={({ field }) => (
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={field.value}
                                      onClick={() => {
                                        const newValue = !field.value;

                                        field.onChange(newValue);
                                        if (!newValue) {
                                          setValue(
                                            `channelAvailability.${channel.id}.isAvailableForPurchase`,
                                            false,
                                          );
                                          setValue(
                                            `channelAvailability.${channel.id}.visibleInListings`,
                                            false,
                                          );
                                        }
                                      }}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                                        field.value
                                          ? "bg-primary"
                                          : "bg-muted-foreground/30"
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                          field.value
                                            ? "translate-x-5"
                                            : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  )}
                                />
                              </div>

                              {/* Available for purchase Toggle */}
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-sm font-medium">
                                    {t(
                                      "marketplace.configuration.channel-availability.available-for-purchase",
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {availableForPurchase
                                      ? t(
                                          "marketplace.configuration.channel-availability.available-for-purchase-on",
                                        )
                                      : t(
                                          "marketplace.configuration.channel-availability.available-for-purchase-off",
                                        )}
                                  </p>
                                </div>
                                <Controller
                                  control={control}
                                  name={`channelAvailability.${channel.id}.isAvailableForPurchase`}
                                  render={({ field }) => (
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={field.value ?? false}
                                      onClick={() => {
                                        field.onChange(!field.value);
                                      }}
                                      disabled={!published}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                                        (field.value ?? false)
                                          ? "bg-primary"
                                          : "bg-muted-foreground/30"
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                          (field.value ?? false)
                                            ? "translate-x-5"
                                            : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  )}
                                />
                              </div>

                              {/* Show in listings Toggle */}
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-sm font-medium">
                                    {t(
                                      "marketplace.configuration.channel-availability.show-in-listings",
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {visibleInListings
                                      ? t(
                                          "marketplace.configuration.channel-availability.show-in-listings-on",
                                        )
                                      : t(
                                          "marketplace.configuration.channel-availability.show-in-listings-off",
                                        )}
                                  </p>
                                </div>
                                <Controller
                                  control={control}
                                  name={`channelAvailability.${channel.id}.visibleInListings`}
                                  render={({ field }) => {
                                    const isChecked = field.value !== false;

                                    return (
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isChecked}
                                        onClick={() => {
                                          field.onChange(!field.value);
                                        }}
                                        disabled={!published}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                                          isChecked
                                            ? "bg-primary"
                                            : "bg-muted-foreground/30"
                                        }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                            isChecked
                                              ? "translate-x-5"
                                              : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                    );
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <RadioGroup
                                value={
                                  published ? "published" : "not-published"
                                }
                                onValueChange={(value) => {
                                  setValue(
                                    `channelAvailability.${channel.id}.isPublished`,
                                    value === "published",
                                  );
                                  if (value === "not-published") {
                                    setValue(
                                      `channelAvailability.${channel.id}.isAvailableForPurchase`,
                                      false,
                                    );
                                    setValue(
                                      `channelAvailability.${channel.id}.visibleInListings`,
                                      false,
                                    );
                                  }
                                }}
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="published"
                                    id={`${channel.id}-published`}
                                  />
                                  <Label
                                    htmlFor={`${channel.id}-published`}
                                    className="cursor-pointer text-sm font-normal"
                                  >
                                    {t(
                                      "marketplace.configuration.channel-availability.published",
                                    )}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="not-published"
                                    id={`${channel.id}-not-published`}
                                  />
                                  <Label
                                    htmlFor={`${channel.id}-not-published`}
                                    className="cursor-pointer text-sm font-normal"
                                  >
                                    {t(
                                      "marketplace.configuration.channel-availability.not-published",
                                    )}
                                  </Label>
                                </div>
                              </RadioGroup>

                              {!published && (
                                <>
                                  <hr />
                                  <div className="flex items-center gap-2">
                                    <Controller
                                      control={control}
                                      name={`channelAvailability.${channel.id}.visibleInListings`}
                                      render={({ field }) => (
                                        <Checkbox
                                          checked={!field.value}
                                          onCheckedChange={(checked) => {
                                            field.onChange(!checked);
                                          }}
                                          id={`${channel.id}-hide-in-listings`}
                                        />
                                      )}
                                    />
                                    <Label
                                      htmlFor={`${channel.id}-hide-in-listings`}
                                      className="cursor-pointer text-sm font-normal leading-none"
                                    >
                                      {t(
                                        "marketplace.configuration.channel-availability.hide-in-listings",
                                      )}
                                    </Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {t(
                                      "marketplace.configuration.channel-availability.hide-in-listings-description",
                                    )}
                                  </p>
                                </>
                              )}
                            </>
                          )}
                          {hasIssues && (
                            <>
                              <div className="border-t pt-4">
                                <div className="mb-3 text-sm font-medium">
                                  {t(
                                    "marketplace.configuration.channel-availability.delivery-configuration",
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {issues.map((issue, idx) => {
                                    // Use different icons and colors based on issue type and severity
                                    let IssueIcon = AlertTriangle;
                                    let iconColor: string;
                                    let textColor: string;

                                    if (issue.type === "missing-variants") {
                                      IssueIcon = Package;
                                      iconColor = "text-destructive";
                                      textColor = "text-destructive";
                                    } else if (issue.severity === "warning") {
                                      // Warnings (stock, hidden from listings) use orange
                                      IssueIcon = AlertCircle;
                                      iconColor = "text-orange-500";
                                      textColor = "text-orange-500";
                                    } else {
                                      // Errors use red/destructive color
                                      IssueIcon = AlertTriangle;
                                      iconColor = "text-destructive";
                                      textColor = "text-destructive";
                                    }

                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-start gap-2 text-sm ${textColor}`}
                                      >
                                        <IssueIcon
                                          className={`h-4 w-4 ${iconColor} mt-0.5 shrink-0`}
                                        />
                                        <span>{issue.message}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      <ManageChannelAvailabilityModal
        channels={allChannels ?? channels}
        open={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  );
}
