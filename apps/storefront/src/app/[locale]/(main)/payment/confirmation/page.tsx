import { type AppErrorCode } from "@nimara/domain/objects/Error";

import { redirect } from "@/i18n/routing";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { paths, QUERY_PARAMS } from "@/lib/paths";
import { type SupportedLocale } from "@/regions/types";
import { checkoutService } from "@/services/checkout";
import { paymentService } from "@/services/payment";

import { ProcessingInfo } from "./components/processing-info";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, searchParams, checkout] = await Promise.all([
    props.params,
    props.searchParams,
    getCheckoutOrRedirect(),
  ]);

  let errors: { code: AppErrorCode }[] = [];

  const resultPaymentProcess = await paymentService.paymentResultProcess({
    checkout,
    searchParams,
  });

  if (resultPaymentProcess.data?.success) {
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
      href: paths.checkout.payment.asPath({
        query: {
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
