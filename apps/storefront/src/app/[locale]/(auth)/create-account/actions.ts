"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { authService } from "@/services";

import { type FormSchema } from "./schema";

export async function registerAccount(values: FormSchema) {
  const region = await getCurrentRegion();

  const { firstName, lastName, email, password } = values;

  const data = await authService.accountRegister({
    firstName,
    lastName,
    email,
    password,
    channel: region?.market?.channel,
    languageCode: region?.language?.code,
    redirectUrl: new URL(
      paths.confirmAccountRegistration.asPath(),
      await getStoreUrl(),
    ).toString(),
  });

  revalidatePath(paths.createAccount.asPath());

  return data;
}
