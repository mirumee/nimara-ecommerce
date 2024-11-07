import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { Link, redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { paymentService, userService } from "@/services";

import { AddNewPaymentTrigger } from "./components/add-new-payment-trigger";
import { PaymentMethodsList } from "./components/payment-methods-list";

export default async function Page({ searchParams }: NextPageProps) {
  const accessToken = getAccessToken();

  const [t, region, user] = await Promise.all([
    getTranslations(),
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const customerId = await paymentService.customerGet({
    user: user!,
    channel: region.market.channel,
    environment: clientEnvs.ENVIRONMENT,
    accessToken: serverEnvs.SALEOR_APP_TOKEN,
  });

  let paymentGatewayMethods = [];
  let error = null;

  if (Object.keys(searchParams).length) {
    const { isSuccess } = await paymentService.paymentMethodSaveProcess({
      searchParams,
    });

    if (isSuccess) {
      redirect(paths.account.paymentMethods.asPath());
    } else {
      error = t.rich("errors.payment.default", {
        link: (chunks) => (
          <Link
            href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
            className="underline"
            target="_blank"
          >
            {chunks}
          </Link>
        ),
      });
    }
  }

  if (!customerId) {
    throw new Error("Could not create gateway customer.");
  }

  paymentGatewayMethods = await paymentService.customerPaymentMethodsList({
    customerId,
  });

  const storeUrl = getStoreUrl();
  const hasPaymentMethods = paymentGatewayMethods.length > 0;

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div className="flex justify-between">
        <h2 className="text-2xl">{t("payment.payment-methods")}</h2>

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
            methods={paymentGatewayMethods}
          />
        ) : (
          <div className="grid gap-6">
            <p className="text-sm text-stone-500">
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
