import { type ZodType } from "zod";

import { cmsMenuProviders } from "@nimara/infrastructure/cms-menu/select";
import { cmsPageProviders } from "@nimara/infrastructure/cms-page/select";
import { searchProviders } from "@nimara/infrastructure/search/select";

import {
  resolveCMSProvider,
  resolveSearchProvider,
} from "@/services/integrations/resolve";

export type IntegrationReportRow = {
  capability: string;
  missing: string[];
  ok: boolean;
  selected: string | null;
};

type CapabilityEntry = {
  capability: string;
  providers: readonly { configSchema?: ZodType; id: string }[];
  resolve: () => string | null;
};

const CAPABILITIES: CapabilityEntry[] = [
  {
    capability: "search",
    providers: searchProviders,
    resolve: resolveSearchProvider,
  },
  {
    capability: "cms-page",
    providers: cmsPageProviders,
    resolve: resolveCMSProvider,
  },
  {
    capability: "cms-menu",
    providers: cmsMenuProviders,
    resolve: resolveCMSProvider,
  },
];

/**
 * Reports, per swappable capability, which provider is selected and whether its
 * required (namespaced, server-side) env is present — derived from each
 * provider's `configSchema`, so there is no hand-maintained key list.
 */
export const buildIntegrationReport = (
  env: Record<string, string | undefined> = process.env,
): IntegrationReportRow[] =>
  CAPABILITIES.map(({ capability, providers, resolve }) => {
    const selected = resolve();

    if (!selected) {
      return { capability, missing: [], ok: true, selected: null };
    }

    const provider = providers.find((entry) => entry.id === selected);

    if (!provider?.configSchema) {
      return { capability, missing: [], ok: true, selected };
    }

    const result = provider.configSchema.safeParse(env);

    if (result.success) {
      return { capability, missing: [], ok: true, selected };
    }

    const missing = [
      ...new Set(result.error.issues.map((issue) => String(issue.path[0]))),
    ];

    return { capability, missing, ok: false, selected };
  });

/** Human-readable preflight report for the active integration configuration. */
export const formatIntegrationReport = (
  env?: Record<string, string | undefined>,
): string => {
  const lines = buildIntegrationReport(env).map((row) => {
    if (row.selected === null) {
      return `• ${row.capability}: empty service (no provider configured)`;
    }

    if (row.ok) {
      return `✓ ${row.capability}: ${row.selected}`;
    }

    return `✗ ${row.capability}: ${row.selected} — missing/invalid env: ${row.missing.join(", ")}`;
  });

  return ["Integration preflight", ...lines].join("\n");
};
