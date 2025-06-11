"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { paths } from "@/lib/paths";
import { authService } from "@/services/auth";

import { type NewPasswordFormSchema } from "./schema";

export async function setPassword({ password }: NewPasswordFormSchema) {
  const searchParams = new URL((await headers()).get("referer")!).searchParams;
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const result = await authService.passwordSet({ email, password, token });

  if (result.ok) {
    revalidatePath(paths.newPassword.asPath());
  }

  const redirectUrl = !result.ok
    ? paths.newPassword.asPath({ query: { error: "true" } })
    : paths.signIn.asPath({ query: { hasPasswordChanged: "true" } });

  return {
    redirectUrl,
  };
}
