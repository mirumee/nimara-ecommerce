"use server";

import { getLocale } from "next-intl/server";

import { DEFAULT_SORT_BY } from "@/config";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const passThroughParams = ["sortBy", "limit", "q"] as const;

export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  formData: FormData,
) => {
  const formClear = formData.has("clear");
  const params = new URLSearchParams();
  const locale = await getLocale();

  formData.forEach((value, key) => {
    if (key.startsWith("group")) {
      const [k, v] = key.replace("group", "").split("-");

      params.set(k, params.getAll(k).concat(v).join("."));
    } else if (value && typeof value === "string" && !formClear) {
      params.set(key, value);
    }
  });

  passThroughParams.forEach((param) => {
    const formValue = formData.get(param) as string;
    const value = formValue ?? searchParams[param];

    // Sorting can be changed either independently (on desktop)
    // or together with filters (on mobile)
    // that is why it needs some custom logic
    if (param === "sortBy" && value === DEFAULT_SORT_BY) {
      params.delete(param);
    } else if (value) {
      params.set(param, value);
    }
  });

  return redirect({
    href: paths.search.asPath({
      query: Object.fromEntries(params),
    }),
    locale,
  });
};
