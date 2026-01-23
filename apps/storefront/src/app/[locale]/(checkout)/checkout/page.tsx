import type { SupportedLocale } from "@nimara/i18n/config";

import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { validateCheckoutStepAction } from "./actions";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, services] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({
    user,
    locale,
    checkout,
    step: null,
  });
}
