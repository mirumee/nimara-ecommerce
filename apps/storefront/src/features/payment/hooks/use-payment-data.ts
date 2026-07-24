import { useEffect, useState } from "react";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type Maybe } from "@nimara/domain/objects/Maybe";
import type {
  InitializeData,
  TransactionData,
} from "@nimara/infrastructure/payment/types";

import { initializeTransactionAction } from "@/features/payment/actions";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";
import { storefrontLogger } from "@/services/logging";

const paymentServiceLoader = createPaymentServiceLoader(storefrontLogger);

type InitializeTransactionInput = Parameters<
  typeof initializeTransactionAction
>[0];

export const usePaymentData = ({
  initialTransactionData,
  onErrors,
}: {
  initialTransactionData?: Maybe<TransactionData>;
  onErrors: (codes: AppErrorCode[]) => void;
}) => {
  const [initializeData, setInitializeData] =
    useState<Maybe<InitializeData>>(undefined);
  const [transactionData, setTransactionData] = useState<
    Maybe<TransactionData>
  >(initialTransactionData);

  useEffect(() => {
    void (async () => {
      const paymentService = await paymentServiceLoader();

      const result = await paymentService.initializeGateway();

      if (!result.ok) {
        onErrors(result.errors.map(({ code }) => code));

        return;
      }

      setInitializeData(result.data);
    })();
  }, []);

  const initializeTransaction = async (
    input: InitializeTransactionInput,
  ): Promise<TransactionData | undefined> => {
    const result = await initializeTransactionAction(input);

    if (!result.ok) {
      onErrors(result.errors.map(({ code }) => code));

      return undefined;
    }

    return result.data;
  };

  return {
    initializeData,
    initializeTransaction,
    setTransactionData,
    transactionData,
  };
};
