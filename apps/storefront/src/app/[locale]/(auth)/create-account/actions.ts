"use server";

import { revalidatePath } from "next/cache";

import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/foundation/server";
import { getAuthService } from "@/services/auth";

import { type FormSchema } from "./schema";

export async function registerAccount(values: FormSchema) {
  const region = await getCurrentRegion();

  const { firstName, lastName, email, password } = values;

  const authService = await getAuthService();
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
