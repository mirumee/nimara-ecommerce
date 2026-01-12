import { StandardSearchViewSkeleton } from "@nimara/features/search/shop-basic-plp/standard";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";

export default function Loading() {
  return (
    <StandardSearchViewSkeleton
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
    />
  );
}
