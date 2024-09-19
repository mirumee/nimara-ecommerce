import { Skeleton } from "@nimara/ui/components/skeleton";

export const CheckoutSkeleton = () => {
  return (
    <>
      <Skeleton className="h-24 w-full" />
      <hr className="border-stone-200" />
      <Skeleton className="h-24 w-full" />
      <hr className="border-stone-200" />
      <Skeleton className="h-24 w-full" />
      <hr className="border-stone-200" />
      <Skeleton className="h-24 w-full" />
    </>
  );
};

CheckoutSkeleton.displayName = "CheckoutSkeleton";
