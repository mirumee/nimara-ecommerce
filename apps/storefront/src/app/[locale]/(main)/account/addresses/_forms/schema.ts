import * as z from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { addressSchema } from "@nimara/foundation/address/address-form/schema";
import type { GetTranslations } from "@nimara/foundation/i18n/types";

export const formSchema = ({
  addressFormRows,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
}) =>
  addressSchema({ addressFormRows, t }).merge(
    z.object({
      isDefaultShippingAddress: z.boolean(),
      isDefaultBillingAddress: z.boolean(),
    }),
  );

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
