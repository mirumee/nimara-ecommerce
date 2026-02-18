import { z } from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { addressSchema } from "@nimara/foundation/address/address-form/schema";
import { type GetTranslations } from "@nimara/i18n/types";

interface Params {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
}

const baseShippingAddressSchema = (params: Params) => addressSchema(params);

export const createShippingAddressSchema = (params: Params) =>
  z.object({
    ...baseShippingAddressSchema(params).shape,
    saveForFutureUse: z.boolean(),
  });

export const updateShippingAddressSchema = (params: Params) =>
  baseShippingAddressSchema(params);

export const savedAddressSchema = z.object({ shippingAddressId: z.string() });

export type SavedAddressFormSchema = z.infer<typeof savedAddressSchema>;

export type UpdateShippingAddressSchema = z.infer<
  ReturnType<typeof updateShippingAddressSchema>
>;

export type CreateShippingAddressSchema = z.infer<
  ReturnType<typeof createShippingAddressSchema>
>;
