"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { paths } from "@/lib/paths";
import { authService } from "@/services";

import { type FormSchema } from "./schema";

export async function setPassword({ password }: FormSchema) {
  const searchParams = new URL((await headers()).get("referer")!).searchParams;
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const data = await authService.passwordSet({ email, password, token });

  revalidatePath(paths.newPassword.asPath());

  const redirectUrl = data?.errors.length
    ? paths.newPassword.asPath({ query: { error: "true" } })
    : paths.signIn.asPath({ query: { hasPasswordChanged: "true" } });

  return {
    redirectUrl,
  };
}
