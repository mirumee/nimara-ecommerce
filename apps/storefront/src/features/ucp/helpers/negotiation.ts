export type UcpCapabilityEntry = {
  extends?: string | string[];
  version: string;
};

export type UcpCapabilityRegistry = Record<string, UcpCapabilityEntry[]>;

export function extractProfileUrlFromUcpAgentHeader(
  ucpAgentHeader: string | null,
): string | null {
  if (!ucpAgentHeader) {
    return null;
  }

  const profileMatch = ucpAgentHeader.match(/profile="([^"]+)"/);

  return profileMatch?.[1] ?? null;
}

export function isValidUcpProfileUrl(profileUrl: string): boolean {
  try {
    const url = new URL(profileUrl);
    const allowHttp = process.env.NODE_ENV === "development";

    return (
      (url.protocol === "https:" || (allowHttp && url.protocol === "http:")) &&
      url.pathname.endsWith("/.well-known/ucp")
    );
  } catch {
    return false;
  }
}

function getHighestCommonVersion(
  businessVersions: string[],
  platformVersions: string[],
): string | null {
  const sharedVersions = businessVersions.filter((version) =>
    platformVersions.includes(version),
  );

  if (sharedVersions.length === 0) {
    return null;
  }

  return sharedVersions.sort((first, second) => second.localeCompare(first))[0];
}

function hasAtLeastOneParentInIntersection(
  parentCapabilityNames: string[],
  intersection: UcpCapabilityRegistry,
): boolean {
  return parentCapabilityNames.some((parentName) =>
    Object.hasOwn(intersection, parentName),
  );
}

export function negotiateCapabilities({
  businessCapabilities,
  platformCapabilities,
}: {
  businessCapabilities: UcpCapabilityRegistry;
  platformCapabilities: UcpCapabilityRegistry;
}): UcpCapabilityRegistry {
  const intersection: UcpCapabilityRegistry = {};

  for (const [capabilityName, businessEntries] of Object.entries(
    businessCapabilities,
  )) {
    const platformEntries = platformCapabilities[capabilityName];

    if (!platformEntries || platformEntries.length === 0) {
      continue;
    }

    const selectedVersion = getHighestCommonVersion(
      businessEntries.map((entry) => entry.version),
      platformEntries.map((entry) => entry.version),
    );

    if (!selectedVersion) {
      continue;
    }

    const selectedBusinessEntry = businessEntries.find(
      (entry) => entry.version === selectedVersion,
    );

    if (!selectedBusinessEntry) {
      continue;
    }

    intersection[capabilityName] = [
      {
        version: selectedVersion,
        ...(selectedBusinessEntry.extends
          ? { extends: selectedBusinessEntry.extends }
          : {}),
      },
    ];
  }

  let removedAnyExtension = true;

  while (removedAnyExtension) {
    removedAnyExtension = false;

    for (const [capabilityName, entries] of Object.entries(intersection)) {
      const extensionParents = entries[0]?.extends;

      if (!extensionParents) {
        continue;
      }

      const parents = Array.isArray(extensionParents)
        ? extensionParents
        : [extensionParents];

      if (!hasAtLeastOneParentInIntersection(parents, intersection)) {
        delete intersection[capabilityName];
        removedAnyExtension = true;
      }
    }
  }

  return intersection;
}
