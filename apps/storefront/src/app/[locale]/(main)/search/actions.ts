"use server";

import { DEFAULT_SORT_BY } from "@/config";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";

const passThroughParams = ["sortBy", "limit", "q"] as const;

export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  formData: FormData,
) => {
  const formClear = formData.has("clear");
  const params = new URLSearchParams();

  const region = await getCurrentRegion();

  formData.forEach((value, key) => {
    if (key.startsWith("group")) {
      const [k, v] = key.replace("group", "").split("-");

      params.set(k, params.getAll(k).concat(v).join("."));
    } else if (value && typeof value === "string" && !formClear) {
      params.set(key, value);
    }
  });

  passThroughParams.forEach((param) => {
    const paramsValue = searchParams[param];
    const formValue = formData.get(param) as string;

    // Sorting can be changed either independently (on desktop)
    // or together with filters (on mobile)
    // that is why it needs some custom logic
    if (param === "sortBy") {
      const value = formValue ?? paramsValue;

      if (value !== DEFAULT_SORT_BY) {
        params.set(param, value);
      } else {
        params.delete(param);
      }
    }

    if (searchParams[param]) {
      params.set(param, searchParams[param]);
    }
  });

  return redirect({
    href: paths.search.asPath({
      query: Object.fromEntries(params),
    }),
    locale: region.language.locale,
  });
};
