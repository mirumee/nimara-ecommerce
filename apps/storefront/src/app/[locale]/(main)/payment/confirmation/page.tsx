import { type Locale } from "next-intl";

import { redirect } from "@nimara/i18n/routing";

import { clientEnvs } from "@/envs/client";
import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";

import { ProcessingInfo } from "./components/processing-info";

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const isMarketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;

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

  const [searchParams, checkout] = await Promise.all([
    props.searchParams,
    getCheckoutOrRedirect(),
  ]);

  return (
    <div className="w-full text-center">
      <ProcessingInfo checkout={checkout} searchParams={searchParams} />
    </div>
  );
}
