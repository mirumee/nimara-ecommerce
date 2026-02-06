"use server";

import { RegisterAccountDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

export async function registerAccount(input: {
  channel: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  redirectUrl: string;
}) {
  return executeGraphQL(
    RegisterAccountDocument,
    "RegisterAccountMutation",
    { input },
  );
}
