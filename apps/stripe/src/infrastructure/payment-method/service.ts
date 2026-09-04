import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type WebhookData } from "@nimara/infrastructure/apps/saleor/schemas";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { type PaymentMethodUser } from "@/domain/customer";
import {
  type ListStoredPaymentMethods,
  type PaymentMethodTokenization,
  type StoredPaymentMethodDelete,
} from "@/domain/payment-method";
import {
  type ListStoredPaymentMethodsSubscription,
  type PaymentMethodInitializeTokenizationSessionSubscription,
  type PaymentMethodProcessTokenizationSessionSubscription,
  type StoredPaymentMethodDeleteRequestedSubscription,
} from "@/graphql/generated/client";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { type CustomerRepositoryFactory } from "@/infrastructure/customer/repository";
import { type StripePaymentMethodRepositoryFactory } from "@/infrastructure/payment-method/stripe/repository";
import { type SaleorClient } from "@/infrastructure/saleor/client";

type Deps = {
  appConfigService: AppConfigService;
  appId: string;
  customerRepository: CustomerRepositoryFactory;
  environment: string;
  logger: Logger;
  paymentMethodRepository: StripePaymentMethodRepositoryFactory;
  saleorClient: (opts: {
    authToken?: string;
    saleorDomain: string;
  }) => SaleorClient;
};

