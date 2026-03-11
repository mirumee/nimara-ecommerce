"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
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
import { ScrollArea } from "@nimara/ui/components/scroll-area";

import { useDebounce } from "@/hooks/use-debounce";

import type {
  AvailabilitySectionVariant,
  Channel,
  ChannelAvailabilityFormValues,
} from "./product-availability-section";

type ChannelAvailabilityRecord =
  ChannelAvailabilityFormValues["channelAvailability"];

type Props = {
  channels: Channel[];
  onClose: () => void;
  open: boolean;
  variant?: AvailabilitySectionVariant;
};

function copyChannelAvailability(
  source: ChannelAvailabilityRecord,
): ChannelAvailabilityRecord {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, { ...v }]),
  );
}

export function ManageChannelAvailabilityModal({
  channels,
  open,
  onClose,
  variant = "product",
}: Props) {
  const { watch, setValue } = useFormContext<ChannelAvailabilityFormValues>();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Form state (read-only while modal is open)
  const channelAvailability = watch("channelAvailability") ?? {};

  // Local draft: only applied to form on Confirm; Back/close discards it
  const [draftAvailability, setDraftAvailability] =
    useState<ChannelAvailabilityRecord>({});

  // When modal opens, initialize draft from current form state (only on open transition so we don't overwrite user edits)
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraftAvailability(copyChannelAvailability(channelAvailability));
    }
    prevOpenRef.current = open;
  }, [open, channelAvailability]);

  // Filter channels based on search query
  const filteredChannels = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();

    if (!query) {
      return [...channels].sort((a, b) => a.name.localeCompare(b.name));
    }

    return channels
      .filter(
        (channel) =>
          channel.name.toLowerCase().includes(query) ||
          channel.currencyCode.toLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, debouncedSearch]);

  // Get selected channel IDs from draft (channels that have an entry in draftAvailability)
  const selectedChannelIds = useMemo(() => {
    return new Set(
      channels
        .filter((channel) => draftAvailability[channel.id] !== undefined)
        .map((channel) => channel.id),
    );
  }, [channels, draftAvailability]);

  // Check if all filtered channels are selected
  const allFilteredSelected = useMemo(() => {
    if (filteredChannels.length === 0) {
      return false;
    }

    return filteredChannels.every((channel) =>
      selectedChannelIds.has(channel.id),
    );
  }, [filteredChannels, selectedChannelIds]);

  // Check if some (but not all) filtered channels are selected
  const someFilteredSelected = useMemo(() => {
    if (filteredChannels.length === 0) {
      return false;
    }
    const selectedCount = filteredChannels.filter((channel) =>
      selectedChannelIds.has(channel.id),
    ).length;

    return selectedCount > 0 && selectedCount < filteredChannels.length;
  }, [filteredChannels, selectedChannelIds]);

  const defaultChannelConfig = () =>
    variant === "collection"
      ? { isPublished: false, setPublicationDate: false }
      : {
          isPublished: false,
          isAvailableForPurchase: false,
          visibleInListings: false,
        };

  const handleSelectAll = (checked: boolean) => {
    setDraftAvailability((prev) => {
      const next = { ...prev };

      filteredChannels.forEach((channel) => {
        const channelId = channel.id;

        if (checked) {
          if (!next[channelId]) {
            next[channelId] = defaultChannelConfig();
          }
        } else {
          delete next[channelId];
        }
      });

      return next;
    });
  };

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    setDraftAvailability((prev) => {
      const next = { ...prev };

      if (checked) {
        if (!next[channelId]) {
          next[channelId] = defaultChannelConfig();
        }
      } else {
        delete next[channelId];
      }

      return next;
    });
  };

  const handleConfirm = () => {
    setValue(
      "channelAvailability",
      copyChannelAvailability(draftAvailability),
      {
        shouldValidate: false,
        shouldDirty: true,
      },
    );
    onClose();
  };

  const handleBack = () => {
    onClose();
  };

  // Reset search when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {variant === "collection"
              ? "Manage collection channel availability"
              : "Manage product channel availability"}
          </DialogTitle>
          <DialogDescription>
            {variant === "collection"
              ? "Select which channels to configure for this collection. Only selected channels will appear in the Availability section."
              : "Select which channels to configure for this product. Only selected channels will appear in the Availability section."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search through channels"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select All checkbox */}
          <div className="flex items-center space-x-2 border-b pb-3">
            <Checkbox
              id="select-all-channels"
              checked={allFilteredSelected}
              onCheckedChange={handleSelectAll}
            />
            <Label
              htmlFor="select-all-channels"
              className="cursor-pointer text-sm font-medium"
            >
              Select All Channels
              {someFilteredSelected && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (
                  {
                    filteredChannels.filter((ch) =>
                      selectedChannelIds.has(ch.id),
                    ).length
                  }{" "}
                  of {filteredChannels.length} selected)
                </span>
              )}
            </Label>
          </div>

          {/* Channels list */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Channels from A to Z
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {filteredChannels.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No channels found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredChannels.map((channel) => {
                    const isSelected = selectedChannelIds.has(channel.id);

                    return (
                      <div
                        key={channel.id}
                        className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`channel-${channel.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleChannelToggle(channel.id, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`channel-${channel.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {channel.currencyCode}
                          </div>
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
