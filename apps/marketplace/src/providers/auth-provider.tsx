"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { isTokenExpired, isTokenExpiringSoon } from "@/lib/auth-utils";
import { getSaleorDomainHeader } from "@/lib/graphql/client";
import {
  getAppBridgeDomain,
  initDomainFromUrl,
  setAppBridgeDomain,
} from "@/lib/saleor/app-bridge-domain";
import { getVendorPaymentMetadata } from "@/lib/saleor/vendor-payment-metadata";

// Storage keys for auth tokens
const AUTH_ACCESS_TOKEN_KEY = "auth_token";
const AUTH_REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_CSRF_TOKEN_KEY = "csrf_token";
const THROTTLED_ERROR_CODE = "THROTTLED";

interface User {
  email: string;
  firstName?: string;
  id: string;
  lastName?: string;
  stripePaymentAccountConnected?: boolean;
  stripePaymentAccountId?: string | null;
  vendorId?: string;
}

interface AuthContextType {
  /** True when opened from dashboard with saleorApiUrl in URL (uses app token) */
  dashboardContext: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  refreshVendorStripeState: () => Promise<void>;
  setToken: (token: string) => void;
  stripeConnectRequired: boolean;
  token: string | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

type AppBridgeState = ReturnType<typeof useAppBridge>["appBridgeState"] | null;

interface AuthProviderProps {
  appBridgeState?: AppBridgeState;
  children: ReactNode;
}

type AuthError = Error & { code?: string };

function createAuthError(message: string, code?: string): AuthError {
  const error = new Error(message) as AuthError;

  if (code) {
    error.code = code;
  }

  return error;
}

function isThrottledMessage(message: string | undefined): boolean {
  if (!message) {
    return false;
  }

  return /too many requests|throttl/i.test(message);
}

function isThrottledError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const authError = error as AuthError;

  return (
    authError.code === THROTTLED_ERROR_CODE || isThrottledMessage(error.message)
  );
}

/** Wrapper that calls useAppBridge and passes to AuthProvider. Only use inside AppBridgeProvider. */
export function AuthProviderWithAppBridge({
  children,
}: {
  children: ReactNode;
}) {
  const { appBridgeState } = useAppBridge();

  return (
    <AuthProvider appBridgeState={appBridgeState}>{children}</AuthProvider>
  );
}

