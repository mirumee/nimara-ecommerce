import { type PaymentGatewayConfig } from "@/domain/app-config";

const Row = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="break-all font-mono">{value}</dd>
  </>
);

// Derived from the secret key once saved, so shown rather than typed in.
export const ConfigDetails = ({
  config,
}: {
  config?: PaymentGatewayConfig;
}) => (
  <dl className="grid gap-x-4 gap-y-2 rounded-md border bg-muted/40 p-4 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">
    <Row label="Stripe account" value={config?.accountId ?? "—"} />
    <Row label="Secret key" value={config?.secretKey || "—"} />
    <Row
      label="Webhook endpoint"
      value={config?.webhookId ?? "Created on save"}
    />
    <Row
      label="Webhook signing secret"
      value={config?.webhookSecretKey ?? "—"}
    />
  </dl>
);
