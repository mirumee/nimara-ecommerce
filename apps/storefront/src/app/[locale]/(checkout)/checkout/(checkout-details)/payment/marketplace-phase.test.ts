import { describe, expect, it } from "vitest";

import { canProceedMarketplacePayment } from "./marketplace-phase";

describe("canProceedMarketplacePayment", () => {
  it("allows proceeding in prepare phase once payment page is initialized", () => {
    expect(
      canProceedMarketplacePayment({
        phase: "prepare",
        isLoading: false,
        isMounted: false,
        clientSecret: null,
        orderIdsCount: 0,
      }),
    ).toBe(true);
  });

  it("blocks confirm phase when payment element is not mounted", () => {
    expect(
      canProceedMarketplacePayment({
        phase: "confirm",
        isLoading: false,
        isMounted: false,
        clientSecret: "pi_secret",
        orderIdsCount: 2,
      }),
    ).toBe(false);
  });

  it("allows confirm phase only when secret, order ids and mounted element are present", () => {
    expect(
      canProceedMarketplacePayment({
        phase: "confirm",
        isLoading: false,
        isMounted: true,
        clientSecret: "pi_secret",
        orderIdsCount: 2,
      }),
    ).toBe(true);
  });
});
