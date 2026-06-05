"use client";

import { useEffect } from "react";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";

const tracking = getTrackingService();

type Props = {
  items: SearchProduct[];
  listId: string;
  listName: string;
};

/**
 * Fires a GA4 `view_item_list` impression event when a product list is
 * rendered. Re-fires when the list identity or its contents change (e.g. a new
 * search query or page), keyed on the joined item ids to avoid duplicate
 * events on unrelated re-renders.
 */
export const ViewListItemTracker = ({ items, listId, listName }: Props) => {
  const itemsKey = items.map((item) => item.id).join(",");

  useEffect(() => {
    if (!items.length) {
      return;
    }

    void tracking.trackViewListItem({ items, listId, listName });
  }, [listId, itemsKey]);

  return null;
};
