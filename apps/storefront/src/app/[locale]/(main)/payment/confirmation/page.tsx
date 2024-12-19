import { getLocale } from "next-intl/server";

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

  let errors: { code: string; type: string }[] = [];

  const paymentResultData = await paymentService.paymentResultProcess({
    checkout,
    searchParams,
  });

  if (paymentResultData.isSuccess) {
    const orderCreateData = await checkoutService.orderCreate({
      id: checkout.id,
    });

    if (orderCreateData.orderId) {
      redirect({
        href: paths.order.confirmation.asPath({
          id: orderCreateData.orderId,
          query: { [QUERY_PARAMS.orderPlace]: "true" },
        }),
        locale,
      });
    } else {
      errors = orderCreateData.errors;
    }
  } else {
    const error = paymentResultData.errors?.[0];
    const errorCode = error ? `${error.type}.${error.code}` : "payment.default";

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
