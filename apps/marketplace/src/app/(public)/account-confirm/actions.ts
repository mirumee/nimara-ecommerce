"use server";

import { ConfirmAccountDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

export async function confirmAccount(variables: {
  email: string;
  token: string;
}) {
  return executeGraphQL(ConfirmAccountDocument, "ConfirmAccountMutation", variables);
}
