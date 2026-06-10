"use client";

import { useEffect } from "react";

import { type Price } from "@nimara/domain/objects/common";
import { type Product } from "@nimara/domain/objects/Product";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";

const tracking = getTrackingService();

type Props = {
  price: Price;
  product: Product;
};

export const ViewItemTracker = ({ product, price }: Props) => {
  useEffect(() => {
    void tracking.trackViewItem({ product, price });
  }, []);

  return null;
};
