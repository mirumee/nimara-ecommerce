export function parseVendorCustomerIds(
  rawValue: string | null | undefined,
): string[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function serializeVendorCustomerIds(customerIds: string[]): string {
  return JSON.stringify(normalizeVendorCustomerIds(customerIds));
}

export function mergeVendorCustomerIds(
  existingRawValue: string | null | undefined,
  customerId: string,
): { changed: boolean; value: string } {
  const normalizedCustomerId = customerId.trim();
  const existingIds = parseVendorCustomerIds(existingRawValue);
  const merged = normalizeVendorCustomerIds([
    ...existingIds,
    normalizedCustomerId,
  ]);
  const nextValue = JSON.stringify(merged);

  return {
    changed:
      nextValue !== JSON.stringify(normalizeVendorCustomerIds(existingIds)),
    value: nextValue,
  };
}

function normalizeVendorCustomerIds(customerIds: string[]): string[] {
  const sanitized = customerIds
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return [...new Set(sanitized)].sort((a, b) => a.localeCompare(b));
}
