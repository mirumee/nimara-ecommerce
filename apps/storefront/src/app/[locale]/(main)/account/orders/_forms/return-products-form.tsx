"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import type { Order } from "@nimara/domain/objects/Order";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { CheckboxField } from "@/components/form/checkbox-field";

import { type FormSchema, formSchema } from "./schema";

export const ReturnProductsForm = ({
  children,
  onCancel,
  order,
  orderLines,
}: {
  children: ReactNode;
  onCancel: () => void;
  order: Order;
  orderLines: ReactNode[];
}) => {
  const t = useTranslations();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      selectedLines: order?.lines.reduce(
        (acc, line) => {
          acc[line.id] = false;

          return acc;
        },
        {} as { [lineId: string]: boolean },
      ),
    },
  });

  const canSubmit = !form.formState.isSubmitting;

  const handleSubmit = (data: FormSchema) => {
    const selectedProducts = Object.entries(data.selectedLines)
      .filter(([_, isSelected]) => isSelected)
      .map(([lineId]) => order.lines.find((line) => line.id === lineId));

    console.log("Selected products:", selectedProducts);
    onCancel();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        {children}
        <div className="space-y-4">
          {order?.lines.map((line, index) => (
            <div key={line.id} className="flex items-center gap-4">
              <CheckboxField
                name={`selectedLines.${line.id}`}
                ariaLabel={`${line.productName} • ${line.variantName}`}
              />
              {orderLines[index]}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={!canSubmit} disabled={!canSubmit}>
            {t("order.make-return")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
