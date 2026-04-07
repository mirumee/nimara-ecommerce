import { ListPageLoadingSkeleton } from "../_components/list-page-loading-skeleton";

export default function DraftsLoading() {
  return (
    <ListPageLoadingSkeleton
      columns={4}
      showActionButton
      showFilterButton
      showFooter
    />
  );
}
