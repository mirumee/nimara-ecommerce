import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "./create-app";
import { type AppKind } from "./names";

let root: string;

const TEMPLATE_PKG = {
  dependencies: { react: "^19.2.3" },
  devDependencies: { tailwindcss: "^3.4.19" },
  name: "@nimara/app-template",
  private: true,
  scripts: { dev: "vite --port ${PORT:-8000}" },
};

const ENTRY_SERVER = `import { container } from "@/services/handler/container";

import { appRoutes } from "./api/rest/app";
import { saleorRoutes } from "./api/rest/saleor";
import { dashboard } from "./dashboard";

export const app = new Hono()
  .route("/", dashboard)
  .route("/api/saleor", saleorRoutes)
  .route("/api/app", appRoutes);
`;

const CONTAINER = `import { fileConfigItem } from "@nimara/infrastructure/config/file-config";
import { vercelEdgeConfigItem } from "@nimara/infrastructure/config/vercel-edge-config";
import { installSaleorAppUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/install-app-use-case";

export const container = createContainer()
  .add((ctx) => ({
    configStore: () =>
      ctx.config.CONFIG_PROVIDER === "file"
        ? fileConfigItem({ schema: appSettings, logger: ctx.logger })
        : vercelEdgeConfigItem({
            configKey: ctx.config.CONFIG_KEY,
            schema: appSettings,
            logger: ctx.logger,
          }),
  }))
  .add((ctx) => ({
    installApp: () =>
      installSaleorAppUseCase({
        configRepository: ctx.appConfigService,
      }),
  }));

export type AppContainer = typeof container;
`;

const APP_CONFIG = `export const appConfigSchema = z.object({
  CONFIG_PROVIDER: z.enum(["edge", "file"]).default("file"),
});
`;

const template = () => join(root, "templates", "app");

const write = async (path: string, contents: string) => {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
};

const generate = ({
  kind = "dashboard",
  service = "handler",
  target = "vercel",
  tenancy = "multi",
}: {
  kind?: AppKind;
  service?: string;
  target?: "node" | "vercel";
  tenancy?: "multi" | "single";
} = {}) =>
  createApp({
    description: "Keeps a feed in step with Saleor",
    kind,
    name: "feed-sync",
    port: "8010",
    root,
    service,
    target,
    tenancy,
  });

