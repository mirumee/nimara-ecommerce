import { cookies } from "next/headers";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";

import { saleorAuthClient } from "@nimara/infrastructure/public/saleor/auth/client";

import { formSchema } from "@/app/[locale]/(auth)/sign-in/schema";
import { userService } from "@/services";

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

        const { email, password } = await formSchema({ t }).parseAsync(
          credentials,
        );

        const { data } = await saleorAuthClient().signIn({
          email,
          password,
        });

        if (data?.tokenCreate?.errors.length) {
          return null;
        }

        await setAccessToken(data.tokenCreate.token!);
        await setRefreshToken(data.tokenCreate.refreshToken!);

        const userData = await userService.userGet(data.tokenCreate.token);

        if (!userData) {
          return null;
        }

        return {
          ...userData,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);
export const update = NextAuth(config).unstable_update;
