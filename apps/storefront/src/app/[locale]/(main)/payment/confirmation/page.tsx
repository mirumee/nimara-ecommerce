import { type Locale } from "next-intl";

import { clientEnvs } from "@/envs/client";
import {
  getCheckoutOrRedirect,
  getMarketplaceCheckoutsOrRedirect,
  getMarketplaceCheckoutSummary,
} from "@/features/checkout/checkout-actions";

import { ProcessingInfo } from "./components/processing-info";

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const isMarketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;

  const [searchParams, checkoutData] = await Promise.all([
    props.searchParams,
    isMarketplaceEnabled
      ? getMarketplaceCheckoutsOrRedirect()
      : getCheckoutOrRedirect(),
  ]);

  const checkout = Array.isArray(checkoutData)
    ? getMarketplaceCheckoutSummary(checkoutData)
    : checkoutData;

  return (
    <div className="w-full text-center">
      <ProcessingInfo checkout={checkout} searchParams={searchParams} />
    </div>
  );
}
