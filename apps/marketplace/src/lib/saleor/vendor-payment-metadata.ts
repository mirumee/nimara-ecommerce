import { METADATA_KEYS } from "@/lib/saleor/consts";

export type MetadataItem = {
  key: string;
  value: string;
};

export type VendorPaymentMetadata = {
  paymentAccountConnected: boolean;
  paymentAccountId: string | null;
};

export function getVendorPaymentMetadata(
  metadata: MetadataItem[] | null | undefined,
): VendorPaymentMetadata {
  const metadataMap = new Map(
    (metadata ?? []).map((item) => [item.key, item.value]),
  );
  const paymentAccountId =
    metadataMap.get(METADATA_KEYS.PAYMENT_ACCOUNT_ID)?.trim() ?? "";
  const rawConnected =
    metadataMap.get(METADATA_KEYS.PAYMENT_ACCOUNT_CONNECTED) ?? "";
  const paymentAccountConnected =
    rawConnected.trim().toLowerCase() === "true" ||
    rawConnected.trim() === "1" ||
    rawConnected.trim().toLowerCase() === "yes";

  return {
    paymentAccountId: paymentAccountId.length > 0 ? paymentAccountId : null,
    paymentAccountConnected,
  };
}

export function mergeMetadata(
  existing: MetadataItem[] | null | undefined,
  patch: MetadataItem[],
): MetadataItem[] {
  const map = new Map((existing ?? []).map((item) => [item.key, item.value]));

  for (const item of patch) {
    map.set(item.key, item.value);
  }

  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}
