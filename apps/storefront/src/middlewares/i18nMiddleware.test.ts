import { type NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { describe, expect, it } from "vitest";

import { COOKIE_KEY } from "@/config";
import { type CustomMiddleware } from "@/middlewares/chain";
import { DEFAULT_LOCALE } from "@/regions/types";

import { i18nMiddleware } from "./i18nMiddleware";

describe("i18nMiddleware", () => {
  const mockNextMiddleware: CustomMiddleware = (_req, _event, response) =>
    response;
  const mockedFetchEvent = {} as NextFetchEvent;

  it("set the default locale when there's no prefix and locale cookie set", async () => {
    const initialRequest = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );
    const initialResponse = new NextResponse();

    const resp = await i18nMiddleware(mockNextMiddleware)(
      initialRequest,
      mockedFetchEvent,
      initialResponse,
    );

    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=${DEFAULT_LOCALE};`);
  });

  it("set the en-GB locale when there's /gb locale prefix in the request", async () => {
    const initialRequest = new NextRequest(
      new Request("https://demo.nimara.store/gb/products/test-product"),
    );
    const initialResponse = new NextResponse();

    const resp = await i18nMiddleware(mockNextMiddleware)(
      initialRequest,
      mockedFetchEvent,
      initialResponse,
    );

    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=en-GB;`);
  });

  it("set the en-US locale when there's a en-GB locale cookie set", async () => {
    const initialRequest = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );
    const initialResponse = new NextResponse();

    initialRequest.cookies.set(COOKIE_KEY.locale, "en-GB");

    const resp = await i18nMiddleware(mockNextMiddleware)(
      initialRequest,
      mockedFetchEvent,
      initialResponse,
    );

    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=en-US;`);
  });

  it("remove the checkout cookie on locale change from /gb to /", async () => {
    const initialRequest = new NextRequest(
      new Request("https://demo.nimara.store/gb/products/test-product"),
    );
    const initialResponse = new NextResponse();

    initialRequest.cookies.set(COOKIE_KEY.locale, "en-US");
    initialRequest.cookies.set(COOKIE_KEY.checkoutId, "321");

    const resp = await i18nMiddleware(mockNextMiddleware)(
      initialRequest,
      mockedFetchEvent,
      initialResponse,
    );

    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=en-GB;`);
    expect(cookiesHeader).includes(`${COOKIE_KEY.checkoutId}=;`);
  });

  it("remove the checkout cookie on locale change from / to /gb", async () => {
    const initialRequest = new NextRequest(
      new Request("https://demo.nimara.store/products/test-product"),
    );
    const initialResponse = new NextResponse();

    initialRequest.cookies.set(COOKIE_KEY.locale, "en-GB");
    initialRequest.cookies.set(COOKIE_KEY.checkoutId, "321");

    const resp = await i18nMiddleware(mockNextMiddleware)(
      initialRequest,
      mockedFetchEvent,
      initialResponse,
    );

    const cookiesHeader = resp?.headers.get("set-cookie");

    expect(resp?.status).toBe(200);
    expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=en-US;`);
    expect(cookiesHeader).includes(`${COOKIE_KEY.checkoutId}=;`);
  });

  it.each([
    { locale: "en-US", path: "products/test-product" },
    { locale: "en-GB", path: "gb/products/test-product" },
  ])(
    "should keep the checkout id cookie between page refresh with $locale locale",
    async ({ locale, path }) => {
      const initialRequest = new NextRequest(
        new Request(`https://demo.nimara.store/${path}`),
      );
      const initialResponse = new NextResponse();

      initialRequest.cookies.set(COOKIE_KEY.locale, locale);
      initialRequest.cookies.set(COOKIE_KEY.checkoutId, "321");

      const resp = await i18nMiddleware(mockNextMiddleware)(
        initialRequest,
        mockedFetchEvent,
        initialResponse,
      );

      const cookiesHeader = resp?.headers.get("set-cookie");

      expect(resp?.status).toBe(200);
      expect(cookiesHeader).includes(`${COOKIE_KEY.locale}=${locale};`);
      expect(cookiesHeader).not.includes(`${COOKIE_KEY.checkoutId};`);
    },
  );
});
