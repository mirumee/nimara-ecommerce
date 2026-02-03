"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getSaleorDomainHeader } from "@/lib/graphql/client";

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

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", newToken);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokenState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        if (storedToken) {
          setTokenState(storedToken);
          // Fetch user data with the token
          const saleorDomain = getSaleorDomainHeader();
          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
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
            data?: { me?: { email?: string; firstName?: string; id: string; lastName?: string } };
          };

          if (data.data?.me) {
            const me = data.data.me;

            setUser({
              email: me.email ?? "",
              firstName: me.firstName,
              id: me.id,
              lastName: me.lastName,
            });
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [clearAuth]);

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
          body: JSON.stringify({
            query: `
              mutation TokenCreate($email: String!, $password: String!) {
                tokenCreate(email: $email, password: $password) {
                  token
                  refreshToken
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
              errors?: Array<{ message?: unknown }>;
              refreshToken?: string;
              token?: string;
              user?: { email?: string; firstName?: string; id: string; lastName?: string };
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

        setToken(String(tokenValue));

        const loginUser = tokenCreate.user;

        setUser(
          loginUser
            ? {
              email: loginUser.email ?? "",
              firstName: loginUser.firstName,
              id: loginUser.id,
              lastName: loginUser.lastName,
            }
            : null
        );
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [router, setToken]
  );

  const logout = useCallback(async () => {
    clearAuth();
    router.push("/sign-in");
  }, [clearAuth, router]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
