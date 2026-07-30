import { useState } from "react";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type Maybe } from "@nimara/domain/objects/Maybe";

import { initializeTransactionAction } from "@/features/payment/actions";
import {
  type PaymentGateway,
  type PaymentGatewayConfig,
  type PaymentSessionData,
} from "@/features/payment/types";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";
import { storefrontLogger } from "@/services/logging";

const paymentServiceLoader = createPaymentServiceLoader(storefrontLogger);

type InitializeTransactionInput = Parameters<
  typeof initializeTransactionAction
>[0];

export const usePaymentData = ({
  onErrors,
}: {
  onErrors: (codes: AppErrorCode[]) => void;
}) => {
  const [initializeData, setInitializeData] =
    useState<Maybe<PaymentGateway>>(undefined);
  const [transactionData, setTransactionData] =
    useState<Maybe<PaymentSessionData>>(undefined);

  const initializeGateway = async (gatewayConfig: PaymentGatewayConfig) => {
    const paymentService = await paymentServiceLoader();
    const result = await paymentService.gatewayInitialize({ gatewayConfig });

    if (!result.ok) {
      onErrors(result.errors.map(({ code }) => code));

      return undefined;
    }

    setInitializeData(result.data);

    return result.data;
  };

  const initializeTransaction = async (
    input: InitializeTransactionInput,
  ): Promise<PaymentSessionData | undefined> => {
    const result = await initializeTransactionAction(input);

    if (!result.ok) {
      onErrors(result.errors.map(({ code }) => code));

      return undefined;
    }

    const gateway = await initializeGateway(result.data.gatewayConfig);

    if (!gateway) {
      return undefined;
    }

    return result.data;
  };

  return {
    initializeData,
    initializeGateway,
    initializeTransaction,
    setTransactionData,
    transactionData,
  };
};
