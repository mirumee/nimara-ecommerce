"use server";

import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import {
  type AccountUpdateMutation,
  AccountUpdateMutationDocument,
  type AccountUpdateMutationVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken, getServerVendorId } from "@/lib/auth/server";
import { executeGraphQL } from "@/lib/graphql/execute";
import { configurationService } from "@/services/configuration";
import { vendorsService } from "@/services/vendors";

export async function updateAccount(input: {
  firstName?: string;
  lastName?: string;
  vendorName?: string;
}): AsyncResult<AccountUpdateMutation> {
  const token = await getServerAuthToken();

  const variables = {
    input: {
      firstName: input.firstName,
      lastName: input.lastName,
    },
  } as AccountUpdateMutationVariables;

  const accountResult = await executeGraphQL<
    AccountUpdateMutation,
    AccountUpdateMutationVariables
  >(AccountUpdateMutationDocument, "AccountUpdateMutation", variables, token);

  if (!accountResult.ok) {
    return accountResult;
  }

  if (input.vendorName !== undefined) {
    const vendorPageId = await getServerVendorId();

    if (vendorPageId) {
      const vendorResult = await configurationService.getVendorProfile(
        vendorPageId,
        token,
      );

      if (vendorResult.ok && vendorResult.data.page) {
        const vendorNameAttr = vendorResult.data.page.attributes.find(
          (attr) => attr.attribute.slug === "vendor-name",
        );

        if (vendorNameAttr?.attribute.id) {
          const updateResult = await vendorsService.updateVendorName(
            vendorPageId,
            vendorNameAttr.attribute.id,
            input.vendorName,
            token,
          );

          if (!updateResult.ok) {
            return err(updateResult.errors);
          }

          const pageErrors = updateResult.data.pageUpdate.errors;

          if (pageErrors.length > 0) {
            const [first, ...rest] = pageErrors.map((e) => ({
              code: "UNKNOWN_ERROR" as const,
              message: e.message,
            }));

            return err([first, ...rest]);
          }
        }
      }
    }
  }

  return ok(accountResult.data);
}
