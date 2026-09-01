import { TextFormField } from "@nimara/ui/components/textFormField";

import { type ChannelConfig } from "@/domain/app-config";

export const ConfigFields = ({
  config,
  disabled,
  name,
}: {
  config?: ChannelConfig;
  disabled: boolean;
  name: "default" | `channelOverrides.${string}`;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row">
    <TextFormField
      autoComplete="off"
      disabled={disabled}
      label="Public key"
      name={`${name}.publicKey`}
    />
    <TextFormField
      autoComplete="off"
      disabled={disabled}
      label="Secret key"
      name={`${name}.secretKey`}
      placeholder={
        config?.secretKey ? "Leave blank to keep the current key" : undefined
      }
    >
      {config?.secretKey && (
        <p className="text-sm text-muted-foreground">
          Current key: <span className="font-mono">{config.secretKey}</span>
        </p>
      )}
    </TextFormField>
  </div>
);
