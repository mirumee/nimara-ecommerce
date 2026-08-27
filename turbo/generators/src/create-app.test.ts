import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "./create-app";

let root: string;

const TEMPLATE_PKG = {
  dependencies: { react: "^19.2.3" },
  devDependencies: { tailwindcss: "^3.4.19" },
  name: "@nimara/app-template",
  private: true,
  scripts: { dev: "vite --port ${PORT:-8000}" },
};

const ENTRY_SERVER = `import { container } from "@/container";

import { appRoutes } from "./api/rest/app";
import { saleorRoutes } from "./api/rest/saleor";
import { dashboard } from "./dashboard";

export const app = new Hono()
  .route("/", dashboard)
  .route("/api/saleor", saleorRoutes)
  .route("/api/app", appRoutes);
`;

const CONTAINER = `import { installSaleorAppUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/install-app-use-case";

import { dashboardUseCases } from "./dashboard";

export const container = createContainer()
  .add((ctx) => ({
    configStore: () => ({
      store: 1,
    }),
  }))
  .add((ctx) => ({
    installApp: () =>
      installSaleorAppUseCase({
        configRepository: ctx.appConfigService,
      }),
  }))
  .add(dashboardUseCases);

export type AppContainer = typeof container;
`;

const template = () => join(root, "templates", "app");

const write = async (path: string, contents: string) => {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
};

const generate = ({
  kind = "dashboard",
  target = "vercel",
  tenancy = "multi",
}: {
  kind?: "dashboard" | "http";
  target?: "node" | "vercel";
  tenancy?: "multi" | "single";
} = {}) =>
  createApp({
    description: "Keeps a feed in step with Saleor",
    kind,
    name: "feed-sync",
    port: "8010",
    root,
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
        "PORT=8000\n",
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
    await write(
      join(template(), "src", "container", "dashboard.ts"),
      "export const dashboardUseCases = 1;",
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
      target: "vercel",
      tenancy: "multi",
    });

    // then `--args` skips the prompt that would have filtered it.
    expect(destination).toBe(join(root, "apps", "feed-sync"));
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
      const [entryServer, container] = await Promise.all(
        [
          join(destination, "src", "services", "handler", "entry-server.ts"),
          join(destination, "src", "container", "index.ts"),
        ].map((path) => readFile(path, "utf8")),
      );

      // then an import of a file that was not copied does not compile, and a
      // container entry nothing calls is dead code in a new app.
      expect(entryServer).not.toContain("dashboard");
      expect(entryServer).toContain('.route("/api/saleor", saleorRoutes);');
      expect(container).not.toContain("getSettingsForm");
      expect(container).not.toContain("saveSettings");
      expect(container).toContain("installApp");
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
  });

  it("refuses to write over an app that already exists", async () => {
    // given
    await generate();

    // when / then
    await expect(generate()).rejects.toThrow();
  });
});
