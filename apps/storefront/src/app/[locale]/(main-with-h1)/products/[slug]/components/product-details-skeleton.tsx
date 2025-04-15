import { Skeleton } from "@nimara/ui/components/skeleton";

export const ProductDetailsSkeleton = () => {
  return (
    <div className="my-6 grid gap-10 md:grid-cols-12 md:gap-4">
      <div className="relative max-md:hidden md:col-span-6 [&>*]:pb-2">
        <Skeleton className="h-[500px] w-full" />
      </div>

      <div className="md:hidden">
        <Skeleton className="h-[250px] w-full" />
      </div>

      <div className="md:col-span-5 md:col-start-8">
        <section className="sticky top-28 px-1 pt-10">
          <Skeleton className="mb-4 h-8 w-3/4" />

          <Skeleton className="mb-6 h-6 w-1/4" />

          <div className="mb-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          <Skeleton className="mb-6 h-12 w-full" />

          <Skeleton className="mb-4 h-20 w-full" />

          <Skeleton className="h-16 w-full" />
        </section>
      </div>
    </div>
  );
};
