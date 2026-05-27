#!/usr/bin/env node
// @ts-check
/**
 * Zero-config preflight for the storefront.
 *
 * Reports which features are currently ON/OFF based on env, and which variables
 * to set to enable the rest. Purely informational — always exits 0, never blocks
 * `dev`. Reads apps/storefront/.env (if present) merged with process.env.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(scriptDir, "..", ".env");

/** Minimal KEY=VALUE parser — good enough for a status report. */
const parseEnvFile = (path) => {
  if (!existsSync(path)) {
    return {};
  }

  /** @type {Record<string, string>} */
  const out = {};

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

const fileEnv = parseEnvFile(envPath);
// process.env wins over the file (matches how the dev server resolves env).
const env = { ...fileEnv, ...process.env };
const has = (key) => Boolean(env[key] && String(env[key]).trim() !== "");

/**
 * @type {{ name: string, on: boolean, hint: string }[]}
 */
const features = [
  {
    name: "Backend (Saleor)",
    on: has("NEXT_PUBLIC_SALEOR_API_URL"),
    hint: "set NEXT_PUBLIC_SALEOR_API_URL to your Saleor GraphQL endpoint",
  },
  {
    name: "Authenticated content",
    on: has("SALEOR_APP_TOKEN"),
    hint: "set SALEOR_APP_TOKEN to load unpublished CMS/vendor pages",
  },
  {
    name: "Customer login",
    on: has("AUTH_SECRET"),
    hint: "set AUTH_SECRET (e.g. `openssl rand -base64 32`)",
  },
  {
    name: "Checkout (Stripe)",
    on:
      has("NEXT_PUBLIC_PAYMENT_APP_ID") &&
      has("NEXT_PUBLIC_STRIPE_PUBLIC_KEY") &&
      has("STRIPE_SECRET_KEY"),
    hint: "set NEXT_PUBLIC_PAYMENT_APP_ID, NEXT_PUBLIC_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY",
  },
  {
    name: "Marketplace",
    on:
      has("NEXT_PUBLIC_MARKETPLACE_ENABLED") &&
      env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false",
    hint: "set NEXT_PUBLIC_MARKETPLACE_ENABLED=true",
  },
];

const ON = "\x1b[32m●  ON\x1b[0m";
const OFF = "\x1b[90m○ OFF\x1b[0m";
const pad = Math.max(...features.map((f) => f.name.length));

console.log("\nStorefront preflight — feature status");
console.log(
  existsSync(envPath)
    ? `(env: apps/storefront/.env + process.env)\n`
    : `(no apps/storefront/.env found — using process.env only)\n`,
);

for (const f of features) {
  const status = f.on ? ON : OFF;
  const suffix = f.on ? "" : `  → ${f.hint}`;

  console.log(`  ${status}  ${f.name.padEnd(pad)}${suffix}`);
}

if (!has("NEXT_PUBLIC_SALEOR_API_URL")) {
  console.log(
    "\nRunning in zero-config mode: pages render with empty data. " +
      "Copy apps/storefront/.env.example to apps/storefront/.env to connect a backend.",
  );
}

console.log("");

// Informational only.
process.exit(0);
