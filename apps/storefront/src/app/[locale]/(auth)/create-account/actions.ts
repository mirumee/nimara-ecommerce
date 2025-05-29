"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { authService } from "@/services/auth";

import { type FormSchema } from "./schema";

export async function registerAccount(values: FormSchema) {
  const region = await getCurrentRegion();

  const { firstName, lastName, email, password } = values;

  const result = await authService.accountRegister({
    firstName,
    lastName,
    email,
    password,
    channel: region?.market?.channel,
    languageCode: region?.language?.code,
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.confirmAccountRegistration.asPath(),
    ),
  });

  if (result.ok) {
    revalidatePath(paths.createAccount.asPath());
  }

  return result;
}
