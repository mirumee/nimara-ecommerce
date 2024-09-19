import type { FieldPathValue } from "react-hook-form";
import { z } from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { addressSchema } from "@/components/address-form/schema";
import { type GetTranslations } from "@/types";

export const schema = ({
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
    billingAddress: addressSchema({ addressFormRows, t })
      .merge(
        z.object({
          id: z.string().optional(),
        }),
      )
      .optional(),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

export type BillingAddressPath = keyof Schema["billingAddress"];

export type BillingAddressValue = FieldPathValue<
  any,
  keyof Schema["billingAddress"]
>;
