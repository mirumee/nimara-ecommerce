import times from "lodash/times";

import { Skeleton } from "@nimara/ui/components/skeleton";

type ShoppingBagSkeletonProps = {
  hasHeader?: boolean;
  hasTotal?: boolean;
};

export const ShoppingBagSkeleton = ({
  hasHeader,
  hasTotal,
}: ShoppingBagSkeletonProps) => {
  return (
    <div className="flex w-full flex-col">
      {hasHeader && <Skeleton className="h-[36px] w-96" />}

      <div className="flex flex-col gap-2 py-8">
        {times(2, (i) => (
          <div className="flex items-center gap-4" key={i}>
            <Skeleton className="aspect-square h-[56px]" />

            <div className="grow">
              <Skeleton className="h-5 w-2/5" />
            </div>

            <Skeleton className="h-5 w-1/5" />

            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-2/12" />
          <Skeleton className="h-5 w-1/12" />
        </div>

        {hasTotal && (
          <>
            <div className="flex justify-between">
              <Skeleton className="h-5 w-2/12" />
              <Skeleton className="h-5 w-1/12" />
            </div>
            <hr className="border-stone-200" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-2/12" />
              <Skeleton className="h-5 w-1/12" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
