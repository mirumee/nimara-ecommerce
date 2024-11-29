"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import type { Order } from "@nimara/domain/objects/Order";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { ReturnProductsForm } from "../_forms/return-products-form";

export const ReturnProductsModal = ({
  children,
  order,
  orderLines,
}: {
  children: ReactNode;
  order: Order;
  orderLines: ReactNode[];
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("order.return-products")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">
            {t("order.return-products")}
          </DialogTitle>
        </DialogHeader>
        <ReturnProductsForm
          order={order}
          orderLines={orderLines}
          onCancel={() => setIsOpen(false)}
        >
          {children}
        </ReturnProductsForm>
      </DialogContent>
    </Dialog>
  );
};
