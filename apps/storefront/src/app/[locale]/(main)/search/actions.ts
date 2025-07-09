"use server";

import { getLocale } from "next-intl/server";

import { DEFAULT_SORT_BY } from "@/config";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const PASS_THROUGH_PARAMS = ["sortBy", "limit", "q"] as const;
const GROUP_PREFIX = "group";

/**
 * Processes FormData into a structured object in a single pass.
 */
function processFormData(formData: FormData) {
  const result = {
    filters: {} as Record<string, string>,
    passThrough: {} as Record<string, string>,
    shouldClear: formData.has("clear"),
  };

  formData.forEach((value, key) => {
    // Skip the 'clear' flag itself
    if (key === "clear") {
      return;
    }

    if (PASS_THROUGH_PARAMS.includes(key)) {
      if (typeof value === "string" && value !== "") {
        result.passThrough[key] = value;
      }

      return;
    }

    // Handle special 'group' keys (e.g., 'groupcolor-red')
    if (key.startsWith(GROUP_PREFIX)) {
      const [k, v] = key.replace(GROUP_PREFIX, "").split("-");
      const existing = result.filters[k] || "";

      result.filters[k] = existing ? `${existing}.${v}` : v;

      return;
    }

    // Handle standard multi-value keys
    const allValues = formData
      .getAll(key)
      .filter((v): v is string => typeof v === "string" && v !== "");

    if (allValues.length > 0) {
      result.filters[key] = allValues.join(",");
    }
  });

  return result;
}

/**
 * Handles the form submission for filters, updating the search parameters accordingly.
 *
 * @param searchParams - The current search parameters from the URL.
 * @param formData - The FormData object containing the submitted filter values.
 * @returns A redirect response with updated search parameters.
 */
export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  formData: FormData,
) => {
  const { filters, passThrough, shouldClear } = processFormData(formData);
  const locale = await getLocale();

  // Create a "snapshot" of the initial filters (without pagination params)
  const initialParams = new URLSearchParams(searchParams);

  initialParams.delete("page");
  initialParams.delete("before");
  initialParams.delete("after");
  const initialFiltersString = initialParams.toString();

  // Build the new params from the original searchParams
  const finalParams = new URLSearchParams(searchParams);

  // Reset all old filter keys first for a clean state
  Object.keys(filters).forEach((key) => finalParams.delete(key));

  if (!shouldClear) {
    for (const [key, value] of Object.entries(filters)) {
      finalParams.set(key, value);
    }
  }

  // Handle pass-through params like sortBy etc.
  for (const param of PASS_THROUGH_PARAMS) {
    const value = passThrough[param] ?? searchParams[param];

    if (param === "sortBy" && value === DEFAULT_SORT_BY) {
      finalParams.delete(param);
    } else if (value) {
      finalParams.set(param, value);
    } else {
      finalParams.delete(param);
    }
  }

  const finalParamsForComparison = new URLSearchParams(finalParams);

  finalParamsForComparison.delete("page");
  finalParamsForComparison.delete("before");
  finalParamsForComparison.delete("after");
  const finalFiltersString = finalParamsForComparison.toString();

  // If filters have changed, clear pagination params
  if (initialFiltersString !== finalFiltersString) {
    finalParams.delete("page");
    finalParams.delete("before");
    finalParams.delete("after");
  }

  return redirect({
    href: paths.search.asPath({
      query: Object.fromEntries(finalParams),
    }),
    locale,
  });
};
