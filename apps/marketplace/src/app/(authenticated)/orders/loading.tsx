import { ListPageLoadingSkeleton } from "../_components/list-page-loading-skeleton";

export default function OrdersLoading() {
  return (
    <ListPageLoadingSkeleton
      columns={6}
      showActionButton
      showFilterButton
      showFooter
    />
  );
}
