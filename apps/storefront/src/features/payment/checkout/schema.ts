import type { FieldPathValue } from "react-hook-form";
import { z } from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { addressSchema } from "@nimara/foundation/address/address-form/schema";
import { type GetTranslations } from "@nimara/i18n/types";

export const paymentSchema = ({
  addressFormRows,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
}) =>
  z.object({
    paymentMethod: z.string().optional(),
    sameAsShippingAddress: z.boolean(),
    saveForFutureUse: z.boolean(),
    saveAddressForFutureUse: z.boolean(),
    billingAddress: z
      .object({
        id: z.string().optional(),
        ...addressSchema({ addressFormRows, t }).shape,
      })
      .optional(),
  });

export type PaymentSchema = z.infer<ReturnType<typeof paymentSchema>>;

export type BillingAddressPath = keyof PaymentSchema["billingAddress"];

export type BillingAddressValue = FieldPathValue<
  any,
  keyof PaymentSchema["billingAddress"]
>;
