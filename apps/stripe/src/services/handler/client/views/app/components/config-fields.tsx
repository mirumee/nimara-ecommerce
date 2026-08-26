import { TextFormField } from "@nimara/ui/components/textFormField";

import { type PaymentGatewayConfig } from "@/domain/app-config";

import { ConfigDetails } from "./config-details";

export const ConfigFields = ({
  config,
  disabled,
  name,
}: {
  config?: PaymentGatewayConfig;
  disabled: boolean;
  name: "default" | `channelOverrides.${string}`;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-4 sm:flex-row">
      <TextFormField
        autoComplete="off"
        disabled={disabled}
        isRequired
        label="Publishable key"
        name={`${name}.publicKey`}
        placeholder="pk_live_…"
      />
      <TextFormField
        autoComplete="off"
        disabled={disabled}
        isRequired={!config?.secretKey}
        label="Secret key"
        name={`${name}.secretKey`}
        placeholder={
          config?.secretKey
            ? "Leave blank to keep the current key"
            : "sk_live_…"
        }
      />
    </div>
    <ConfigDetails config={config} />
  </div>
);
