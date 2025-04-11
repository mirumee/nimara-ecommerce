import { Skeleton } from "@nimara/ui/components/skeleton";

import { range } from "@/lib/utils";

export const RelatedProductsSkeleton = () => {
  return (
    <div className="mt-10 space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <div className="flex space-x-4">
        {range(5).map((i) => (
          <Skeleton key={i} className="h-40 w-1/5" />
        ))}
      </div>
    </div>
  );
};
