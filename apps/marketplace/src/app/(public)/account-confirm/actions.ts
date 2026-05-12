"use server";

import { ConfirmVendorAccountDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";
import { publishVendorPageForConfirmedAccount } from "@/lib/saleor/vendor-page-publication";

export async function confirmAccount(variables: {
  email: string;
  token: string;
}) {
  const result = await executeGraphQL(
    ConfirmVendorAccountDocument,
    "ConfirmVendorAccountMutation",
    variables,
  );

  if (!result.ok) {
    return result;
  }

  const user = result.data.confirmAccount?.user;

  if (user?.isActive) {
    const publishResult = await publishVendorPageForConfirmedAccount(
      user.email,
    );

    if (!publishResult.ok) {
      return publishResult;
    }
  }

  return result;
}
