import { useFormContext, useWatch } from "react-hook-form";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";

import { type ConfigFormInput } from "@/apps/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

import { emptyConfig } from "../constants";
import { ConfigFields } from "./config-fields";

export const ChannelList = ({
  channels,
  defaultChannelName,
  disabled,
  overrides,
}: {
  channels: ConfigFormData["channels"];
  defaultChannelName: string;
  disabled: boolean;
  overrides: ConfigFormData["config"]["channelOverrides"];
}) => {
  const { setValue, unregister } = useFormContext<ConfigFormInput>();
  const channelOverrides = useWatch<ConfigFormInput, "channelOverrides">({
    name: "channelOverrides",
  });

  if (!channels.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {defaultChannelName} is the only channel in this Saleor.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-md border">
      {channels.map(({ currency, name, slug }) => {
        const isOverridden = !!channelOverrides?.[slug];

        return (
          <li className="flex flex-col gap-4 p-4" key={slug}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium leading-tight">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {slug} · {currency}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className="max-w-56 truncate"
                  variant={isOverridden ? "default" : "secondary"}
                  // A long channel name would otherwise stretch the row.
                  title={isOverridden ? undefined : defaultChannelName}
                >
                  {isOverridden ? "Own keys" : `Inherits ${defaultChannelName}`}
                </Badge>
                <Button
                  disabled={disabled}
                  onClick={() =>
                    isOverridden
                      ? unregister(`channelOverrides.${slug}`)
                      : setValue(`channelOverrides.${slug}`, emptyConfig(), {
                          shouldDirty: true,
                        })
                  }
                  size="sm"
                  type="button"
                  variant={isOverridden ? "ghost" : "outline"}
                >
                  {isOverridden ? "Use default" : "Override"}
                </Button>
              </div>
            </div>

            {isOverridden && (
              <ConfigFields
                config={overrides[slug]}
                disabled={disabled}
                name={`channelOverrides.${slug}`}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
