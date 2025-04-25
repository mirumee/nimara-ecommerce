"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import type { Order } from "@nimara/domain/objects/Order";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/form/checkbox-field";
import { isOrderLineReturned } from "@/lib/order";

import { returnProducts } from "./actions";
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
  const { toast } = useToast();

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

  const returnableLines = order?.lines.filter(
    (line) => !isOrderLineReturned(order, line),
  );

  const watchSelectedLines = form.watch("selectedLines");
  const isAnySelected = Object.values(watchSelectedLines).some(Boolean);

  const canSubmit = !form.formState.isSubmitting;

  const handleSubmit = async (data: FormSchema) => {
    const result = await returnProducts(data, order);

    if (result.ok) {
      toast({
        description: t("order.return-request-submitted"),
        position: "center",
      });
    } else {
      result.errors.map((error) => {
        toast({
          title: t(`errors.${error.code}`),
          description: error.message,
          variant: "destructive",
        });
      });
    }

    onCancel();

    return;
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
          {returnableLines.map((line, index) => (
            <div key={line.id} className="flex items-start gap-4">
              <CheckboxField
                name={`selectedLines.${line.id}`}
                ariaLabel={`${line.productName} • ${line.variantName}`}
                className="flex-shrink-0"
              />
              <div className="grid flex-grow grid-cols-4 gap-2 sm:grid-cols-12 sm:items-center">
                {orderLines[index]}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            loading={!canSubmit}
            disabled={!canSubmit || !isAnySelected}
          >
            {t("order.make-return")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
