import type { Messages } from "next-intl";

import type { SupportedLocale } from "./config";
import enSharedCommon from "./messages/en/common.json";
import enMarketplace from "./messages/en/marketplace.json";
import enStorefront from "./messages/en/storefront.json";
import enGbSharedCommon from "./messages/en-GB/common.json";
import enGbMarketplace from "./messages/en-GB/marketplace.json";
import enGbStorefront from "./messages/en-GB/storefront.json";

type AppId = "storefront" | "marketplace";

type AnyMessages = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<TTarget extends AnyMessages, TSource extends AnyMessages>(
  target: TTarget,
  source: TSource,
): TTarget & TSource {
  const output: AnyMessages = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = output[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(
        targetValue as AnyMessages,
        sourceValue as AnyMessages,
      );
      continue;
    }

    output[key] = sourceValue;
  }

  return output as TTarget & TSource;
}

const BASE_SHARED = enSharedCommon as Messages;
const BASE_APP: Record<AppId, Messages> = {
  storefront: enStorefront as Messages,
  marketplace: enMarketplace as Messages,
};

const LOCALE_SHARED: Partial<Record<SupportedLocale, AnyMessages>> = {
  "en-GB": enGbSharedCommon as AnyMessages,
};

const LOCALE_APP: Partial<
  Record<SupportedLocale, Partial<Record<AppId, AnyMessages>>>
> = {
  "en-GB": {
    storefront: enGbStorefront as AnyMessages,
    marketplace: enGbMarketplace as AnyMessages,
  },
};

export async function loadMessages(
  locale: SupportedLocale,
  app: AppId,
): Promise<Messages> {
  const base = deepMerge(BASE_SHARED, BASE_APP[app]);
  const withLocaleShared = deepMerge(base, LOCALE_SHARED[locale] ?? {});
  const finalMessages = deepMerge(
    withLocaleShared,
    LOCALE_APP[locale]?.[app] ?? {},
  );

  return finalMessages;
}
