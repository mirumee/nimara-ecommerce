import { Skeleton } from "@nimara/ui/components/skeleton";

export const RelatedProductsSkeleton = () => {
  return (
    <div className="mt-10 space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <div className="flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-1/5" />
        ))}
      </div>
    </div>
  );
};
