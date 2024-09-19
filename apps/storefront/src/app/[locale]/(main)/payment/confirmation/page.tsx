import { redirect } from "next/navigation";

import { getCheckoutOrRedirect } from "@/lib/checkout";
import { paths, QUERY_PARAMS } from "@/lib/paths";
import { checkoutService, paymentService } from "@/services";

import { ProcessingInfo } from "./components/processing-info";

export default async function Page({ searchParams }: NextPageProps) {
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
      redirect(
        paths.order.confirmation.asPath({
          id: orderCreateData.orderId,
          query: { [QUERY_PARAMS.orderPlace]: "true" },
        }),
      );
    } else {
      errors = orderCreateData.errors;
    }
  } else {
    const error = paymentResultData.errors?.[0];
    const errorCode = error ? `${error.type}.${error.code}` : "payment.default";

    redirect(
      paths.checkout.payment.asPath({
        query: {
          [QUERY_PARAMS.errorCode]: errorCode,
        },
      }),
    );
  }

  return (
    <div className="w-full text-center">
      <ProcessingInfo errors={errors} />
    </div>
  );
}
