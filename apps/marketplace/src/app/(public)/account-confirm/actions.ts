"use server";

import { ConfirmVendorAccountDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

export async function confirmAccount(variables: {
  email: string;
  token: string;
}) {
  return executeGraphQL(
    ConfirmVendorAccountDocument,
    "ConfirmVendorAccountMutation",
    variables,
  );
}
