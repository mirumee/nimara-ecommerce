import { type VendorProfile } from "@nimara/domain/objects/Marketplace";

import { type VendorProfileFragment } from "./graphql/fragments/generated";

export const vendorPageToProfile = (
  data: VendorProfileFragment,
): VendorProfile => {
  return {
    id: data.id,
    name: data.title,
  };
};
