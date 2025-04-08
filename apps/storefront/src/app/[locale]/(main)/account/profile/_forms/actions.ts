"use server";

import { revalidatePath } from "next/cache";

import { err, ok } from "@nimara/domain/objects/Result";

import { auth, getAccessToken, update } from "@/auth";
import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

import type {
  UpdateEmailFormSchema,
  UpdateNameFormSchema,
  UpdatePasswordFormSchema,
} from "./schema";

export async function updateUserName({
  firstName,
  lastName,
}: UpdateNameFormSchema) {
  const session = await auth();

  const accessToken = await getAccessToken();

  const result = await userService.accountUpdate({
    accountInput: {
      firstName,
      lastName,
    },
    accessToken,
  });

  if (!result.ok) {
    return;
  }

  // TODO: In current version of next-auth v5 this doesn't work yet
  await update({
    ...session,
    user: {
      ...session?.user,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
    },
  });

  revalidatePath(paths.account.profile.asPath());

  return result;
}

export async function updateUserEmail({
  email,
  password,
}: UpdateEmailFormSchema) {
  const region = await getCurrentRegion();

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return;
  }

  const data = await userService.requestEmailChange({
    accessToken,
    channel: region.market.channel,
    newEmail: email,
    password,
    redirectUrl: `${await getStoreUrl()}${paths.confirmNewEmail.asPath()}`,
  });

  revalidatePath(paths.account.profile.asPath());

  return data;
}

export async function updateUserPassword({
  newPassword,
  oldPassword,
}: UpdatePasswordFormSchema) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err({ code: "ACCESS_TOKEN_NOT_FOUND" });
  }

  const result = await userService.passwordChange({
    accessToken,
    newPassword,
    oldPassword,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath(paths.account.profile.asPath());

  return ok(true);
}
