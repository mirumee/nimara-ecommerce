import { useFormContext, useFormState, useWatch } from "react-hook-form";

import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { type ConfigFormInput } from "@/apps/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

export const DefaultChannelSelect = ({
  channels,
  disabled,
}: {
  channels: ConfigFormData["channels"];
  disabled: boolean;
}) => {
  const { getValues, setValue, unregister } = useFormContext<ConfigFormInput>();
  const { errors } = useFormState<ConfigFormInput>({
    name: "defaultChannelSlug",
  });
  const defaultChannelSlug = useWatch<ConfigFormInput, "defaultChannelSlug">({
    name: "defaultChannelSlug",
  });

  const handleChange = (slug: string) => {
    const override = getValues(`channelOverrides.${slug}`);

    /**
     * Picking a channel that had its own config promotes it: those keys become
     * the ones everybody inherits, rather than asking for them again.
     */
    if (override) {
      setValue("default", override, { shouldDirty: true });
      unregister(`channelOverrides.${slug}`);
    }

    setValue("defaultChannelSlug", slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="defaultChannelSlug">Default channel</Label>
      <Select
        disabled={disabled}
        onValueChange={handleChange}
        value={defaultChannelSlug ?? ""}
      >
        <SelectTrigger id="defaultChannelSlug">
          <SelectValue placeholder="Select a channel" />
        </SelectTrigger>
        <SelectContent>
          {channels.map(({ currency, name, slug }) => (
            <SelectItem key={slug} value={slug}>
              {name} · {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.defaultChannelSlug && (
        <p className="text-sm font-medium text-destructive">
          {errors.defaultChannelSlug.message}
        </p>
      )}
    </div>
  );
};
