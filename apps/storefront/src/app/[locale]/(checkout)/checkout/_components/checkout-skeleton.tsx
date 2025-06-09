import { Skeleton } from "@nimara/ui/components/skeleton";

export const CheckoutSkeleton = () => (
  <>
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </>
);

CheckoutSkeleton.displayName = "CheckoutSkeleton";
