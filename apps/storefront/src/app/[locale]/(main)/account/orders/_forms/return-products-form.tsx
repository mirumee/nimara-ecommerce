"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import type { Order } from "@nimara/domain/objects/Order";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { CheckboxField } from "@/components/form/checkbox-field";

import { OrderLine } from "../_components/order-line";
import { OrderSummary } from "../_components/order-summary";
import { type FormSchema, formSchema } from "./schema";

export const ReturnProductsForm = ({
  order,
  onSubmit,
  onCancel,
}: {
  onCancel: () => void;
  onSubmit: (data: FormSchema) => void;
  order: Order;
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <OrderSummary order={order} />
        <div className="space-y-4">
          {order?.lines.map((line) => (
            <div key={line.id} className="flex items-center gap-4">
              <CheckboxField
                name={`selectedLines.${line.id}`}
                label={`${line.productName} • ${line.variantName}`}
              />
              <OrderLine line={line} />
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
