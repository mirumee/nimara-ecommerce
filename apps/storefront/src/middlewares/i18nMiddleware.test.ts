import {
  type NextFetchEvent,
  NextRequest,
  type NextResponse,
} from "next/server";
import { describe, expect, it } from "vitest";

import { COOKIE_KEY } from "@/config";
import { type CustomMiddleware } from "@/middlewares/chain";

import { i18nMiddleware } from "./i18nMiddleware";

const middleware: CustomMiddleware = (
  _req: NextRequest,
  _event,
  response: NextResponse,
) => {
  return response;
};

describe("i18nMiddleware", () => {
  it("set the default locale when there's no prefix and locale cookie set", async () => {
    // Customer enters the store without a locale prefix and without a cookie set
    const req = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );

    expect(req.cookies.get(COOKIE_KEY.locale)?.value).toBeUndefined();

    const resp = await i18nMiddleware(middleware)(req, {} as NextFetchEvent);
    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes("NEXT_LOCALE=en-US;");
  });

  it("set the en-GB locale when there's /gb locale prefix in the request", async () => {
    // Customer enters the store with a locale prefix in the URL
    const req = new NextRequest(
      new Request("https://demo.nimara.store/gb/products/test-product"),
    );

    expect(req.cookies.get(COOKIE_KEY.locale)?.value).toBeUndefined();

    const resp = await i18nMiddleware(middleware)(req, {} as NextFetchEvent);
    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes("NEXT_LOCALE=en-GB;");
  });

  it("set the en-GB locale when there's no /gb prefix, but there's a locale cookie set", async () => {
    // Customer enters the store without a locale prefix, but the locale is set in the cookie
    const req = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );

    req.cookies.set(COOKIE_KEY.locale, "en-GB");

    const resp = await i18nMiddleware(middleware)(req, {} as NextFetchEvent);
    const redirectUrl = resp?.headers.get("location");

    expect(resp?.status).toBe(307);
    expect(redirectUrl).toBe(
      "https://demo.nimara.store/gb/products/test-product",
    );
  });

  it("remove the checkout cookie on locale change from /gb to /", async () => {
    // Customer changes the locale from /gb to / with checkout and locale cookies being set
    const req = new NextRequest(
      new Request("https://demo.nimara.store/gb/products/test-product"),
    );

    req.cookies.set(COOKIE_KEY.locale, "en-US");
    req.cookies.set(COOKIE_KEY.checkoutId, "321");

    const resp = await i18nMiddleware(middleware)(req, {} as NextFetchEvent);
    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes("NEXT_LOCALE=en-GB;");
    expect(cookiesHeader).includes("checkoutId=;");
  });

  it("remove the checkout cookie on locale change from / to /gb", async () => {
    // Customer changes the locale from / to /gb with checkout and locale cookies being set
    const req = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );

    req.cookies.set(COOKIE_KEY.locale, "en-GB");
    req.cookies.set(COOKIE_KEY.checkoutId, "321");

    const resp = await i18nMiddleware(middleware)(req, {} as NextFetchEvent);

    const cookiesHeader = resp?.headers.get("set-cookie");
    const redirectUrl = resp?.headers.get("location");

    expect(resp?.status).toBe(307);
    expect(redirectUrl).toBe(
      "https://demo.nimara.store/gb/products/test-product",
    );
    expect(cookiesHeader).includes("NEXT_LOCALE=en-US;");
    expect(cookiesHeader).includes("checkoutId=;");
  });
});
