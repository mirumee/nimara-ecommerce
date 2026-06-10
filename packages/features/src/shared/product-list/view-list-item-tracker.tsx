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
