import { getAccessToken } from "@/auth";
import type { SupportedLocale } from "@/foundation/regions/types";
import { getCheckoutOrRedirect } from "@/others/checkout/checkout-actions";
import { getUserService } from "@/services/user";

import { validateCheckoutStepAction } from "./actions";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, userService] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    getUserService(),
  ]);

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({
    user,
    locale,
    checkout,
    step: null,
  });
}
