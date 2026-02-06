import { Globe } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

export default async function ConfigurationChannelsPage() {
  const token = await getServerAuthToken();
  const result = await configurationService.getChannels(token);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load channels</p>
      </div>
    );
  }

  const channels = result.data.channels || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Channels & Warehouses
      </h1>

      {channels.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <p className="text-muted-foreground">
            Channels and warehouses configuration settings will be available here.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <p className="text-muted-foreground mb-6">
              Channels and warehouses configuration settings will be available here.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {channel.name}
                    </CardTitle>
                    {channel.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  <CardDescription>{channel.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency</span>
                      <span className="font-medium">{channel.currencyCode}</span>
                    </div>
                    {channel.defaultCountry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Default Country</span>
                        <span className="font-medium">
                          {channel.defaultCountry.country}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
