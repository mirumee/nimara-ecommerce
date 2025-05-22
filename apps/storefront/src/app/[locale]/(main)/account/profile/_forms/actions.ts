"use server";

import { revalidatePath } from "next/cache";

import { type BaseError } from "@nimara/domain/objects/Error";
import { err } from "@nimara/domain/objects/Result";

import { auth, getAccessToken, update } from "@/auth";
import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services/user";

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

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR",
        field: undefined,
      } satisfies BaseError,
    ]);
  }

  const result = await userService.accountUpdate({
    accountInput: {
      firstName,
      lastName,
    },
    accessToken,
  });

  if (!result.ok) {
    return result;
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
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR",
        field: undefined,
      } satisfies BaseError,
    ]);
  }

  const result = await userService.requestEmailChange({
    accessToken,
    channel: region.market.channel,
    newEmail: email,
    password,
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.confirmNewEmail.asPath(),
    ),
  });

  if (result.ok) {
    revalidatePath(paths.account.profile.asPath());
  }

  return result;
}

export async function updateUserPassword({
  newPassword,
  oldPassword,
}: UpdatePasswordFormSchema) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR",
        field: undefined,
      } satisfies BaseError,
    ]);
  }

  const result = await userService.passwordChange({
    accessToken,
    newPassword,
    oldPassword,
  });

  if (result.ok) {
    revalidatePath(paths.account.profile.asPath());
  }

  return result;
}
