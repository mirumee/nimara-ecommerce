import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { LocalizedLink, redirect } from "@nimara/i18n/routing";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getStoreUrl } from "@/foundation/server";
import { getPaymentService } from "@/services/payment";
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

  const [paymentService, region] = await Promise.all([
    getPaymentService(),
    getCurrentRegion(),
  ]);
  const resultCustomerGet = await paymentService.customerGet({
    user: user,
    channel: region.market.channel,
    environment: clientEnvs.ENVIRONMENT,
    accessToken: serverEnvs.SALEOR_APP_TOKEN,
  });

  let error = null;

  if (Object.keys(searchParams).length) {
    const resultPaymentMethodSave =
      await paymentService.paymentMethodSaveProcess({
        searchParams,
      });

    if (resultPaymentMethodSave.ok) {
      redirect({ href: paths.account.paymentMethods.asPath(), locale });
    } else {
      error = t.rich("errors.GENERIC_PAYMENT_ERROR", {
        link: (chunks) => (
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
  }

  if (!resultCustomerGet.ok) {
    throw new Error("Could not create gateway customer.");
  }

  const { customerId } = resultCustomerGet.data;
  const resultCustomerPaymentMethods =
    await paymentService.customerPaymentMethodsList({
      customerId,
    });

  const storeUrl = await getStoreUrl();
  const paymentMethods = resultCustomerPaymentMethods.ok
    ? resultCustomerPaymentMethods.data
    : [];
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div className="flex justify-between">
        <h2 className="text-2xl text-primary">
          {t("payment.payment-methods")}
        </h2>

        {hasPaymentMethods && (
          <AddNewPaymentTrigger
            storeUrl={storeUrl}
            customerId={customerId}
            variant="outline"
          />
        )}
      </div>

      <hr />

      <div>
        {hasPaymentMethods ? (
          <PaymentMethodsList
            customerId={customerId}
            methods={paymentMethods}
          />
        ) : (
          <div className="grid gap-6">
            <p className="text-sm text-stone-500 dark:text-muted-foreground">
              {t("payment.no-payment-methods")}
            </p>
            <div>
              <AddNewPaymentTrigger
                storeUrl={storeUrl}
                customerId={customerId}
                variant="default"
              />
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
