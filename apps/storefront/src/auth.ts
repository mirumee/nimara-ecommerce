import { cookies } from "next/headers";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";

import { saleorAuthClient } from "@nimara/infrastructure/auth/client";

import { signInSchema } from "@/components/schema";
import { userService } from "@/services/user";

import { COOKIE_KEY } from "./config";
import { setAccessToken, setRefreshToken } from "./lib/actions/auth";

export const getAccessToken = async () =>
  (await cookies()).get(COOKIE_KEY.accessToken)?.value;

export const getRefreshToken = async () =>
  (await cookies()).get(COOKIE_KEY.refreshToken)?.value;

export const config = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const t = await getTranslations();

        const { email, password } = await signInSchema({ t }).parseAsync(
          credentials,
        );

        const { data } = await (
          await saleorAuthClient()
        ).signIn({ email, password });

        if (data?.tokenCreate?.errors.length) {
          return null;
        }

        const token = data.tokenCreate.token;
        const refreshToken = data.tokenCreate.refreshToken;

        if (!token || !refreshToken) {
          return null;
        }

        await setAccessToken(token);
        await setRefreshToken(refreshToken);

        const resultUserGet = await userService.userGet(data.tokenCreate.token);

        if (!resultUserGet.ok) {
          return null;
        }

        return {
          ...resultUserGet.data,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);
export const update = NextAuth(config).unstable_update;
