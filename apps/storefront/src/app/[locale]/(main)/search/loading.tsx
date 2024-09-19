import { Skeleton } from "@nimara/ui/components/skeleton";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";

export default function Loading() {
  return (
    <div className="w-full">
      <section className="mx-auto my-6 grid">
        <div className="my-8 flex h-4 items-center justify-between">
          <Skeleton className="h-10 w-1/5" />

          <div className="flex w-48 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {Array(DEFAULT_RESULTS_PER_PAGE)
            .fill(null)
            .map((_, idx) => (
              <Skeleton key={idx} className="aspect-square w-full" />
            ))}
        </div>
      </section>
    </div>
  );
}
