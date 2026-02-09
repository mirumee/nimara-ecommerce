"use server";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type AccountUpdate_Mutation,
  AccountUpdateDocument,
  type AccountUpdateVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { executeGraphQL } from "@/lib/graphql/execute";

export async function updateAccount(input: {
  email?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Array<{ key: string; value: string }>;
}): AsyncResult<AccountUpdate_Mutation> {
  const token = await getServerAuthToken();

  // AccountInput doesn't include 'email' in generated types (it's added via schema extension)
  // AccountUpdateDocument is typed with AccountUpdate (schema type) but we need AccountUpdate_Mutation (document type)
  const variables = {
    input: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      metadata: input.metadata,
    },
  } as AccountUpdateVariables;

  return executeGraphQL(
    AccountUpdateDocument as unknown as Parameters<typeof executeGraphQL<AccountUpdate_Mutation, AccountUpdateVariables>>[0],
    "AccountUpdateMutation",
    variables,
    token,
  );
}
