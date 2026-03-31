import { Card, CardContent } from "@nimara/ui/components/card";
import { Skeleton } from "@nimara/ui/components/skeleton";

type ListPageLoadingSkeletonProps = {
  columns: number;
  showActionButton?: boolean;
  showFilterButton?: boolean;
  showFooter?: boolean;
};

export function ListPageLoadingSkeleton({
  columns,
  showActionButton = false,
  showFilterButton = false,
  showFooter = false,
}: ListPageLoadingSkeletonProps) {
  const rows = 5;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        {showActionButton ? <Skeleton className="h-10 w-32" /> : null}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <Skeleton className="h-10 w-64" />
            <div className="flex flex-1" />
            {showFilterButton ? <Skeleton className="h-10 w-28" /> : null}
          </div>

          <div className="border-t">
            <div
              className="grid gap-4 border-b px-4 py-3"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-24" />
              ))}
            </div>

            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4 border-b px-4 py-4 last:border-0"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-28" />
                ))}
              </div>
            ))}
          </div>

          {showFooter ? (
            <div className="flex items-center justify-between border-t p-4">
              <Skeleton className="h-8 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
