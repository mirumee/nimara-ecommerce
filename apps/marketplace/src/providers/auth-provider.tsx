"use client";

import { useRouter } from "next/navigation";
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

// Storage keys for auth tokens
const AUTH_ACCESS_TOKEN_KEY = "auth_token";
const AUTH_REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_CSRF_TOKEN_KEY = "csrf_token";

interface User {
  email: string;
  firstName?: string;
  id: string;
  lastName?: string;
  vendorId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setToken: (token: string) => void;
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshInProgress = useRef(false);

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
              }
            }
          `,
        }),
      });

      const data = (await response.json()) as {
        data?: {
          me?: {
            email?: string;
            firstName?: string;
            id: string;
            lastName?: string;
          };
        };
        errors?: Array<{ message?: string }>;
      };

      if (data.errors?.length) {
        throw new Error(data.errors[0]?.message || "Failed to fetch user");
      }

      if (data.data?.me) {
        const me = data.data.me;

        setUser({
          email: me.email ?? "",
          firstName: me.firstName,
          id: me.id,
          lastName: me.lastName,
        });

        return true;
      }

      return false;
    },
    [],
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

  // Initialize auth state from localStorage
  useEffect(() => {
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
          // Try to refresh the token
          const newToken = await refreshAccessToken();

          if (!newToken) {
            console.warn("Token refresh failed, clearing auth");
            clearAuth();
            setIsLoading(false);

            return;
          }

          // Use the new token to fetch user
          setTokenState(newToken);
          await fetchUser(newToken);
        } else {
          // Token is still valid
          setTokenState(storedToken);
          await fetchUser(storedToken);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [clearAuth, fetchUser, refreshAccessToken]);

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

          throw new Error(errorMessage || "Request failed");
        }

        // Handle Saleor mutation errors
        const tokenCreate = data.data?.tokenCreate;

        if (tokenCreate?.errors?.length) {
          const msg = tokenCreate.errors[0]?.message;

          throw new Error(msg != null ? String(msg) : "Login failed");
        }

        // Check if we got a token
        const tokenValue = tokenCreate?.token;

        if (!tokenValue) {
          throw new Error("Login failed: No token received");
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

        const loginUser = tokenCreate.user;

        setUser(
          loginUser
            ? {
              email: loginUser.email ?? "",
              firstName: loginUser.firstName,
              id: loginUser.id,
              lastName: loginUser.lastName,
            }
            : null,
        );
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [router, setToken],
  );

  const logout = useCallback(async () => {
    clearAuth();
    router.push("/sign-in");
  }, [clearAuth, router]);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!token,
        isLoading,
        token,
        login,
        logout,
        setToken,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
