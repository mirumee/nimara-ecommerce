import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services";

import { NewCollectionClient } from "./_components/new-collection-client";

export default async function NewCollectionPage() {
  const token = await getServerAuthToken();
  const channelsResult = await configurationService.getChannels(token);

  const channels =
    channelsResult.ok && channelsResult.data.channels
      ? channelsResult.data.channels
      : [];

  return (
    <div className="[view-transition-name:main-content]">
      <NewCollectionClient channels={channels} />
    </div>
  );
}
