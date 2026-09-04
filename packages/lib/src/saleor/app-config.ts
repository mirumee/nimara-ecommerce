import { type ChannelConfigSet } from "@nimara/domain/objects/SaleorApp";
import { maskString } from "@nimara/foundation/lib/security";

const MASKED_LENGTH = 25;
const VISIBLE_CHARS = 4;

/**
 * A secret never leaves the app in full. Every other field is returned as
 * stored, because only a secret needs hiding from whoever reads the form.
 */
export const maskChannelSecrets = <T extends Record<string, string>>({
  config,
  secretFields,
}: {
  config: T;
  secretFields: readonly (keyof T)[];
}): T => {
  const secret = new Set(secretFields);

  return Object.fromEntries(
    Object.entries(config).map(([field, value]) => [
      field,
      secret.has(field) && value
        ? maskString({
            maxLength: MASKED_LENGTH,
            str: value,
            visibleChars: VISIBLE_CHARS,
          })
        : value,
    ]),
  ) as T;
};

/**
 * A blank secret means "keep the stored one": the form only ever saw a mask,
 * so a blank field cannot mean "clear it". Every other field is taken as
 * submitted.
 */
export const withStoredSecrets = <T extends Record<string, string>>({
  incoming,
  secretFields,
  stored,
}: {
  incoming: T;
  secretFields: readonly (keyof T)[];
  stored: T | null | undefined;
}): T => {
  const secret = new Set(secretFields);

  return Object.fromEntries(
    Object.entries(incoming).map(([field, value]) => [
      field,
      secret.has(field) && !value ? (stored?.[field] ?? "") : value,
    ]),
  ) as T;
};

/**
 * Drops overrides for channels no longer in Saleor, and clears the default
 * channel once it is one of them: a renamed or removed channel leaves the
 * operator to pick again rather than saving keys against a ghost slug.
 */
export const pruneChannelConfigSet = <T>({
  channelSlugs,
  configSet,
}: {
  channelSlugs: string[];
  configSet: ChannelConfigSet<T>;
}): ChannelConfigSet<T> => {
  const known = new Set(channelSlugs);

  return {
    ...configSet,
    channelOverrides: Object.fromEntries(
      Object.entries(configSet.channelOverrides).filter(([slug]) =>
        known.has(slug),
      ),
    ),
    defaultChannelSlug:
      configSet.defaultChannelSlug && known.has(configSet.defaultChannelSlug)
        ? configSet.defaultChannelSlug
        : null,
  };
};
