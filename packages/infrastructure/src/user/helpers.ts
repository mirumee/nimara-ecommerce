import type { AddressInput, CountryCode } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";

import { pick } from "#root/lib/core";

export const addressToInput = ({
  country,
  ...address
}: Partial<Omit<Address, "id">>): AddressInput => ({
  // @ts-expect-error Dunno why it's complaining about country
  ...pick(address, ADDRESS_CORE_FIELDS),
  country: country?.code as CountryCode,
});
