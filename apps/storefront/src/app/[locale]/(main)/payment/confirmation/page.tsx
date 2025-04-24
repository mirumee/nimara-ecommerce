import { getLocale } from "next-intl/server";

import { type AppErrorCode } from "@nimara/domain/objects/Error";

import { redirect } from "@/i18n/routing";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { paths, QUERY_PARAMS } from "@/lib/paths";
import { checkoutService, paymentService } from "@/services";

import { ProcessingInfo } from "./components/processing-info";

type SearchParams = Promise<Record<string, string>>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const checkout = await getCheckoutOrRedirect();

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
    const errorCode = firstError ? firstError.code : "payment.default";

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
