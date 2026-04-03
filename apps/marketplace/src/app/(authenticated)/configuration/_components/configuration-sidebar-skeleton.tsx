import { Skeleton } from "@nimara/ui/components/skeleton";

export function ConfigurationSidebarSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-shrink-0 border-b bg-white p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-3">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}
