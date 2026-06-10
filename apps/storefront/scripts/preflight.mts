/**
 * Storefront preflight.
 *
 * Interactive (TTY): a @clack/prompts wizard — pick a provider per swappable
 * capability, see the required env, and optionally write an example env file.
 * Non-interactive (CI / piped / `--report`): a read-only status report.
 *
 * Required env is derived from the REAL provider config schemas: this script is
 * run with `tsx`, so it imports the infrastructure provider manifests and uses
 * each provider's Zod `configSchema` to determine required/missing keys — no
 * hand-maintained list and no source-parsing heuristic.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cancel,
  confirm,
  intro,
  isCancel,
  multiselect,
  note,
  outro,
  select,
  text,
} from "@clack/prompts";

import { cmsPageProviders } from "@nimara/infrastructure/cms-page/select";
import { searchProviders } from "@nimara/infrastructure/search/select";

type SafeParseResult = {
  error?: { issues: { path: PropertyKey[] }[] };
  success: boolean;
};

type Provider = {
  configSchema?: { safeParse: (value: unknown) => SafeParseResult };
  id: string;
};

type Capability = {
  name: string;
  providers: readonly Provider[];
  selectVar: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(scriptDir, "..", ".env");

/** Minimal KEY=VALUE parser — good enough for a status report. */
const parseEnvFile = (path: string): Record<string, string> => {
  if (!existsSync(path)) {
    return {};
  }

  const out: Record<string, string> = {};

  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");

    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
};

const env: Record<string, string | undefined> = {
  ...parseEnvFile(envPath),
  ...process.env,
};
const has = (key: string) =>
  Boolean(env[key] && String(env[key]).trim() !== "");
const isProduction = env.NEXT_PUBLIC_ENVIRONMENT === "PRODUCTION";
const saleorConfigured = has("NEXT_PUBLIC_SALEOR_API_URL");

const CAPABILITIES: Capability[] = [
  { name: "Search", selectVar: "SEARCH_SERVICE", providers: searchProviders },
  {
    name: "CMS (pages + menus)",
    selectVar: "CMS_SERVICE",
    providers: cmsPageProviders,
  },
];

type EnvVar = { comment?: string; default?: string; key: string };

/**
 * A unit of non-provider configuration. `vars` are the env keys the feature
 * needs; provider env is derived separately from the Zod `configSchema`s, so
 * these catalogs never list provider keys (a duplicate is de-duped on write).
 *
 * One catalog drives all three surfaces: the interactive multiselect, the
 * generated env file (section per group), and the status report (`isOn`). Keep
 * it in sync with `apps/storefront/.env.example`, the human-facing doc.
 */
type FeatureGroup = {
  /** Core config — always written, never prompted, and not shown as a toggle. */
  always?: boolean;
  /** Reads as configured? Used for the status report ON/OFF row. */
  isOn: () => boolean;
  /** Section title in the env file and label in the report / wizard. */
  name: string;
  vars: EnvVar[];
};

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    name: "Core",
    always: true,
    isOn: () => true,
    vars: [
      {
        key: "NEXT_PUBLIC_ENVIRONMENT",
        default: "LOCAL",
        comment:
          "App environment. One of: TEST | LOCAL | DEVELOPMENT | STAGING | PRODUCTION.",
      },
      {
        key: "NEXT_PUBLIC_DEFAULT_CHANNEL",
        default: "default-channel",
        comment: "Saleor channel slug used for catalog/pricing.",
      },
      {
        key: "NEXT_PUBLIC_DEFAULT_EMAIL",
        comment:
          "Contact email shown in the UI. Defaults to contact@mirumee.com.",
      },
      {
        key: "NEXT_PUBLIC_STOREFRONT_URL",
        comment:
          "Public URL of this storefront. Defaults to the Vercel branch URL or localhost:3000.",
      },
      {
        key: "NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT",
        default: "AVIF",
        comment:
          "Image format served to clients. One of: AVIF | WEBP | ORIGINAL.",
      },
    ],
  },
  {
    name: "Backend (Saleor)",
    isOn: () => saleorConfigured,
    vars: [
      {
        key: "NEXT_PUBLIC_SALEOR_API_URL",
        comment:
          "Saleor GraphQL endpoint, e.g. https://your-store.saleor.cloud/graphql/",
      },
      {
        key: "SALEOR_APP_TOKEN",
        comment:
          "Server-only app token for authenticated reads (unpublished pages, vendor data).",
      },
    ],
  },
  {
    name: "Customer login",
    isOn: () => has("AUTH_SECRET"),
    vars: [
      {
        key: "AUTH_SECRET",
        comment: "next-auth session secret. Generate: openssl rand -base64 32",
      },
      {
        key: "AUTH_URL",
        comment:
          "Only required when NOT deploying on Vercel, e.g. https://my-store.com",
      },
    ],
  },
  {
    name: "Checkout (Stripe)",
    isOn: () =>
      has("NEXT_PUBLIC_PAYMENT_APP_ID") &&
      has("NEXT_PUBLIC_STRIPE_PUBLIC_KEY") &&
      has("STRIPE_SECRET_KEY"),
    vars: [
      {
        key: "NEXT_PUBLIC_PAYMENT_APP_ID",
        comment: "Stripe payment app id. All three keys are required together.",
      },
      { key: "NEXT_PUBLIC_STRIPE_PUBLIC_KEY" },
      { key: "STRIPE_SECRET_KEY" },
    ],
  },
  {
    name: "Marketplace",
    isOn: () =>
      has("NEXT_PUBLIC_MARKETPLACE_ENABLED") &&
      env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false",
    vars: [
      {
        key: "NEXT_PUBLIC_MARKETPLACE_ENABLED",
        default: "false",
        comment: "Multi-vendor behavior (cart limited to a single vendor).",
      },
      {
        key: "NEXT_PUBLIC_MARKETPLACE_VENDOR_URL",
        comment:
          "Public vendor portal URL (footer link). Empty hides the column.",
      },
    ],
  },
  {
    name: "Monitoring (Sentry)",
    isOn: () =>
      has("SENTRY_AUTH_TOKEN") && has("SENTRY_ORG") && has("SENTRY_PROJECT"),
    vars: [
      {
        key: "SENTRY_DSN",
        comment:
          "Sentry DSN. Enabled only when SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT are all set.",
      },
      { key: "SENTRY_AUTH_TOKEN" },
      { key: "SENTRY_ORG" },
      { key: "SENTRY_PROJECT" },
      { key: "SENTRY_DEBUG", default: "false" },
    ],
  },
];