export function AuthProvider({
  appBridgeState = null,
  children,
}: AuthProviderProps) {
  const t = useTranslations("marketplace.auth");
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardContext, setDashboardContext] = useState(false);
  const router = useRouter();
  const refreshInProgress = useRef(false);

  /** Token from Saleor dashboard App Bridge (when app opened from Saleor Cloud) */
  const appBridgeToken =
    appBridgeState?.ready && appBridgeState?.token
      ? appBridgeState.token
      : null;

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, newToken);
      // Also set in cookie for Server Components
      document.cookie = `auth_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict`;
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokenState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CSRF_TOKEN_KEY);
      // Clear auth cookie
      document.cookie = "auth_token=; path=/; max-age=0";
    }
  }, []);

  // Fetch user data with given token
  const fetchUser = useCallback(
    async (accessToken: string) => {
      const saleorDomain = getSaleorDomainHeader();

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              ...saleorDomain,
            },
            body: JSON.stringify({
              query: `
              query Me {
                me {
                  id
                  email
                  firstName
                  lastName
                  metadata {
                    key
                    value
                  }
                }
              }
            `,
            }),
          });

          type MeResponse = {
            data?: {
              me?: {
                email?: string;
                firstName?: string;
                id: string;
                lastName?: string;
                metadata?: Array<{ key: string; value: string }>;
              };
            };
            errors?: Array<{ message?: string }>;
            message?: string;
            type?: string;
          };

          let data: MeResponse | null = null;

          try {
            data = (await response.json()) as MeResponse;
          } catch {
            data = null;
          }

          const firstErrorMessage = data?.errors?.[0]?.message;
          const responseMessage =
            typeof data?.message === "string" ? data.message : undefined;
          const message = firstErrorMessage || responseMessage;

          if (!response.ok) {
            if (response.status === 429 || isThrottledMessage(message)) {
              throw createAuthError(
                message || t("error-throttled"),
                THROTTLED_ERROR_CODE,
              );
            }

            throw new Error(message || t("error-failed-fetch-user"));
          }

          if (data?.errors?.length) {
            const errorMessage =
              data.errors[0]?.message || "Failed to fetch user";

            if (isThrottledMessage(errorMessage)) {
              throw createAuthError(errorMessage, THROTTLED_ERROR_CODE);
            }

            throw new Error(errorMessage);
          }

          if (data?.data?.me) {
            const me = data.data.me;

            const metadata = Array.isArray(me.metadata) ? me.metadata : [];
            const metadataMap = metadata.reduce<Record<string, string>>(
              (acc, item) => {
                if (item?.key) {
                  acc[item.key] = item.value;
                }

                return acc;
              },
              {},
            );

            const vendorPageId = metadataMap["vendor.id"] || "";
            let paymentMetadata = getVendorPaymentMetadata(undefined);

            if (vendorPageId) {
              const vendorResponse = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  ...saleorDomain,
                },
                body: JSON.stringify({
                  query: `
                  query VendorPageStatus($id: ID!) {
                    page(id: $id) {
                      id
                      metadata {
                        key
                        value
                      }
                      attributes {
                        attribute { slug }
                        values { name }
                      }
                    }
                  }
                `,
                  variables: { id: vendorPageId },
                }),
              });

              type VendorResponse = {
                data?: {
                  page?: {
                    attributes?: Array<{
                      attribute?: { slug?: string | null } | null;
                      values?: Array<{ name?: string | null } | null> | null;
                    }> | null;
                    metadata?: Array<{ key: string; value: string }> | null;
                  } | null;
                };
                errors?: Array<{ message?: unknown }>;
                message?: string;
              };

              let vendorData: VendorResponse | null = null;

              try {
                vendorData = (await vendorResponse.json()) as VendorResponse;
              } catch {
                vendorData = null;
              }

              const vendorResponseMessage =
                typeof vendorData?.message === "string"
                  ? vendorData.message
                  : undefined;

              if (!vendorResponse.ok) {
                if (
                  vendorResponse.status === 429 ||
                  isThrottledMessage(vendorResponseMessage)
                ) {
                  throw createAuthError(
                    vendorResponseMessage || t("error-throttled"),
                    THROTTLED_ERROR_CODE,
                  );
                }

                throw new Error(
                  vendorResponseMessage ||
                    t("error-failed-fetch-vendor-status"),
                );
              }

              if (vendorData?.errors?.length) {
                const msg = vendorData.errors
                  .map((e) => (e.message != null ? String(e.message) : ""))
                  .filter(Boolean)
                  .join(", ");

                if (isThrottledMessage(msg)) {
                  throw createAuthError(msg, THROTTLED_ERROR_CODE);
                }

                throw new Error(msg || t("error-failed-fetch-vendor-status"));
              }

              const attrs = vendorData?.data?.page?.attributes ?? [];
              const statusAttr = attrs.find(
                (a) => a?.attribute?.slug === "vendor-status",
              );
              const statusValue =
                statusAttr?.values?.[0]?.name != null
                  ? String(statusAttr.values[0]?.name)
                  : "";

              if (statusValue !== "active") {
                throw new Error(t("error-account-not-active"));
              }

              paymentMetadata = getVendorPaymentMetadata(
                vendorData?.data?.page?.metadata,
              );
            }

            setUser({
              email: me.email ?? "",
              firstName: me.firstName,
              id: me.id,
              lastName: me.lastName,
              stripePaymentAccountConnected:
                paymentMetadata.paymentAccountConnected,
              stripePaymentAccountId: paymentMetadata.paymentAccountId,
              ...(vendorPageId ? { vendorId: vendorPageId } : {}),
            });

            return true;
          }

          return false;
        } catch (error) {
          if (isThrottledError(error) && attempt < 3) {
            await new Promise((resolve) => {
              setTimeout(resolve, attempt * 500);
            });

            continue;
          }

          throw error;
        }
      }

      return false;
    },
    [t],
  );

  // Refresh access token using refresh token or HTTP-only cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent multiple simultaneous refresh attempts
    if (refreshInProgress.current) {
      return null;
    }

    refreshInProgress.current = true;

    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
          : null;
      const csrfToken =
        typeof window !== "undefined"
          ? localStorage.getItem(AUTH_CSRF_TOKEN_KEY)
          : null;

      // If no CSRF token, we can't refresh (backend uses HTTP-only cookies with CSRF)
      if (!csrfToken) {
        console.warn("No CSRF token available for token refresh");

        return null;
      }

      const saleorDomain = getSaleorDomainHeader();
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...saleorDomain,
        },
        credentials: "include", // Include HTTP-only refresh token cookie
        body: JSON.stringify({
          query: `
            mutation TokenRefresh($refreshToken: String, $csrfToken: String!) {
              tokenRefresh(refreshToken: $refreshToken, csrfToken: $csrfToken) {
                token
                errors {
                  message
                  code
                }
              }
            }
          `,
          variables: {
            refreshToken: refreshToken || undefined,
            csrfToken,
          },
        }),
      });

      const data = (await response.json()) as {
        data?: {
          tokenRefresh?: {
            errors?: Array<{ code?: string; message?: string }>;
            token?: string;
          };
        };
        errors?: Array<{ message?: string }>;
      };

      // Handle GraphQL-level errors
      if (data.errors?.length) {
        console.error("Token refresh GraphQL error:", data.errors);

        return null;
      }

      // Handle mutation errors
      if (data.data?.tokenRefresh?.errors?.length) {
        console.error(
          "Token refresh mutation error:",
          data.data.tokenRefresh.errors,
        );

        return null;
      }

      const newToken = data.data?.tokenRefresh?.token;

      if (newToken) {
        setToken(newToken);

        return newToken;
      }

      console.warn("Token refresh did not return a new token");

      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);

      return null;
    } finally {
      refreshInProgress.current = false;
    }
  }, [setToken]);

  // Parse saleorApiUrl from URL (NEW_TAB extension with GET) – fallback when App Bridge has no token
  useEffect(() => {
    if (typeof window !== "undefined" && initDomainFromUrl()) {
      setDashboardContext(true);
      setIsLoading(false);
    }
  }, []);

  // When App Bridge provides token (app opened from Saleor Cloud dashboard iframe), use it
  useEffect(() => {
    const saleorApiUrl =
      typeof appBridgeState?.saleorApiUrl === "string"
        ? appBridgeState.saleorApiUrl
        : null;
    const tokenFromBridge =
      typeof appBridgeToken === "string" ? appBridgeToken : null;

    if (!tokenFromBridge) {
      return;
    }

    // Need both token and API URL. Fallback to URL params (e.g. NEW_TAB extension)
    const hasApiUrl =
      saleorApiUrl || (typeof window !== "undefined" && initDomainFromUrl());

    if (hasApiUrl) {
      if (saleorApiUrl) {
        setAppBridgeDomain(saleorApiUrl);
      }
      setToken(tokenFromBridge);
      setDashboardContext(true);
      fetchUser(tokenFromBridge)
        .then(() => setIsLoading(false))
        .catch((error) => {
          if (isThrottledError(error)) {
            console.warn(
              "Rate-limited while fetching user from App Bridge token; keeping session and retrying later.",
            );
          }
          setIsLoading(false);
        });
    } else {
      // Token from bridge but no API URL – can't use it, stop loading to avoid permanent spinner
      setIsLoading(false);
    }
  }, [appBridgeToken, appBridgeState?.saleorApiUrl, fetchUser, setToken]);

  // Initialize auth from localStorage when not using App Bridge
  useEffect(() => {
    if (appBridgeToken) {
      return;
    }

    const initializeAuth = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)
            : null;

        if (!storedToken) {
          setIsLoading(false);

          return;
        }

        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log("Token expired, attempting refresh...");
          const newToken = await refreshAccessToken();

          if (!newToken) {
            console.warn("Token refresh failed, clearing auth");
            clearAuth();
            setIsLoading(false);

            return;
          }

          setTokenState(newToken);
          await fetchUser(newToken);
        } else {
          setTokenState(storedToken);
          await fetchUser(storedToken);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);

        if (!isThrottledError(error)) {
          clearAuth();
        } else {
          console.warn(
            "Rate-limited while restoring auth state; keeping existing token.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [appBridgeToken, clearAuth, fetchUser, refreshAccessToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const saleorDomain = getSaleorDomainHeader();
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...saleorDomain,
          },
          credentials: "include", // Include cookies for HTTP-only refresh token
          body: JSON.stringify({
            query: `
              mutation TokenCreate($email: String!, $password: String!) {
                tokenCreate(email: $email, password: $password) {
                  token
                  refreshToken
                  csrfToken
                  user {
                    id
                    email
                    firstName
                    lastName
                  }
                  errors {
                    field
                    message
                  }
                }
              }
            `,
            variables: { email, password },
          }),
        });

        const data = (await response.json()) as {
          data?: {
            tokenCreate?: {
              csrfToken?: string;
              errors?: Array<{ message?: unknown }>;
              refreshToken?: string;
              token?: string;
              user?: {
                email?: string;
                firstName?: string;
                id: string;
                lastName?: string;
              };
            };
          };
          errors?: Array<{ message?: unknown }>;
        };

        // Handle GraphQL-level errors
        if (data.errors?.length) {
          const errorMessage = data.errors
            .map((e) => (e.message != null ? String(e.message) : ""))
            .filter(Boolean)
            .join(", ");

          throw new Error(errorMessage || t("error-login-failed"));
        }

        // Handle Saleor mutation errors
        const tokenCreate = data.data?.tokenCreate;

        if (tokenCreate?.errors?.length) {
          const msg = tokenCreate.errors[0]?.message;

          throw new Error(msg != null ? String(msg) : t("error-login-failed"));
        }

        // Check if we got a token
        const tokenValue = tokenCreate?.token;

        if (!tokenValue) {
          throw new Error(t("error-login-failed-no-token"));
        }

        // Store access token
        setToken(String(tokenValue));

        // Store refresh token if provided (otherwise it's in HTTP-only cookie)
        if (tokenCreate?.refreshToken && typeof window !== "undefined") {
          localStorage.setItem(
            AUTH_REFRESH_TOKEN_KEY,
            tokenCreate.refreshToken,
          );
        }

        // Store CSRF token for refresh requests
        if (tokenCreate?.csrfToken && typeof window !== "undefined") {
          localStorage.setItem(AUTH_CSRF_TOKEN_KEY, tokenCreate.csrfToken);
        }

        // Fetch user (and validate vendor status if linked)
        try {
          await fetchUser(String(tokenValue));
        } catch (e) {
          if (!isThrottledError(e)) {
            clearAuth();
            throw e;
          }

          console.warn(
            "Rate-limited right after login; continuing with token and loading user profile later.",
          );
        }

        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [clearAuth, fetchUser, router, setToken, t],
  );

  const logout = useCallback(async () => {
    clearAuth();
    router.push("/sign-in");
  }, [clearAuth, router]);

  const refreshVendorStripeState = useCallback(async () => {
    if (!token) {
      return;
    }

    await fetchUser(token);
  }, [fetchUser, token]);

  // Periodic token refresh - check every minute if token needs refresh
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        // If token is expiring soon (within 5 minutes), refresh it proactively
        if (isTokenExpiringSoon(token, 300)) {
          console.log("Token expiring soon, refreshing proactively...");
          const newToken = await refreshAccessToken();

          if (!newToken) {
            console.warn("Proactive token refresh failed");
            // Don't log out yet, wait for actual expiration
          }
        }
      } catch (error) {
        console.error("Error in periodic token check:", error);
      }
    };

    // Check immediately
    void checkAndRefreshToken();

    // Then check every minute
    const interval = setInterval(checkAndRefreshToken, 60000);

    return () => clearInterval(interval);
  }, [token, user, refreshAccessToken]);

  // Authenticated: Saleor Cloud user token (App Bridge/login) OR dashboard context (saleorApiUrl in URL)
  const isAuthenticated =
    !!token || (dashboardContext && !!getAppBridgeDomain());
  const stripeConnectRequired =
    Boolean(user?.vendorId) &&
    (!user?.stripePaymentAccountId || !user?.stripePaymentAccountConnected);

  return (
    <AuthContext.Provider
      value={{
        user,
        dashboardContext: dashboardContext && !!getAppBridgeDomain(),
        isAuthenticated,
        isLoading,
        token,
        stripeConnectRequired,
        login,
        logout,
        refreshVendorStripeState,
        setToken,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
