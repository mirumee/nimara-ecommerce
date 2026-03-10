import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@nimara/ui/components/card";

import type { Channels } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services";

import { OrderCreateClient } from "./_components/order-create-client";

type Channel = NonNullable<Channels["channels"]>[number];

export default async function OrderCreatePage() {
  const t = await getTranslations();
  const token = await getServerAuthToken();
  const channelsResult = await configurationService.getChannels(token);

  if (!channelsResult.ok) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("marketplace.shared.failed-to-load-channels")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const channels = (channelsResult.data.channels ?? []).filter(
    (c): c is Channel => Boolean(c),
  );

  return <OrderCreateClient channels={channels} />;
}
