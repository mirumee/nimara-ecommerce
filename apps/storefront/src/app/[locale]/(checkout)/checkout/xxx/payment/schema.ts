import type { FieldPathValue } from "react-hook-form";
import { z } from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { addressSchema } from "@nimara/foundation/address/address-form/schema";
import { type GetTranslations } from "@nimara/i18n/types";

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
    billingAddress: z
      .object({
        id: z.string().optional(),
        ...addressSchema({ addressFormRows, t }).shape,
      })
      .optional(),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

export type BillingAddressPath = keyof Schema["billingAddress"];

export type BillingAddressValue = FieldPathValue<
  any,
  keyof Schema["billingAddress"]
>;
