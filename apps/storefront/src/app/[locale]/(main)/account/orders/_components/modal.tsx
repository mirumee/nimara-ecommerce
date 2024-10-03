"use client";

import { useTranslations } from "next-intl";

import type { Order } from "@nimara/domain/objects/Order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { ReturnProductsForm } from "../_forms/return-products-form";
import type { FormSchema } from "../_forms/schema";

export const ReturnProductsModal = ({
  order,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}) => {
  const t = useTranslations();

  const handleSubmit = (data: FormSchema) => {
    const selectedProducts = Object.entries(data.selectedLines)
      .filter(([_, isSelected]) => isSelected)
      .map(([lineId]) => order.lines.find((line) => line.id === lineId));

    console.log("Selected products:", selectedProducts);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("order.return-products")}</DialogTitle>
        </DialogHeader>
        <ReturnProductsForm
          order={order}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
