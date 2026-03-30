import { VendorSearchViewSkeleton } from "@nimara/features/search/shop-basic-plp/vendor-standard";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";

export default function Loading() {
  return (
    <VendorSearchViewSkeleton
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
    />
  );
}
