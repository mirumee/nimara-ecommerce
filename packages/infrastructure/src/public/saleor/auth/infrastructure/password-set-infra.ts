import { graphqlClient } from "#root/graphql/client";

import { PasswordSetMutationDocument } from "../graphql/mutations/generated";
import type { PasswordSetInfra, SaleorAuthServiceConfig } from "../types";

export const saleorPasswordSetInfra =
  ({ apiURL }: SaleorAuthServiceConfig): PasswordSetInfra =>
  async ({ password, email, token }) => {
    const { data } = await graphqlClient(apiURL).execute(
      PasswordSetMutationDocument,
      {
        variables: { password, email, token },
      },
    );

    return {
      errors: data?.setPassword?.errors ?? [],
    };
  };