export const paymentMethodService = ({
  appConfigService,
  appId,
  customerRepository,
  environment,
  logger,
  paymentMethodRepository,
  saleorClient,
}: Deps) => {
  // Resolve the channel's gateway config and bind both repositories to it.
  const repositoriesFor = async ({
    channelSlug,
    saleorDomain,
  }: {
    channelSlug: string;
    saleorDomain: string;
  }) => {
    const [installResult, gatewayResult] = await Promise.all([
      appConfigService.getBySaleorDomain({ saleorDomain }),
      appConfigService.getPaymentGatewayConfigForChannel({
        saleorDomain,
        channelSlug,
      }),
    ]);

    if (!installResult.ok) {
      return installResult;
    }

    if (!gatewayResult.ok) {
      return gatewayResult;
    }

    return ok({
      customers: customerRepository({
        accountId: gatewayResult.data.accountId,
        appId,
        channelSlug,
        environment,
        logger,
        saleorClient: saleorClient({
          authToken: installResult.data?.authToken,
          saleorDomain,
        }),
        saleorDomain,
        secretKey: gatewayResult.data.secretKey,
      }),
      paymentMethods: paymentMethodRepository({
        appId,
        channelSlug,
        environment,
        logger,
        publicKey: gatewayResult.data.publicKey,
        saleorDomain,
        secretKey: gatewayResult.data.secretKey,
      }),
    });
  };

  type Repositories = Extract<
    Awaited<ReturnType<typeof repositoriesFor>>,
    { ok: true }
  >["data"];

  // Reuse the shopper's gateway user or create one; new ids are saved back.
  const resolveGatewayUserId = async ({
    customers,
    user,
  }: {
    customers: Repositories["customers"];
    user: PaymentMethodUser;
  }): AsyncResult<string> => {
    const existing = await customers.get({ user });

    if (existing) {
      return ok(existing);
    }

    const gatewayUserId = await customers.create({ user });
    const saveResult = await customers.save({
      gatewayUserId,
      userId: user.id,
    });

    if (!saveResult.ok) {
      return saveResult;
    }

    return ok(gatewayUserId);
  };

  return {
    /**
     * Resolves (or creates) the gateway user a signed-in shopper's payments
     * attach to. Used by transaction-initialize so every payment by a
     * signed-in shopper lands on their gateway user. Total — unexpected
     * failures come back as `Err`, so the caller can degrade instead of 500.
     */
    resolveCustomer: async ({
      channelSlug,
      saleorDomain,
      user,
    }: {
      channelSlug: string;
      saleorDomain: string;
      user: PaymentMethodUser;
    }): AsyncResult<string> => {
      const repositories = await repositoriesFor({ saleorDomain, channelSlug });

      if (!repositories.ok) {
        return repositories;
      }

      try {
        return await resolveGatewayUserId({
          customers: repositories.data.customers,
          user,
        });
      } catch (error) {
        logger.error("Failed to resolve the gateway user.", {
          channelSlug,
          error: error instanceof Error ? error.message : String(error),
          userId: user.id,
        });

        return err([
          {
            code: "UNKNOWN_ERROR",
            message: "Failed to resolve the gateway user.",
          },
        ]);
      }
    },

    listStoredPaymentMethods: async ({
      event,
      saleorDomain,
    }: {
      event: WebhookData<ListStoredPaymentMethodsSubscription>;
      saleorDomain: string;
    }): AsyncResult<ListStoredPaymentMethods> => {
      const repositories = await repositoriesFor({
        saleorDomain,
        channelSlug: event.channel.slug,
      });

      if (!repositories.ok) {
        return repositories;
      }

      const gatewayUserId = await repositories.data.customers.get({
        user: event.user,
      });

      // Listing must not create a gateway user — no id simply means no methods.
      if (!gatewayUserId) {
        return ok({ paymentMethods: [] });
      }

      const paymentMethods = await repositories.data.paymentMethods.list({
        gatewayUserId,
        userId: event.user.id,
      });

      return ok({ paymentMethods });
    },

    deleteStoredPaymentMethod: async ({
      event,
      saleorDomain,
    }: {
      event: WebhookData<StoredPaymentMethodDeleteRequestedSubscription>;
      saleorDomain: string;
    }): AsyncResult<StoredPaymentMethodDelete> => {
      const repositories = await repositoriesFor({
        saleorDomain,
        channelSlug: event.channel.slug,
      });

      if (!repositories.ok) {
        return repositories;
      }

      const gatewayUserId = await repositories.data.customers.get({
        user: event.user,
      });

      if (!gatewayUserId) {
        logger.warning("Delete requested for a user without a gateway user.", {
          channelSlug: event.channel.slug,
          paymentMethodId: event.paymentMethodId,
          userId: event.user.id,
        });

        return ok({
          error: "No gateway user for this user.",
          result: "FAILED_TO_DELETE",
        });
      }

      return ok(
        await repositories.data.paymentMethods.delete({
          gatewayUserId,
          paymentMethodId: event.paymentMethodId,
          userId: event.user.id,
        }),
      );
    },

    initializeTokenization: async ({
      event,
      saleorDomain,
    }: {
      event: WebhookData<PaymentMethodInitializeTokenizationSessionSubscription>;
      saleorDomain: string;
    }): AsyncResult<PaymentMethodTokenization> => {
      const repositories = await repositoriesFor({
        saleorDomain,
        channelSlug: event.channel.slug,
      });

      if (!repositories.ok) {
        return repositories;
      }

      const gatewayUserId = await resolveGatewayUserId({
        customers: repositories.data.customers,
        user: event.user,
      });

      if (!gatewayUserId.ok) {
        return gatewayUserId;
      }

      return ok(
        await repositories.data.paymentMethods.create({
          gatewayUserId: gatewayUserId.data,
          userId: event.user.id,
        }),
      );
    },

    processTokenization: async ({
      event,
      saleorDomain,
    }: {
      event: WebhookData<PaymentMethodProcessTokenizationSessionSubscription>;
      saleorDomain: string;
    }): AsyncResult<PaymentMethodTokenization> => {
      const repositories = await repositoriesFor({
        saleorDomain,
        channelSlug: event.channel.slug,
      });

      if (!repositories.ok) {
        return repositories;
      }

      const gatewayUserId = await repositories.data.customers.get({
        user: event.user,
      });

      // A session can only belong to a shopper who already has a gateway user.
      if (!gatewayUserId) {
        return ok({
          error: "Tokenization session does not belong to this user.",
          id: event.id,
          result: "FAILED_TO_TOKENIZE",
        });
      }

      return ok(
        await repositories.data.paymentMethods.create({
          finalizeData: { data: event.data, sessionId: event.id },
          gatewayUserId,
          userId: event.user.id,
        }),
      );
    },
  };
};

export type PaymentMethodService = ReturnType<typeof paymentMethodService>;
