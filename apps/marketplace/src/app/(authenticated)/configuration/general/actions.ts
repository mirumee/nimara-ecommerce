"use server";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type AccountUpdateMutation,
  AccountUpdateMutationDocument,
  type AccountUpdateMutationVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { executeGraphQL } from "@/lib/graphql/execute";

export async function updateAccount(input: {
  email?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Array<{ key: string; value: string }>;
}): AsyncResult<AccountUpdateMutation> {
  const token = await getServerAuthToken();

  const variables = {
    input: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      metadata: input.metadata,
    },
  } as AccountUpdateMutationVariables;

  return executeGraphQL<AccountUpdateMutation, AccountUpdateMutationVariables>(
    AccountUpdateMutationDocument,
    "AccountUpdateMutation",
    variables,
    token,
  );
}
