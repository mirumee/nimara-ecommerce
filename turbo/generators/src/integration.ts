import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DEV_BOOTSTRAP } from "./config-provider.ts";
import { TEMPLATE_SERVICE } from "./names.ts";

const APP_SALEOR_PATHS = [
  ".graphqlrc.ts",
  "codegen.ts",
  "src/domain",
  "src/graphql",
  "src/infrastructure/saleor",
  "src/use-cases",
];

// A blank app never has a dashboard either, so nothing under api survives.
const SERVICE_SALEOR_PATHS = ["api", "logo.png"];

const isUnder = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export const isSaleorPath = (path: string) =>
  [
    ...APP_SALEOR_PATHS,
    ...SERVICE_SALEOR_PATHS.map(
      (servicePath) => `src/services/${TEMPLATE_SERVICE}/${servicePath}`,
    ),
  ].some((prefix) => isUnder(path, prefix));

const rewrite = async ({
  path,
  replacements,
}: {
  path: string;
  replacements: [from: string, to: string][];
}) => {
  let contents = await readFile(path, "utf8");

  for (const [from, to] of replacements) {
    if (!contents.includes(from)) {
      throw new Error(`Expected ${JSON.stringify(from)} in ${path}.`);
    }

    contents = contents.replace(from, to);
  }

  await writeFile(path, contents);
};

/**
 * All three services read the same `config.common.ts`; it lives under
 * `handler` only because handler always exists, not because it is handler's.
 * `entry-server.ts` is handler-only — a queue or event service has no
 * manifest to drop.
 */
export const blankVariants = (
  templateService: string,
): [source: string, destination: string][] => [
  ["src/container/index.blank.ts", "src/container/index.ts"],
  ["README.blank.md", "README.md"],
  [
    `src/services/${TEMPLATE_SERVICE}/config.common.ts`,
    `src/services/${templateService}/config.ts`,
  ],
  ...(templateService === TEMPLATE_SERVICE
    ? ([
        [
          `src/services/${templateService}/entry-server.blank.ts`,
          `src/services/${templateService}/entry-server.ts`,
        ],
      ] as [source: string, destination: string][])
    : []),
];

const CODEGEN_DEPENDENCIES = [
  "@graphql-codegen/cli",
  "@graphql-typed-document-node/core",
  "@nimara/codegen",
];

const removePackageIntegration = async (appDir: string) => {
  const path = join(appDir, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  };

  delete pkg.dependencies["@saleor/app-sdk"];

  for (const name of CODEGEN_DEPENDENCIES) {
    delete pkg.devDependencies[name];
  }

  delete pkg.scripts.codegen;

  await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`);
};

const removeEnvIntegration = (appDir: string) =>
  rewrite({
    path: join(appDir, ".env.example"),
    replacements: [
      [
        "# local | development | staging | production. Also the manifest app-id prefix.\nENVIRONMENT=local",
        "# local | development | staging | production.\nENVIRONMENT=local",
      ],
      [
        [
          "ENVIRONMENT=local",
          "",
          "# Comma-separated Saleor domains allowed to install the app, e.g.",
          "# store.saleor.cloud. Empty allows none. Wildcards (`*`, `*.saleor.cloud`)",
          "# widen it and belong in local development only.",
          "ALLOWED_DOMAINS=",
          "",
          "# Path prefix",
        ].join("\n"),
        ["ENVIRONMENT=local", "", "# Path prefix"].join("\n"),
      ],
      [
        [
          "SENTRY_DSN=",
          "",
          "# Key the config is stored under. Optional; defaults in code.",
          "APP_CONFIG_STORE_PATH=app-template-config",
          "",
          "# Optional: KMS key the store encrypts with. Empty uses the AWS default key.",
          "APP_CONFIG_ENCRYPTION_KEY=",
          "",
          "# The Saleor whose schema `pnpm codegen` generates the client from.",
          "NEXT_PUBLIC_SALEOR_API_URL=",
          "",
          "# LocalStack only.",
        ].join("\n"),
        ["SENTRY_DSN=", "", "# LocalStack only."].join("\n"),
      ],
    ],
  });

const removeTurboIntegration = (appDir: string) =>
  rewrite({
    path: join(appDir, "turbo.json"),
    replacements: [
      [
        [
          '      "env": [',
          '        "BUILD_TARGET",',
          '        "ENVIRONMENT",',
          '        "BASE_PATH",',
          '        "ALLOWED_DOMAINS",',
          '        "APP_CONFIG_STORE_PATH",',
          '        "APP_CONFIG_ENCRYPTION_KEY",',
          '        "SENTRY_DSN",',
          '        "SENTRY_ORG",',
          '        "SENTRY_PROJECT",',
          '        "SENTRY_DEBUG"',
          "      ],",
          '      "passThroughEnv": ["SENTRY_AUTH_TOKEN"]',
          "    },",
          '    "codegen": {',
          '      "outputs": ["src/graphql/generated/**"],',
          '      "inputs": ["src/**/*.graphql", "codegen.ts"],',
          '      "env": ["NEXT_PUBLIC_SALEOR_API_URL"]',
          "    }",
        ].join("\n"),
        [
          '      "env": [',
          '        "BUILD_TARGET",',
          '        "ENVIRONMENT",',
          '        "BASE_PATH",',
          '        "SENTRY_DSN",',
          '        "SENTRY_ORG",',
          '        "SENTRY_PROJECT",',
          '        "SENTRY_DEBUG"',
          "      ],",
          '      "passThroughEnv": ["SENTRY_AUTH_TOKEN"]',
          "    }",
        ].join("\n"),
      ],
    ],
  });

const removeVitestIntegration = (appDir: string) =>
  rewrite({
    path: join(appDir, "vitest.config.ts"),
    replacements: [
      [
        [
          "      // Enough for the app to boot in a test; a real value belongs in `.env`.",
          "      // `local` is what puts the config store on disk instead of in a cloud.",
          '      ENVIRONMENT: "local",',
          '      ALLOWED_DOMAINS: "saleor.example.com",',
          "      ...process.env,",
        ].join("\n"),
        [
          "      // Enough for the app to boot in a test; a real value belongs in `.env`.",
          '      ENVIRONMENT: "local",',
          "      ...process.env,",
        ].join("\n"),
      ],
    ],
  });

// No config store to bootstrap locally, on any target.
const removeDevServerIntegration = (appDir: string) =>
  rewrite({
    path: join(appDir, "src", "dev-server.ts"),
    replacements: [[DEV_BOOTSTRAP, ""]],
  });

// container/config/entry-server/README are swapped by copyTemplate, not rewritten here.
export const removeAppIntegration = async (appDir: string) => {
  await removePackageIntegration(appDir);
  await removeEnvIntegration(appDir);
  await removeTurboIntegration(appDir);
  await removeVitestIntegration(appDir);
  await removeDevServerIntegration(appDir);
};
