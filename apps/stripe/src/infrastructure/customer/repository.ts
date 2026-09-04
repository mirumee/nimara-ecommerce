import { type Logger } from "@nimara/infrastructure/logging/types";

import { type CustomerRepository } from "@/domain/customer";
import { type SaleorClient } from "@/infrastructure/saleor/client";
import { getStripeApi } from "@/infrastructure/utils";

import { getCustomerIdInfra } from "./saleor/get-customer-id";
import { saveCustomerInfra } from "./saleor/save-customer";
import { createCustomerInfra } from "./stripe/create-customer";

export type CustomerRepositoryOpts = {
  accountId?: string;
  appId: string;
  channelSlug: string;
  environment: string;
  logger: Logger;
  saleorClient: SaleorClient;
  saleorDomain: string;
  secretKey: string;
};

export const customerRepository = ({
  accountId,
  appId,
  channelSlug,
  environment,
  logger,
  saleorClient,
  saleorDomain,
  secretKey,
}: CustomerRepositoryOpts): CustomerRepository => {
  let cachedAccountId: Promise<string> | undefined;

  const resolveAccountId = () => {
    if (cachedAccountId) {
      return cachedAccountId;
    }

    cachedAccountId = accountId
      ? Promise.resolve(accountId)
      : getStripeApi(secretKey)
          .accounts.retrieve()
          .then((account) => account.id);

    return cachedAccountId;
  };

  return {
    create: createCustomerInfra({
      appId,
      channelSlug,
      environment,
      saleorDomain,
      secretKey,
    }),
    get: async (opts) =>
      getCustomerIdInfra({
        accountId: await resolveAccountId(),
        channelSlug,
      })(opts),
    save: async (opts) =>
      saveCustomerInfra({
        accountId: await resolveAccountId(),
        channelSlug,
        logger,
        saleorClient,
      })(opts),
  };
};

export type CustomerRepositoryFactory = typeof customerRepository;
