import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { LocalizedLink, redirect } from "@nimara/i18n/routing";
import { QUERY_PARAMS as PAYMENT_QUERY_PARAMS } from "@nimara/infrastructure/payment/consts";

import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getStoreUrl } from "@/foundation/server";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { AddNewPaymentTrigger } from "./components/add-new-payment-trigger";
import { PaymentMethodsList } from "./components/payment-methods-list";

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const [t, { locale }, searchParams, accessToken, services] =
    await Promise.all([
      getTranslations(),
      props.params,
      props.searchParams,
      getAccessToken(),
      getServiceRegistry(),
    ]);
  const userService = await services.getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  if (!user) {
    redirect({ href: paths.signIn.asPath(), locale });
  }

  const [paymentService, region, storeUrl] = await Promise.all([
    services.getPaymentService(),
    getCurrentRegion(),
    getStoreUrl(),
  ]);
  const paymentContext = {
    accessToken: accessToken ?? "",
    channel: region.market.channel,
  };
  let error: ReactNode = null;

  /**
   * Payment methods that take the shopper to their own page come back here,
   * so the tokenization is finished before the list is read.
   */
  const tokenizationId = searchParams[PAYMENT_QUERY_PARAMS.TOKENIZATION_ID];

  if (tokenizationId) {
    const resultProcess = await paymentService.methodProcess({
      ...paymentContext,
      data: {
        setAsDefault:
          searchParams[PAYMENT_QUERY_PARAMS.SET_AS_DEFAULT] === "true",
      },
      id: tokenizationId,
    });

    if (resultProcess.ok) {
      redirect({ href: paths.account.paymentMethods.asPath(), locale });
    }

    error = t.rich("errors.GENERIC_PAYMENT_ERROR", {
      link: (chunks: ReactNode) => (
        <LocalizedLink
          href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
          className="underline"
          target="_blank"
        >
          {chunks}
        </LocalizedLink>
      ),
    });
  }

  const resultPaymentMethods = await paymentService.methodList(paymentContext);

  const paymentMethods: PaymentMethod[] = resultPaymentMethods.ok
    ? resultPaymentMethods.data
    : [];
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div className="flex justify-between">
        <h2 className="text-2xl text-primary">
          {t("payment.payment-methods")}
        </h2>

        {hasPaymentMethods && (
          <AddNewPaymentTrigger storeUrl={storeUrl} variant="outline" />
        )}
      </div>

      <hr />

      <div>
        {hasPaymentMethods ? (
          <PaymentMethodsList methods={paymentMethods} />
        ) : (
          <div className="grid gap-6">
            <p className="text-sm text-stone-500 dark:text-muted-foreground">
              {t("payment.no-payment-methods")}
            </p>
            <div>
              <AddNewPaymentTrigger storeUrl={storeUrl} variant="default" />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
