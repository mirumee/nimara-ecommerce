import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IntegrationReportRow } from "./integration-doctor";

const envMock = {
  SEARCH_SERVICE: "saleor",
  CMS_SERVICE: "saleor",
  ENVIRONMENT: "LOCAL",
};
const saleorMock = { configured: true };

vi.mock("@/envs/server", () => ({ serverEnvs: envMock }));
vi.mock("@/envs/client", () => ({ clientEnvs: envMock }));
vi.mock("@/services/utils/empty-services", () => ({
  get isSaleorConfigured() {
    return saleorMock.configured;
  },
}));

const { buildIntegrationReport } = await import("./integration-doctor");

const rowFor = (
  rows: IntegrationReportRow[],
  capability: string,
): IntegrationReportRow => {
  const row = rows.find((entry) => entry.capability === capability);

  if (!row) {
    throw new Error(`No report row for ${capability}`);
  }

  return row;
};

describe("buildIntegrationReport", () => {
  beforeEach(() => {
    envMock.SEARCH_SERVICE = "saleor";
    envMock.CMS_SERVICE = "saleor";
    envMock.ENVIRONMENT = "LOCAL";
    saleorMock.configured = true;
  });

  it("flags missing env for the selected algolia provider", () => {
    envMock.SEARCH_SERVICE = "algolia";

    const search = rowFor(buildIntegrationReport({}), "search");

    expect(search.ok).toBe(false);
    expect(search.missing).toContain("SEARCH_ALGOLIA_APP_ID");
  });

  it("reports ok for saleor search when its url is present", () => {
    const search = rowFor(
      buildIntegrationReport({
        NEXT_PUBLIC_SALEOR_API_URL: "https://x.saleor.cloud/graphql/",
      }),
      "search",
    );

    expect(search).toMatchObject({ ok: true, missing: [], selected: "saleor" });
  });

  it("flags missing CMS_BUTTER_TOKEN for butter-cms (pages + menus)", () => {
    envMock.CMS_SERVICE = "butter-cms";

    const rows = buildIntegrationReport({});

    expect(rowFor(rows, "cms-page").missing).toContain("CMS_BUTTER_TOKEN");
    expect(rowFor(rows, "cms-menu").missing).toContain("CMS_BUTTER_TOKEN");
  });

  it("treats dummy as configured (no env required)", () => {
    envMock.SEARCH_SERVICE = "dummy";

    expect(rowFor(buildIntegrationReport({}), "search")).toMatchObject({
      ok: true,
      selected: "dummy",
    });
  });

  it("falls back to dummy when saleor is unconfigured outside production", () => {
    saleorMock.configured = false;

    expect(rowFor(buildIntegrationReport({}), "search")).toMatchObject({
      ok: true,
      selected: "dummy",
    });
  });
});
