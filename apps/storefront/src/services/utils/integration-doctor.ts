import { type ZodType } from "zod";

import { cmsMenuProviders } from "@nimara/infrastructure/cms-menu/select";
import { cmsPageProviders } from "@nimara/infrastructure/cms-page/select";
import type { Logger } from "@nimara/infrastructure/logging/types";
import { searchProviders } from "@nimara/infrastructure/search/select";

import type { Capability } from "@/services/capabilities";
import {
  resolveCMSProvider,
  resolveSearchProvider,
} from "@/services/integrations/resolve";

export type IntegrationReportRow = {
  capability: SwappableCapability;
  missing: string[];
  ok: boolean;
  selected: string | null;
};

type CapabilityEntry = {
  capability: Capability;
  providers: readonly { configSchema?: ZodType; id: string }[];
  resolve: () => string | null;
};

const CAPABILITIES = [
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
] as const satisfies readonly CapabilityEntry[];

/*
 * Derived from `CAPABILITIES` rather than hand-listed, so a typo in a caller is
 * a compile error instead of a silently false check that hides a surface. The
 * entries draw their names from `Capability`, so a doctor row and a loader log
 * always label the same capability the same way.
 */
export type SwappableCapability = (typeof CAPABILITIES)[number]["capability"];

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

/**
 * Emits one `critical` per capability whose selected provider is missing config,
 * when the service registry is built. It logs instead of throwing: a broken
 * search configuration must not take down checkout, and the loader degrades the
 * affected capability to its empty service on first use. Without this a missing
 * key stays invisible until a shopper reaches that capability, and the empty
 * service for a read capability answers with no data rather than an error.
 */
export const logIntegrationConfigIssues = (
  logger: Logger,
  env?: Record<string, string | undefined>,
): void => {
  for (const row of buildIntegrationReport(env)) {
    if (row.ok) {
      continue;
    }

    logger.critical("Selected provider is missing required configuration.", {
      capability: row.capability,
      provider: row.selected,
      missing: row.missing,
    });
  }
};

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
