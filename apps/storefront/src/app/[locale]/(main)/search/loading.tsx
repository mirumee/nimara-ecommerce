import { DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { StandardSearchViewSkeleton } from "@nimara/features/search/shop-basic-plp/standard";

export default function Loading() {
  return <StandardSearchViewSkeleton defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE} />;
}
