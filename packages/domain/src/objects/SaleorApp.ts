import { z } from "zod";

export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;

// The app owns the shape of `settings`; the record around it never varies.
export type SaleorAppInstallation<Settings> = SaleorAppConfig & {
  settings: Settings | null;
};

// Every installed Saleor, keyed by domain.
export const saleorAppInstallations = <Settings extends z.ZodType>(
  settings: Settings,
) =>
  z.record(
    z.string(),
    saleorAppConfig.extend({ settings: settings.nullable().default(null) }),
  );

// Every channel uses `default` until it is given an override of its own.
export type ChannelConfigSet<T> = {
  channelOverrides: Record<string, T>;
  default: T | null;
  defaultChannelSlug: string | null;
};

export const emptyChannelConfigSet = <T>(): ChannelConfigSet<T> => ({
  channelOverrides: {},
  default: null,
  defaultChannelSlug: null,
});

// `defaultChannelSlug` only says where the UI collects the default config.
export const channelConfigSet = <T extends z.ZodType>(config: T) =>
  z.object({
    channelOverrides: z.record(z.string(), config),
    default: config.nullable(),
    defaultChannelSlug: z.string().nullable(),
  });

export type SaleorAppWebhookManifest = {
  asyncEvents: string[];
  name: string;
  query: string;
  syncEvents: string[];
  targetUrl: string;
};

// Hand-written subset of Saleor's `Manifest` (domain stays codegen-free).
export type SaleorAppManifest = {
  about?: string;
  appUrl?: string;
  author?: string;
  brand?: {
    logo: {
      default: string;
    };
  };
  id: string;
  name: string;
  permissions: string[];
  tokenTargetUrl: string;
  version: string;
  webhooks: SaleorAppWebhookManifest[];
};