const CORE_GROUPS = FEATURE_GROUPS.filter((group) => group.always);
const OPTIONAL_GROUPS = FEATURE_GROUPS.filter((group) => !group.always);

/**
 * Env keys the provider's Zod schema flags for the given candidate env
 * (missing or invalid). With `{}` this yields the provider's required keys.
 */
const issuesFor = (
  provider: Provider,
  candidate: Record<string, string | undefined>,
): string[] => {
  if (!provider.configSchema) {
    return [];
  }

  const result = provider.configSchema.safeParse(candidate);

  if (result.success || !result.error) {
    return [];
  }

  return [
    ...new Set(result.error.issues.map((issue) => String(issue.path[0]))),
  ];
};

const requiredKeys = (provider: Provider): string[] => issuesFor(provider, {});

const orderProviders = (providers: readonly Provider[]): Provider[] =>
  [...providers].sort((a, b) => {
    const rank = (id: string) => (id === "saleor" ? 0 : id === "dummy" ? 2 : 1);

    return rank(a.id) - rank(b.id) || a.id.localeCompare(b.id);
  });

/**
 * Builds the example env file: the chosen providers' selection + derived env,
 * then Core config and each opted-in feature group as a commented section. Keys
 * already emitted by a provider are not repeated.
 */
const renderEnvFile = (
  selections: { capability: Capability; provider: Provider }[],
  groups: FeatureGroup[],
): string => {
  const lines = [
    "# Generated by `pnpm preflight`",
    `# ${selections.map((s) => `${s.capability.selectVar}=${s.provider.id}`).join(", ")}`,
    "",
    "# --- Provider selection (server-side) ---",
    ...selections.map((s) => `${s.capability.selectVar}=${s.provider.id}`),
    "",
    "# --- Required env for the selected providers ---",
  ];

  const seen = new Set<string>();
  let providerKeyCount = 0;

  for (const { provider } of selections) {
    for (const key of requiredKeys(provider)) {
      if (!seen.has(key)) {
        seen.add(key);
        providerKeyCount += 1;
        lines.push(`${key}=`);
      }
    }
  }

  if (!providerKeyCount) {
    lines.push("# (selected providers need no extra env)");
  }

  for (const group of [...CORE_GROUPS, ...groups]) {
    const groupVars = group.vars.filter((envVar) => !seen.has(envVar.key));

    if (!groupVars.length) {
      continue;
    }

    lines.push("", `# --- ${group.name} ---`);

    for (const envVar of groupVars) {
      seen.add(envVar.key);

      if (envVar.comment) {
        lines.push(`# ${envVar.comment}`);
      }

      lines.push(`${envVar.key}=${envVar.default ?? ""}`);
    }
  }

  return lines.join("\n") + "\n";
};

// --- Non-interactive status report --------------------------------------------

