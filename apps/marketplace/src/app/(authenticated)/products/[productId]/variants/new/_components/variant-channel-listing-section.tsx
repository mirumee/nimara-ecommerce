"use client";

import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@nimara/ui/components/checkbox";
import { Input } from "@nimara/ui/components/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Channels } from "@/graphql/generated/client";

import type { VariantCreateFormValues } from "../schema";

export function VariantChannelListingSection({
  channels,
}: {
  channels: NonNullable<Channels["channels"]>;
}) {
  const t = useTranslations();
  const form = useFormContext<VariantCreateFormValues>();
  const channelListings = form.watch("channelListings") ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">{t("common.pricing")}</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.channel-name")}</TableHead>
            <TableHead className="w-24">
              {t("marketplace.products.variants.pricing.available")}
            </TableHead>
            <TableHead className="w-56">{t("common.selling-price")}</TableHead>
            <TableHead className="w-56">{t("common.cost-price")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel, index) => {
            const listing = channelListings[index];

            return (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell>
                  <Controller
                    control={form.control}
                    name={`channelListings.${index}.isAvailableForPurchase`}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        aria-label={`${channel.name} available for purchase`}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("common.numeric-placeholder")}
                      defaultValue={listing?.price || "0.00"}
                      {...form.register(`channelListings.${index}.price`)}
                      className="pr-12"
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
                      placeholder={t("common.numeric-placeholder")}
                      defaultValue={listing?.costPrice || "0.00"}
                      {...form.register(`channelListings.${index}.costPrice`)}
                      className="pr-12"
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
    </div>
  );
}
