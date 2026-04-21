import { type Locale } from "next-intl";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { redirect } from "@nimara/i18n/routing";

import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { ProcessingInfo } from "./components/processing-info";

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const isMarketplaceEnabled =
    process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false";

  if (isMarketplaceEnabled) {
    const [{ locale }, searchParams] = await Promise.all([
      props.params,
      props.searchParams,
    ]);
    const redirectStatus = searchParams["redirect_status"];

    if (redirectStatus && redirectStatus !== "succeeded") {
      redirect({
        href: paths.checkout.asPath({
          query: {
            step: "payment",
            [QUERY_PARAMS.errorCode]: "GENERIC_PAYMENT_ERROR",
          },
        }),
        locale,
      });
    }

    redirect({
      href: paths.order.confirmation.asPath({
        id: "marketplace",
        query: { [QUERY_PARAMS.orderPlaced]: "true" },
      }),
      locale,
    });
  }

  const [{ locale }, searchParams, checkout, services] = await Promise.all([
    props.params,
    props.searchParams,
    getCheckoutOrRedirect(),
    getServiceRegistry(),
  ]);

  let errors: { code: AppErrorCode }[] = [];
  const paymentService = await services.getPaymentService();

  const resultPaymentProcess = await paymentService.paymentResultProcess({
    checkout,
    searchParams,
  });

  if (resultPaymentProcess.data?.success) {
    const checkoutService = await services.getCheckoutService();
    const resultOrderCreate = await checkoutService.orderCreate({
      id: checkout.id,
    });

    if (resultOrderCreate.ok) {
      redirect({
        href: paths.order.confirmation.asPath({
          id: resultOrderCreate.data.orderId,
          query: { [QUERY_PARAMS.orderPlaced]: "true" },
        }),
        locale,
      });
    } else {
      errors = resultOrderCreate.errors;
    }
  } else {
    const firstError = resultPaymentProcess.errors?.[0];
    const errorCode = firstError ? firstError.code : "DEFAULT_PAYMENT_ERROR";

    redirect({
      href: paths.checkout.asPath({
        query: {
          step: "payment",
          [QUERY_PARAMS.errorCode]: errorCode,
        },
      }),
      locale,
    });
  }

  return (
    <div className="w-full text-center">
      <ProcessingInfo errors={errors} />
    </div>
  );
}
