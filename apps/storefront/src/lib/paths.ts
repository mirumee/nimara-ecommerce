import omit from "lodash/omit";
import pick from "lodash/pick";
import { route } from "nextjs-routes";
import type { ParsedUrlQuery } from "querystring";
import type { UrlObject } from "url";

import { storefrontLogger } from "@/services/logging";

// UrlObject accepted by next `<Link />` component.
export type UrlOpts = Omit<UrlObject, "query"> & {
  query?: Record<string, string | number>;
};
type ParametrizedUrlOpts<PathKey extends string | string[]> = UrlOpts &
  (PathKey extends string
    ? {
        [key in PathKey]: string | number;
      }
    : {
        [key in keyof PathKey]: string | number;
      });

// Pre-populated url string - what u see in the browser.
type GeneratedStringUrl = string;

export type PopulatedUrl = {
  asPath: (opts?: UrlOpts) => GeneratedStringUrl;
  url: (opts?: UrlOpts) => UrlOpts;
};
type PopulatedParametrizedUrl<PathKey extends string | string[]> = {
  asPath: (opts: ParametrizedUrlOpts<PathKey>) => GeneratedStringUrl;
  url: (opts: ParametrizedUrlOpts<PathKey>) => UrlOpts;
};

function urlWithParam(path: string): PopulatedUrl;
function urlWithParam<PathKey extends string | string[]>(
  path: string,
): PopulatedParametrizedUrl<PathKey>;
function urlWithParam<PathKey extends string>(path: string) {
  if (path !== "/") {
    if (path.endsWith("/")) {
      storefrontLogger.warning("Path should not have trailing slash.", {
        path,
      });
    }
    if (!path.startsWith("/")) {
      storefrontLogger.warning("Path  should have leading slash.", { path });
    }
  }

  const urlParams = [
    "auth",
    "hash",
    "host",
    "hostname",
    "href",
    "pathname",
    "protocol",
    "search",
    "slashes",
    "port",
    "query",
  ];

  const urlProps = (opts?: UrlOpts | ParametrizedUrlOpts<PathKey>): UrlOpts => {
    const urlOpts = pick<UrlOpts>(opts, urlParams);
    const query = omit(opts, urlParams) as UrlOpts["query"];

    return {
      ...urlOpts,
      pathname: path,
      query: { ...query, ...opts?.query },
    };
  };

  return {
    // Pre-populated url string - what u see in the browser.
    asPath: (opts?: UrlOpts | ParametrizedUrlOpts<PathKey>) => {
      const { hash, pathname, query } = urlProps(opts);

      return route({
        pathname: pathname!,
        query: query as ParsedUrlQuery,
        hash,
      });
    },
    // UrlObject accepted by next `<Link />` component.
    url: (opts?: UrlOpts | ParametrizedUrlOpts<PathKey>) => urlProps(opts),
  };
}

const url = urlWithParam;

export const paths = {
  ...url("/"),
  home: url("/"),
  search: url("/search"),
  cart: url("/cart"),
  products: {
    ...url<"slug">("/products/[slug]"),
  },
  collections: {
    ...url<"slug">("/collections/[slug]"),
  },
  checkout: {
    ...url("/checkout"),
    signIn: url("/checkout/sign-in"),
    userDetails: url("/checkout/user-details"),
    shippingAddress: url("/checkout/shipping-address"),
    deliveryMethod: url("/checkout/delivery-method"),
    payment: url("/checkout/payment"),
  },
  order: {
    confirmation: url<"id">("/order/confirmation/[id]"),
  },
  payment: {
    confirmation: url("/payment/confirmation"),
  },
  notFound: url("/404"),
  signIn: url("/sign-in"),
  createAccount: url("/create-account"),
  termsOfUse: url("/terms-of-use"),
  privacyPolicy: url("/privacy-policy"),
  resetPassword: url("/reset-password"),
  newPassword: url("/new-password"),
  account: {
    profile: url("/account/profile"),
    orders: url("/account/orders"),
    privacySettings: url("/account/privacy-settings"),
    addresses: url("/account/addresses"),
    paymentMethods: url("/account/payment-methods"),
  },
  confirmNewEmail: url("/confirm-new-email"),
  deleteAccount: url("/delete-account"),
  staticPages: {
    contact: url("/contact"),
    aboutUs: url("/about-us"),
    faq: url("/faq"),
    privacyPolicy: url("/privacy-policy"),
    terms: url("/terms"),
  },
  confirmAccountRegistration: url("/confirm-account-registration"),
  page: {
    ...url<"slug">("/page/[slug]"),
  },
};

export const QUERY_PARAMS = {
  orderPlaced: "orderPlaced",
  errorCode: "errorCode",
} as const;
