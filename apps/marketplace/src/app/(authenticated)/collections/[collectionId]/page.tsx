import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { collectionsService, configurationService } from "@/services";

import { CollectionDetailClient } from "./_components/collection-detail-client";

type PageProps = {
  params: Promise<{ collectionId: string }>;
};

export default async function CollectionDetailPage({ params }: PageProps) {
  const { collectionId: rawId } = await params;
  const collectionId = decodeURIComponent(rawId);
  const token = await getServerAuthToken();

  const [result, channelsResult] = await Promise.all([
    collectionsService.getCollection({ id: collectionId }, token),
    configurationService.getChannels(token),
  ]);

  if (!result.ok) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load collection</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result.data.collection) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Collection not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channels =
    channelsResult.ok && channelsResult.data.channels
      ? channelsResult.data.channels
      : [];

  return (
    <div className="[view-transition-name:main-content]">
      <CollectionDetailClient
        collection={result.data.collection}
        collectionId={collectionId}
        channels={channels}
      />
    </div>
  );
}
