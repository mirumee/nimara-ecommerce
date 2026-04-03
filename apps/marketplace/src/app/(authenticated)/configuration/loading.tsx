import { Card, CardContent, CardHeader } from "@nimara/ui/components/card";
import { Skeleton } from "@nimara/ui/components/skeleton";

export default function ConfigurationSegmentLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-72" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