describe("create-app", () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nimara-gen-"));

    await mkdir(template(), { recursive: true });
    await write(
      join(template(), "package.json"),
      JSON.stringify(TEMPLATE_PKG, null, 2),
    );
    await write(join(template(), "README.md"), "# app-template\nPort 8000.\n");
    await write(
      join(template(), ".env.example"),
      "BUILD_TARGET=vercel\n" +
        "# Comma-separated Saleor domains allowed to install the app, e.g.\n" +
        "# store.saleor.cloud. Empty allows none. Wildcards (`*`, `*.saleor.cloud`)\n" +
        "# widen it and belong in local development only.\n" +
        "ALLOWED_DOMAINS=\n" +
        "PORT=8000\n" +
        "\n" +
        "# Where every installed Saleor's config is stored: `file` or `edge`.\n" +
        "CONFIG_PROVIDER=file\n" +
        "\n" +
        "# LocalStack only.\n" +
        "AWS_ENDPOINT_URL=http://localhost:4566\n" +
        "AWS_ACCESS_KEY_ID=dummy\n" +
        "AWS_SECRET_ACCESS_KEY=dummy\n" +
        "AWS_REGION=eu-central-1\n",
    );
    await write(join(template(), "vercel.json"), '{"framework":"hono"}');
    await write(join(template(), "src", "index.ts"), "export const a = 1;\n");
    await write(
      join(template(), "src", "services", "handler", "config.ts"),
      'import { prepareServiceConfig } from "@nimara/lib/config/service";\n' +
        "export const APP_CONFIG = prepareServiceConfig({});\n",
    );
    await write(
      join(template(), "src", "services", "handler", "entry-server.ts"),
      ENTRY_SERVER,
    );
    await write(
      join(template(), "src", "services", "handler", "dashboard.ts"),
      "export const dashboard = 1;",
    );
    await write(
      join(template(), "src", "services", "handler", "entry-client.tsx"),
      "render();",
    );
    await write(
      join(template(), "src", "services", "handler", "client", ".env.example"),
      "VITE_SALEOR_API_URL=\nVITE_SALEOR_APP_TOKEN=\n",
    );
    await write(
      join(
        template(),
        "src",
        "services",
        "handler",
        "api",
        "rest",
        "app",
        "index.ts",
      ),
      "export const appRoutes = 1;",
    );
    await write(join(template(), "src", "container", "index.ts"), CONTAINER);
    await write(join(template(), "src", "domain", "app-config.ts"), APP_CONFIG);
    await write(
      join(template(), "src", "services", "consumer", "entry-queue.ts"),
      "export const handler = 1;",
    );
    await write(
      join(template(), "src", "services", "consumer", "config.ts"),
      'import { prepareServiceConfig } from "@nimara/lib/config/service";\n' +
        "export const APP_CONFIG = prepareServiceConfig({});\n",
    );
    await write(
      join(template(), "src", "services", "consumer", ".env.example"),
      "# The queue driving the `consumer` service.\n" +
        "CONSUMER_QUEUE_URL=http://localhost:4566/000000000000/app-template-consumer\n",
    );
    await write(
      join(template(), "src", "services", "event", "entry-event.ts"),
      "export const handler = 1;",
    );
    await write(
      join(template(), "src", "services", "event", "config.ts"),
      'import { prepareServiceConfig } from "@nimara/lib/config/service";\n' +
        "export const APP_CONFIG = prepareServiceConfig({});\n",
    );
    await write(join(template(), "tailwind.config.ts"), "export default 1;");
    await write(join(template(), "postcss.config.cjs"), "module.exports = 1;");
  });

  afterEach(() => rm(root, { force: true, recursive: true }));

  it("names the package after the app, not the template", async () => {
    // when
    const destination = await generate();
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );

    // then
    expect(pkg).toMatchObject({
      description: "Keeps a feed in step with Saleor",
      name: "feed-sync",
      scripts: { dev: "vite --port ${PORT:-8010}" },
    });
  });

  it("drops `private`, which only the template needs", async () => {
    // when
    const destination = await generate();
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );

    // then a generated app is publishable; the template never is.
    expect(pkg).not.toHaveProperty("private");
  });

  it("rewrites the template's name and port wherever they appear", async () => {
    // when
    const destination = await generate();

    // then
    expect(await readFile(join(destination, "README.md"), "utf8")).toBe(
      "# feed-sync\nPort 8010.\n",
    );
    expect(await readFile(join(destination, ".env.example"), "utf8")).toContain(
      "PORT=8010",
    );
  });

  it("normalises a name that is not already a directory name", async () => {
    // when
    const destination = await createApp({
      description: "Anything",
      kind: "dashboard",
      name: "  Feed Sync!  ",
      port: "8010",
      root,
      service: "  Order Sync!  ",
      target: "vercel",
      tenancy: "multi",
    });

    // then `--args` skips the prompts that would have filtered them.
    expect(destination).toBe(join(root, "apps", "feed-sync"));
    expect(
      await readFile(
        join(destination, "src", "services", "order-sync", "config.ts"),
        "utf8",
      ),
    ).toContain("prepareServiceConfig");
  });

  it("names the service what it was asked to", async () => {
    // when
    const destination = await generate({ service: "webhooks" });
    const services = join(destination, "src", "services");

    // then the directory name is what the service reports as `SERVICE`.
    expect(
      await readFile(join(services, "webhooks", "entry-server.ts"), "utf8"),
    ).toContain('"@/services/webhooks/container"');
    await expect(
      readFile(join(services, "handler", "entry-server.ts"), "utf8"),
    ).rejects.toThrow();
  });

  it("leaves local state behind", async () => {
    // given a template someone has run locally
    await write(join(template(), ".env"), "SALEOR_APP_TOKEN=secret\n");
    await write(join(template(), "dist", "entry-server.js"), "built");
    await write(join(template(), ".app-config.json"), "{}");

    // when
    const destination = await generate();

    // then copying `.env` would hand the new app someone else's token.
    await expect(readFile(join(destination, ".env"), "utf8")).rejects.toThrow();
    await expect(
      readFile(join(destination, "dist", "entry-server.js"), "utf8"),
    ).rejects.toThrow();
    await expect(
      readFile(join(destination, ".app-config.json"), "utf8"),
    ).rejects.toThrow();
  });

  it("leaves Vercel's config behind for an app deployed elsewhere", async () => {
    // when
    const destination = await generate({ target: "node" });

    // then
    await expect(
      readFile(join(destination, "vercel.json"), "utf8"),
    ).rejects.toThrow();
    expect(await readFile(join(destination, ".env.example"), "utf8")).toContain(
      "BUILD_TARGET=node",
    );
  });

  it("keeps the LocalStack block for an app deployed to node", async () => {
    // when
    const destination = await generate({ target: "node" });

    // then
    expect(await readFile(join(destination, ".env.example"), "utf8")).toContain(
      "AWS_ENDPOINT_URL=http://localhost:4566",
    );
  });

  it("drops the LocalStack block for a Vercel app, which never reads it", async () => {
    // when
    const destination = await generate({ target: "vercel" });

    // then
    expect(
      await readFile(join(destination, ".env.example"), "utf8"),
    ).not.toContain("AWS_ENDPOINT_URL");
  });

  it("moves the config store to Secrets Manager for a node target", async () => {
    // when
    const destination = await generate({ target: "node" });
    const container = await readFile(
      join(destination, "src", "container", "index.ts"),
      "utf8",
    );

    // then Vercel Edge Config does not exist off Vercel.
    expect(container).toContain("awsSecretsManagerConfigItem");
    expect(container).not.toContain("vercelEdgeConfigItem");
    expect(
      await readFile(
        join(destination, "src", "domain", "app-config.ts"),
        "utf8",
      ),
    ).toContain('"aws-secrets-manager"');
    expect(await readFile(join(destination, ".env.example"), "utf8")).toContain(
      "`file` or `aws-secrets-manager`",
    );
  });

  it("keeps Vercel Edge Config for a vercel target", async () => {
    // when
    const destination = await generate({ target: "vercel" });
    const container = await readFile(
      join(destination, "src", "container", "index.ts"),
      "utf8",
    );

    // then
    expect(container).toContain("vercelEdgeConfigItem");
    expect(container).not.toContain("awsSecretsManagerConfigItem");
  });

  it("calls the single-tenant helper when the app serves one Saleor", async () => {
    // when
    const destination = await generate({ tenancy: "single" });
    const config = await readFile(
      join(destination, "src", "services", "handler", "config.ts"),
      "utf8",
    );

    // then the generated file names the helper it calls, and that helper is
    // what publishes `SALEOR_DOMAIN`.
    expect(config).toContain("prepareSingleTenantServiceConfig");
    expect(config).not.toMatch(/\bprepareServiceConfig\b/);
  });

  it("tells a single-tenant app it may name only one domain", async () => {
    // when
    const destination = await generate({ tenancy: "single" });
    const env = await readFile(join(destination, ".env.example"), "utf8");

    // then
    expect(env).toContain("Exactly one");
    expect(env).not.toContain("Wildcards");
  });

  it("leaves a multi-tenant app on the shared helper", async () => {
    // when
    const destination = await generate();
    const config = await readFile(
      join(destination, "src", "services", "handler", "config.ts"),
      "utf8",
    );

    // then
    expect(config).not.toContain("prepareSingleTenantServiceConfig");
  });

  describe("kind", () => {
    it("leaves the dashboard out of an http app", async () => {
      // when
      const destination = await generate({ kind: "http" });
      const service = join(destination, "src", "services", "handler");

      // then
      for (const path of [
        join(service, "dashboard.ts"),
        join(service, "entry-client.tsx"),
        join(service, "api", "rest", "app", "index.ts"),
        join(destination, "tailwind.config.ts"),
        join(destination, "postcss.config.cjs"),
      ]) {
        await expect(readFile(path, "utf8")).rejects.toThrow();
      }
    });

    it("unwires what an http app did not copy", async () => {
      // when
      const destination = await generate({ kind: "http" });
      const entryServer = await readFile(
        join(destination, "src", "services", "handler", "entry-server.ts"),
        "utf8",
      );

      // then an import of a file that was not copied does not compile.
      expect(entryServer).not.toContain("dashboard");
      expect(entryServer).toContain('.route("/api/saleor", saleorRoutes);');
    });

    it("drops the dependencies only a dashboard pulls", async () => {
      // when
      const destination = await generate({ kind: "http" });
      const pkg = JSON.parse(
        await readFile(join(destination, "package.json"), "utf8"),
      );

      // then
      expect(pkg.dependencies).not.toHaveProperty("react");
      expect(pkg.devDependencies).not.toHaveProperty("tailwindcss");
    });

    it("keeps all of it for a dashboard app", async () => {
      // when
      const destination = await generate();
      const pkg = JSON.parse(
        await readFile(join(destination, "package.json"), "utf8"),
      );

      // then
      expect(pkg.dependencies.react).toBe("^19.2.3");
      expect(
        await readFile(join(destination, "tailwind.config.ts"), "utf8"),
      ).toBe("export default 1;");
    });

    it("folds the client's env fragment into a dashboard app's own", async () => {
      // when
      const destination = await generate();

      // then the config UI outside the Dashboard iframe needs both.
      const env = await readFile(join(destination, ".env.example"), "utf8");

      expect(env).toContain("VITE_SALEOR_API_URL=");
      expect(env).toContain("VITE_SALEOR_APP_TOKEN=");
      await expect(
        readFile(
          join(
            destination,
            "src",
            "services",
            "handler",
            "client",
            ".env.example",
          ),
          "utf8",
        ),
      ).rejects.toThrow();
    });

    it("leaves the client's env fragment out of an http app", async () => {
      // when
      const destination = await generate({ kind: "http" });

      // then a service with no UI needs no variable for its config.
      expect(
        await readFile(join(destination, ".env.example"), "utf8"),
      ).not.toContain("VITE_SALEOR");
    });
  });

  it("leaves the template's other services behind", async () => {
    // when
    const destination = await generate();

    // then a queue or an event service is a different program, not this app's.
    await expect(
      readFile(
        join(destination, "src", "services", "consumer", "entry-queue.ts"),
        "utf8",
      ),
    ).rejects.toThrow();
    await expect(
      readFile(
        join(destination, "src", "services", "event", "entry-event.ts"),
        "utf8",
      ),
    ).rejects.toThrow();
  });

  describe("queue", () => {
    const queue = () =>
      generate({ kind: "queue", service: "consumer", target: "node" });

    it("generates from the template's queue service", async () => {
      // when
      const destination = await queue();
      const services = join(destination, "src", "services");

      // then the two are different programs, so only one is copied.
      expect(
        await readFile(join(services, "consumer", "entry-queue.ts"), "utf8"),
      ).toBe("export const handler = 1;");
      await expect(
        readFile(join(services, "handler", "entry-server.ts"), "utf8"),
      ).rejects.toThrow();
    });

    it("points the app at a queue of its own", async () => {
      // when
      const destination = await queue();
      const env = await readFile(join(destination, ".env.example"), "utf8");

      // then two apps on one LocalStack would otherwise share a queue.
      expect(env).toContain(
        "CONSUMER_QUEUE_URL=http://localhost:4566/000000000000/feed-sync-consumer",
      );
    });

    it("leaves the app one `.env.example`", async () => {
      // when
      const destination = await queue();

      // then the service's own is folded into it, not carried beside it.
      await expect(
        readFile(
          join(destination, "src", "services", "consumer", ".env.example"),
          "utf8",
        ),
      ).rejects.toThrow();
    });

    it("drops the dashboard, which it serves no HTTP for", async () => {
      // when
      const destination = await queue();
      const pkg = JSON.parse(
        await readFile(join(destination, "package.json"), "utf8"),
      );

      // then
      expect(pkg.dependencies).not.toHaveProperty("react");
      await expect(
        readFile(join(destination, "tailwind.config.ts"), "utf8"),
      ).rejects.toThrow();
    });

    it("refuses a target that cannot drive it", async () => {
      // when / then `--args` skips the prompt that would have hidden it.
      await expect(
        generate({ kind: "queue", service: "consumer", target: "vercel" }),
      ).rejects.toThrow("cannot be deployed to vercel");
    });
  });

  describe("event", () => {
    const event = () =>
      generate({ kind: "event", service: "event", target: "node" });

    it("generates from the template's event service", async () => {
      // when
      const destination = await event();
      const services = join(destination, "src", "services");

      // then the two are different programs, so only one is copied.
      expect(
        await readFile(join(services, "event", "entry-event.ts"), "utf8"),
      ).toBe("export const handler = 1;");
      await expect(
        readFile(join(services, "handler", "entry-server.ts"), "utf8"),
      ).rejects.toThrow();
    });

    it("drops the dashboard, which it serves no HTTP for", async () => {
      // when
      const destination = await event();
      const pkg = JSON.parse(
        await readFile(join(destination, "package.json"), "utf8"),
      );

      // then
      expect(pkg.dependencies).not.toHaveProperty("react");
      await expect(
        readFile(join(destination, "tailwind.config.ts"), "utf8"),
      ).rejects.toThrow();
    });

    it("refuses a target that cannot drive it", async () => {
      // when / then `--args` skips the prompt that would have hidden it.
      await expect(
        generate({ kind: "event", service: "event", target: "vercel" }),
      ).rejects.toThrow("cannot be deployed to vercel");
    });
  });

  it("refuses to write over an app that already exists", async () => {
    // given
    await generate();

    // when / then
    await expect(generate()).rejects.toThrow();
  });
});
