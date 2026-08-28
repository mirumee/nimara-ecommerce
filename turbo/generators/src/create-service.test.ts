import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createService, listApps } from "./create-service";

let root: string;

const MULTI =
  'import { prepareServiceConfig } from "@nimara/lib/config/service";\n';
const SINGLE =
  'import { prepareSingleTenantServiceConfig } from "@nimara/lib/config/service";\n';

const write = async (path: string, contents: string) => {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
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
  }));

export type AppContainer = typeof container;
`;

const template = (...parts: string[]) =>
  join(root, "templates", "app", ...parts);

const templateService = (...parts: string[]) =>
  template("src", "services", "handler", ...parts);

const templateQueue = (...parts: string[]) =>
  template("src", "services", "consumer", ...parts);

const appService = (service: string, ...parts: string[]) =>
  join(root, "apps", "feed-sync", "src", "services", service, ...parts);

const add = (
  name = "order-sync",
  kind: "dashboard" | "http" | "queue" = "dashboard",
) => createService({ app: "feed-sync", kind, name, root });

describe("create-service", () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nimara-gen-"));

    await write(templateService("config.ts"), MULTI);
    await write(templateService("entry-server.ts"), ENTRY_SERVER);
    await write(
      templateService("api", "rest", "saleor", "index.test.ts"),
      'import { app } from "@/services/handler/entry-server";\n',
    );
    await write(templateService("dashboard.ts"), "export const dashboard = 1;");
    await write(templateService("entry-client.tsx"), "render();");
    await write(
      templateService("client", "views", "app", "app-view.tsx"),
      "export const AppView = 1;",
    );
    await write(
      templateService("api", "rest", "app", "index.ts"),
      "export const appRoutes = 1;",
    );
    await write(template("src", "container", "index.ts"), CONTAINER);
    await write(template("tailwind.config.ts"), "export default 1;");
    await write(template("postcss.config.cjs"), "module.exports = 1;");
    await write(
      template("package.json"),
      JSON.stringify({
        dependencies: { react: "^19.2.3" },
        devDependencies: { tailwindcss: "^3.4.19" },
      }),
    );

    await write(join(root, "apps", "feed-sync", "etc", "build.ts"), "build");
    await write(
      join(root, "apps", "feed-sync", "package.json"),
      JSON.stringify({ dependencies: {}, devDependencies: {} }),
    );
    await write(
      join(root, "apps", "feed-sync", "src", "container", "index.ts"),
      CONTAINER,
    );
    await write(templateQueue("config.ts"), MULTI);
    await write(
      templateQueue("entry-queue.ts"),
      'import { container } from "@/services/consumer/container";\n',
    );
    await write(
      templateQueue(".env.example"),
      "# The queue driving the `consumer` service.\n" +
        "CONSUMER_QUEUE_URL=http://localhost:4566/000000000000/app-template-consumer\n",
    );

    await write(
      join(root, "apps", "feed-sync", ".env.example"),
      "BUILD_TARGET=node\n",
    );
    await write(appService("handler", "config.ts"), MULTI);
  });

  afterEach(() => rm(root, { force: true, recursive: true }));

  it("copies the template's service under the name it was given", async () => {
    // when
    const serviceDir = await add();

    // then
    expect(serviceDir).toBe(appService("order-sync"));
    expect(await readFile(appService("order-sync", "config.ts"), "utf8")).toBe(
      MULTI,
    );
  });

  it("points the copied imports at the new service", async () => {
    // when
    await add();
    const test = await readFile(
      appService("order-sync", "api", "rest", "saleor", "index.test.ts"),
      "utf8",
    );

    // then the copy would otherwise run the template's entry point, not its own.
    expect(test).toContain('"@/services/order-sync/entry-server"');
    expect(test).not.toContain("@/services/handler/");
  });

  it("leaves imports that name no service alone", async () => {
    // when
    await add();

    // then
    expect(
      await readFile(appService("order-sync", "entry-server.ts"), "utf8"),
    ).toContain('"@/container"');
  });

  it("normalises a name that is not already a directory name", async () => {
    // when
    const serviceDir = await add("  Order Sync!  ");

    // then `--args` skips the prompt that would have filtered it.
    expect(serviceDir).toBe(appService("order-sync"));
  });

  it("refuses to write over a service that already exists", async () => {
    // given
    await add();

    // when / then
    await expect(add()).rejects.toThrow();
  });

  it("inherits single tenancy from the services already there", async () => {
    // given an app generated as single-tenant
    await write(appService("handler", "config.ts"), SINGLE);

    // when
    await add();

    // then the services share one `.env`, so a new one must read it the same way.
    expect(await readFile(appService("order-sync", "config.ts"), "utf8")).toBe(
      SINGLE,
    );
  });

  it("leaves a multi-tenant app on the shared helper", async () => {
    // when
    await add();

    // then
    expect(
      await readFile(appService("order-sync", "config.ts"), "utf8"),
    ).not.toContain("prepareSingleTenantServiceConfig");
  });

  describe("kind", () => {
    it("leaves the dashboard out of an http service", async () => {
      // when
      const serviceDir = await add("order-sync", "http");

      // then
      await expect(
        readFile(join(serviceDir, "dashboard.ts"), "utf8"),
      ).rejects.toThrow();
      await expect(
        readFile(join(serviceDir, "entry-client.tsx"), "utf8"),
      ).rejects.toThrow();
      await expect(
        readFile(join(serviceDir, "api", "rest", "app", "index.ts"), "utf8"),
      ).rejects.toThrow();
    });

    it("unwires what an http service did not copy", async () => {
      // when
      const serviceDir = await add("order-sync", "http");
      const entryServer = await readFile(
        join(serviceDir, "entry-server.ts"),
        "utf8",
      );

      // then an import of a file that was not copied does not compile.
      expect(entryServer).not.toContain("dashboard");
      expect(entryServer).not.toContain("appRoutes");
      expect(entryServer).toContain('.route("/api/saleor", saleorRoutes);');
    });

    it("brings back what a dashboard needs and the app never had", async () => {
      // given an app generated without a dashboard
      // when
      await add("order-sync", "dashboard");
      const appDir = join(root, "apps", "feed-sync");
      const pkg = JSON.parse(
        await readFile(join(appDir, "package.json"), "utf8"),
      );

      // then the bundle pulls styling the app was never given.
      expect(await readFile(join(appDir, "tailwind.config.ts"), "utf8")).toBe(
        "export default 1;",
      );
      expect(pkg.dependencies.react).toBe("^19.2.3");
      expect(pkg.devDependencies.tailwindcss).toBe("^3.4.19");
    });

    it("leaves the app's container alone", async () => {
      // given
      const containerPath = join(
        root,
        "apps",
        "feed-sync",
        "src",
        "container",
        "index.ts",
      );
      const before = await readFile(containerPath, "utf8");

      // when
      await add("order-sync", "dashboard");

      // then a dashboard builds its own use-cases, so nothing is wired in.
      expect(await readFile(containerPath, "utf8")).toBe(before);
    });

    it("builds a queue service from the template's queue service", async () => {
      // when
      await add("mail-sender", "queue");

      // then a queue service is a different program, not an HTTP one cut down.
      expect(
        await readFile(appService("mail-sender", "entry-queue.ts"), "utf8"),
      ).toContain('"@/services/mail-sender/container"');
    });

    it("points a queue service at a queue of its own", async () => {
      // when
      await add("mail-sender", "queue");
      const env = await readFile(
        appService("mail-sender", ".env.example"),
        "utf8",
      );

      // then the variable follows the service, so two never share one queue.
      expect(env).toContain(
        "MAIL_SENDER_QUEUE_URL=http://localhost:4566/000000000000/feed-sync-mail-sender",
      );
      expect(env).not.toContain("CONSUMER_QUEUE_URL");
    });

    it("refuses a queue service on an app that cannot drive one", async () => {
      // given an app deployed to Vercel
      await write(
        join(root, "apps", "feed-sync", ".env.example"),
        "BUILD_TARGET=vercel\n",
      );

      // when / then `--args` skips the prompt that would have hidden it.
      await expect(add("mail-sender", "queue")).rejects.toThrow(
        "cannot be deployed to vercel",
      );
    });

    it("keeps what the app already declared", async () => {
      // given an app that pinned its own React
      await write(
        join(root, "apps", "feed-sync", "package.json"),
        JSON.stringify({
          dependencies: { react: "^19.0.0" },
          devDependencies: {},
        }),
      );

      // when
      await add("order-sync", "dashboard");
      const pkg = JSON.parse(
        await readFile(join(root, "apps", "feed-sync", "package.json"), "utf8"),
      );

      // then the template does not overwrite a version the app chose.
      expect(pkg.dependencies.react).toBe("^19.0.0");
    });
  });

  describe("listApps", () => {
    it("offers only the apps built from src/services", async () => {
      // given a Next.js app beside the Saleor one
      await write(join(root, "apps", "storefront", "package.json"), "{}");

      // when / then `etc/build.ts` is what the Saleor apps have and Next has not.
      expect(listApps(root)).toEqual(["feed-sync"]);
    });

    it("returns nothing when there are no apps yet", () => {
      // when / then
      expect(listApps(join(root, "elsewhere"))).toEqual([]);
    });
  });
});
