import { useTranslations } from "next-intl";
import { type RefObject } from "react";
import { type SubmitHandler, type UseFormReturn } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import {
  type AppErrorCode,
  type BaseError,
} from "@nimara/domain/objects/Error";
import { type Maybe } from "@nimara/domain/objects/Maybe";
import { schemaToAddress } from "@nimara/foundation/address/address";
import type {
  ExecuteData,
  InitializeData,
  TransactionData,
} from "@nimara/infrastructure/payment/types";
import { useToast } from "@nimara/ui/hooks";

import { updateBillingAddress } from "@/features/payment/checkout/actions";
import {
  type BillingAddressPath,
  type PaymentSchema,
} from "@/features/payment/checkout/schema";
import { isGlobalError } from "@/foundation/errors/errors";
import { paths } from "@/foundation/routing/paths";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";
import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";
import { storefrontLogger } from "@/services/logging";

const paymentServiceLoader = createPaymentServiceLoader(storefrontLogger);
const trackingServiceLoader = createTrackingServiceLoader();

type UsePaymentSubmitProps = {
  checkout: Checkout;
  elementsRef: RefObject<unknown>;
  form: UseFormReturn<PaymentSchema>;
  initializeData: Maybe<InitializeData>;
  isAddingNewPaymentMethod: boolean;
  isProcessing: boolean;
  onExecuteFailure: (
    errors: BaseError[],
    values: PaymentSchema,
  ) => Promise<void> | void;
  /**
   * Supplies the intent the payment is confirmed against. Resolving to
   * nothing aborts the submit.
   */
  resolveTransactionData: (
    values: PaymentSchema,
  ) => Promise<Maybe<TransactionData>>;
  setErrors: (codes: AppErrorCode[]) => void;
  setIsProcessing: (value: boolean) => void;
  storeUrl: string;
};

export const usePaymentSubmit = ({
  checkout,
  elementsRef,
  form,
  initializeData,
  isAddingNewPaymentMethod,
  isProcessing,
  onExecuteFailure,
  resolveTransactionData,
  setErrors,
  setIsProcessing,
  storeUrl,
}: UsePaymentSubmitProps): SubmitHandler<PaymentSchema> => {
  const t = useTranslations();
  const { toast } = useToast();

  return async (values) => {
    const {
      billingAddress,
      paymentMethod,
      sameAsShippingAddress,
      saveAddressForFutureUse,
    } = values;

    if (isProcessing) {
      return false;
    }

    setErrors([]);
    setIsProcessing(true);

    delete billingAddress?.id;

    {
      const result = await updateBillingAddress({
        checkout,
        input: {
          sameAsShippingAddress,
          saveAddressForFutureUse,
          billingAddress,
        },
        revalidateCheckout: false,
      });

      if (!result.ok) {
        result.errors.map(({ field, code }) => {
          if (isGlobalError(field)) {
            toast({ variant: "destructive", description: t(`errors.${code}`) });
          } else {
            form.setError(`billingAddress.${field}` as BillingAddressPath, {
              message: t(`errors.${code}`),
            });
          }
        });

        setIsProcessing(false);

        return;
      }
    }

    const { trackAddPaymentInfo } = await trackingServiceLoader();

    await trackAddPaymentInfo({
      checkout,
      paymentType: isAddingNewPaymentMethod ? paymentMethod : "saved",
    });

    const redirectUrl = `${storeUrl}${paths.payment.confirmation.asPath()}`;
    const paymentService = await paymentServiceLoader();

    if (!initializeData) {
      setIsProcessing(false);

      return;
    }

    const activeTransactionData = await resolveTransactionData(values);

    if (!activeTransactionData) {
      setIsProcessing(false);

      return;
    }

    const billingSource = sameAsShippingAddress
      ? checkout.shippingAddress
      : billingAddress
        ? schemaToAddress(billingAddress)
        : checkout.billingAddress;

    const result = await paymentService.execute({
      data: {
        billingDetails: billingSource
          ? {
              city: billingSource.city ?? "",
              country: (billingSource.country ?? "") as AllCountryCode,
              countryArea: billingSource.countryArea ?? "",
              firstName: billingSource.firstName ?? "",
              lastName: billingSource.lastName ?? "",
              postalCode: billingSource.postalCode ?? "",
              streetAddress1: billingSource.streetAddress1 ?? "",
              streetAddress2: billingSource.streetAddress2 ?? "",
            }
          : undefined,
        elements: isAddingNewPaymentMethod
          ? ((elementsRef.current ?? undefined) as ExecuteData["elements"])
          : undefined,
        email: checkout.email!,
        redirectUrl,
      },
      initializeData,
      transactionData: activeTransactionData,
    });

    if (!result.ok) {
      setErrors(result.errors.map(({ code }) => code));
      setIsProcessing(false);

      await onExecuteFailure(result.errors, values);
    }
  };
};
