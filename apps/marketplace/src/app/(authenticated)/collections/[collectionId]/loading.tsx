import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader } from "@nimara/ui/components/card";
import { Skeleton } from "@nimara/ui/components/skeleton";

export default function CollectionDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Sticky header skeleton */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto mt-20 px-6 pb-6">
        <div className="flex w-full gap-4">
          {/* Left column — 2/3 */}
          <div className="flex grow basis-2/3 flex-col gap-4">
            {/* General info card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-36 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Background image card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full max-w-md rounded-lg" />
              </CardContent>
            </Card>

            {/* Assigned products card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <Skeleton className="h-10 w-10 flex-shrink-0 rounded" />
                    <div className="flex flex-1 items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column — 1/3 */}
          <div className="flex grow basis-1/3 flex-col gap-4">
            {/* Channel availability card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
