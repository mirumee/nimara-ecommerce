import { z } from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { addressSchema } from "@/components/address-form/schema";
import { type GetTranslations } from "@/types";

export const savedAddressSchema = z.object({ shippingAddressId: z.string() });

export const formSchema = ({
  addressFormRows,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
}) =>
  addressSchema({ addressFormRows, t }).merge(
    z.object({
      saveForFutureUse: z.boolean(),
    }),
  );

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
export type SavedAddressFormSchema = z.infer<typeof savedAddressSchema>;
