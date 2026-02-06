"use client";

import { useFormContext } from "react-hook-form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Channels } from "@/graphql/generated/client";
import { cn } from "@/lib/utils";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { Input } from "@nimara/ui/components/input";

import type { VariantUpdateFormValues } from "../schema";

export function VariantChannelListingSection({
  channels,
}: {
  channels: NonNullable<Channels["channels"]>;
}) {
  const form = useFormContext<VariantUpdateFormValues>();
  const channelListings = form.watch("channelListings") ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Availability & Pricing</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel Name</TableHead>
            <TableHead className="w-28 text-center">Availability</TableHead>
            <TableHead className="w-56">Selling Price</TableHead>
            <TableHead className="w-56">Cost Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel, index) => {
            const listing = channelListings[index];
            const available = listing?.isAvailableForPurchase ?? false;

            return (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell className="text-center">
                  <CheckboxField
                    name={`channelListings.${index}.isAvailableForPurchase`}
                    label=""
                  />
                </TableCell>
                <TableCell>
                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">
                      {channel.currencyCode}
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!available}
                      {...form.register(`channelListings.${index}.price`)}
                      className={cn(!available && "opacity-50")}
                      aria-label={`${channel.name} selling price`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">
                      {channel.currencyCode}
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!available}
                      {...form.register(`channelListings.${index}.costPrice`)}
                      className={cn(!available && "opacity-50")}
                      aria-label={`${channel.name} cost price`}
                    />
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

