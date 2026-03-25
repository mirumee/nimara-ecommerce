import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader } from "@nimara/ui/components/card";
import { Skeleton } from "@nimara/ui/components/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Sticky header skeleton */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto mt-20 px-6 pb-6">
        {/* Navigation tabs skeleton */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid w-full gap-4">
          <div className="flex w-full gap-4">
            {/* Left column — 2/3 */}
            <div className="flex grow basis-2/3 flex-col gap-4">
              {/* Product information card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-44" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Media card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="aspect-square w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>

              {/* Attributes card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="grid gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Variants card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </CardContent>
              </Card>

              {/* SEO card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — 1/3 */}
            <div className="flex grow basis-1/3 flex-col gap-4">
              {/* Organize product card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="grid gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>

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
    </div>
  );
}