const renderReport = (): void => {
  const ON = "\x1b[32m●  ON\x1b[0m";
  const OFF = "\x1b[90m○ OFF\x1b[0m";

  const features = OPTIONAL_GROUPS.map((group) => ({
    name: group.name,
    on: group.isOn(),
  }));

  const pad = Math.max(...features.map((f) => f.name.length));

  console.log("\nStorefront preflight — feature status\n");

  for (const feature of features) {
    console.log(`  ${feature.on ? ON : OFF}  ${feature.name.padEnd(pad)}`);
  }

  console.log("\nIntegrations (swappable providers)");

  const intPad = Math.max(...CAPABILITIES.map((c) => c.name.length));

  for (const capability of CAPABILITIES) {
    const label = capability.name.padEnd(intPad);
    const requested = env[capability.selectVar] || "saleor";
    const provider = capability.providers.find((p) => p.id === requested);

    if (!provider) {
      const allowed = capability.providers.map((p) => p.id).join(" | ");

      console.log(
        `  \x1b[33m⚠\x1b[0m  ${label}  ${capability.selectVar}="${requested}" unknown (expected: ${allowed})`,
      );
      continue;
    }

    if (requested === "saleor" && !saleorConfigured) {
      console.log(
        isProduction
          ? `  ${OFF}  ${label}  empty (Saleor unconfigured in production)`
          : `  \x1b[36m◐ DUMMY\x1b[0m  ${label}  sample data (set ${capability.selectVar})`,
      );
      continue;
    }

    const missing = issuesFor(provider, env);

    console.log(
      missing.length
        ? `  \x1b[31m✗ MISS\x1b[0m  ${label}  ${requested} — missing: ${missing.join(", ")}`
        : `  ${ON}  ${label}  ${requested}`,
    );
  }

  console.log(
    "\n\x1b[90mTip: run `pnpm preflight` in a terminal to pick providers interactively.\x1b[0m\n",
  );
};

// --- Interactive wizard -------------------------------------------------------

const exitIfCancelled = <T,>(value: T | symbol): T => {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  return value;
};

const runWizard = async (): Promise<void> => {
  intro("Nimara storefront — integration setup");

  const selections: { capability: Capability; provider: Provider }[] = [];

  for (const capability of CAPABILITIES) {
    const ordered = orderProviders(capability.providers);
    const choice = exitIfCancelled(
      await select({
        message: `${capability.name} provider`,
        initialValue: "saleor",
        options: ordered.map((provider) => ({
          value: provider.id,
          label: provider.id,
          hint: requiredKeys(provider).join(", ") || "no env required",
        })),
      }),
    );

    const provider = capability.providers.find((p) => p.id === choice);

    if (provider) {
      selections.push({ capability, provider });
    }
  }

  const chosenNames = exitIfCancelled(
    await multiselect({
      message: "Enable optional features (space to toggle, enter to confirm)",
      required: false,
      initialValues: ["Backend (Saleor)"],
      options: OPTIONAL_GROUPS.map((group) => ({
        value: group.name,
        label: group.name,
        hint: group.vars.map((envVar) => envVar.key).join(", "),
      })),
    }),
  );

  const chosenGroups = OPTIONAL_GROUPS.filter((group) =>
    chosenNames.includes(group.name),
  );

  const summarySeen = new Set<string>();
  const summaryLines: string[] = [];

  for (const { capability, provider } of selections) {
    summaryLines.push(`${capability.selectVar}=${provider.id}`);

    for (const key of requiredKeys(provider)) {
      if (!summarySeen.has(key)) {
        summarySeen.add(key);
        summaryLines.push(`${key}=  (required)`);
      }
    }
  }

  for (const group of [...CORE_GROUPS, ...chosenGroups]) {
    for (const envVar of group.vars) {
      if (!summarySeen.has(envVar.key)) {
        summarySeen.add(envVar.key);
        summaryLines.push(`${envVar.key}=${envVar.default ?? ""}`);
      }
    }
  }

  const summary = summaryLines.join("\n");

  note(summary, "Environment to write");

  const content = renderEnvFile(selections, chosenGroups);
  const defaultTarget = "apps/storefront/.env.local";
  const target =
    exitIfCancelled(
      await text({
        message: "Save example env file to (enter to accept default)",
        placeholder: defaultTarget,
        defaultValue: defaultTarget,
      }),
    ).trim() || defaultTarget;

  const absolute = resolve(process.cwd(), target);

  if (existsSync(absolute)) {
    const overwrite = exitIfCancelled(
      await confirm({
        message: `${target} exists — overwrite?`,
        initialValue: false,
      }),
    );

    if (!overwrite) {
      outro("Not written.");

      return;
    }
  }

  writeFileSync(absolute, content);
  outro(`✓ wrote ${target}`);
};

// --- Entry --------------------------------------------------------------------

const printBanner = (): void => {
  const art = [
    " ███╗   ██╗██╗███╗   ███╗ █████╗ ██████╗  █████╗",
    " ████╗  ██║██║████╗ ████║██╔══██╗██╔══██╗██╔══██╗",
    " ██╔██╗ ██║██║██╔████╔██║███████║██████╔╝███████║",
    " ██║╚██╗██║██║██║╚██╔╝██║██╔══██║██╔══██╗██╔══██║",
    " ██║ ╚████║██║██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██║",
    " ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝",
  ].join("\n");

  console.log(`\x1b[36m\n${art}\x1b[0m`);
  console.log("\x1b[90m  composable commerce — storefront preflight\x1b[0m");
};

printBanner();

const forceReport = process.argv.includes("--report");

if (!forceReport && process.stdin.isTTY) {
  await runWizard();
} else {
  renderReport();
}
