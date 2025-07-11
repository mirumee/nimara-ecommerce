import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { type SupportedLocale } from "@/regions/types";
import { lazyLoadService } from "@/services/import";

import { validateCheckoutStepAction } from "./actions";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, userService] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    lazyLoadService("USER"),
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
