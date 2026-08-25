export type SaleorMetadataItem = { key: string; value: string };

// Saleor delivers metadata as a list of key/value pairs.
export const serializeMetadataItems = (
  items: readonly SaleorMetadataItem[] | null | undefined,
): Record<string, string> =>
  Object.fromEntries((items ?? []).map(({ key, value }) => [key, value]));
