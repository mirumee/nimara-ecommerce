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
  const params = new URLSearchParams(searchParams);
  const locale = await getLocale();

  params.delete("before");
  params.delete("after");

  const filterKeys = new Set<string>();

  formData.forEach((_, key) => {
    if (!passThroughParams.includes(key as any)) {
      filterKeys.add(key);
    }
  });

  if (formClear) {
    filterKeys.forEach((key) => params.delete(key));
  } else {
    formData.forEach((_, key) => {
      if (key.startsWith("group")) {
        const [k, v] = key.replace("group", "").split("-");
        const existing = params.get(k);

        params.set(k, existing ? `${existing}.${v}` : v);
      } else {
        const allValues = formData.getAll(key);

        const nonEmpty = allValues.filter(
          (v) => typeof v === "string" && v !== "",
        );

        if (nonEmpty.length > 0) {
          params.set(key, nonEmpty.join(","));
        } else {
          params.delete(key);
        }
      }
    });
  }

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
