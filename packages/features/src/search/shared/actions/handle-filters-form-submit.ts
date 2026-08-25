"use server";

import { getLocale } from "next-intl/server";

import { type Redirect } from "@nimara/i18n/routing";

import {
  PASS_THROUGH_PARAMS,
  type PassThroughParam,
  processFormData,
} from "../helpers/filters";

/**
 * Handles the form submission for filters, updating the search parameters accordingly.
 */
export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  defaultSortBy: string,
  formData: FormData,
  searchPath: string,
  redirect: Redirect,
) => {
  const locale = await getLocale();
  const { toAdd, toDelete, passThrough, shouldClear } =
    processFormData(formData);

  // 1. Create a snapshot of the initial filters (without pagination) to detect changes later.
  const initialParams = new URLSearchParams(searchParams);

  initialParams.delete("page");
  initialParams.delete("before");
  initialParams.delete("after");
  const initialFiltersString = initialParams.toString();

  // 2. Start building the final params from the current URL state.
  const finalParams = new URLSearchParams(searchParams);

  // 3. Apply the filter logic.
  if (shouldClear) {
    // If the 'clear' button was clicked, iterate over the original search params.
    for (const key of Object.keys(searchParams)) {
      // If a param is not a special pass-through param, it's a filter, so delete it.
      if (!PASS_THROUGH_PARAMS.includes(key as PassThroughParam)) {
        finalParams.delete(key);
      }
    }
  } else {
    // If not clearing, apply the changes from the form.
    // a) Delete keys that were submitted with empty values.
    toDelete.forEach((key) => finalParams.delete(key));
    // b) Set or overwrite keys that have new values.
    for (const [key, value] of Object.entries(toAdd)) {
      finalParams.set(key, value);
    }
  }

  // 4. Handle special pass-through parameters like 'sortBy' and 'q'.
  for (const param of PASS_THROUGH_PARAMS) {
    const value = passThrough[param] ?? searchParams[param];

    if (param === "sortBy" && value === defaultSortBy) {
      // Remove 'sortBy' from URL if it's the default value to keep URLs clean.
      finalParams.delete(param);
    } else if (value) {
      finalParams.set(param, value);
    } else {
      finalParams.delete(param);
    }
  }

  // 5. Compare the before/after snapshots to see if filters have changed.
  const finalParamsForComparison = new URLSearchParams(finalParams);

  finalParamsForComparison.delete("page");
  finalParamsForComparison.delete("before");
  finalParamsForComparison.delete("after");
  const finalFiltersString = finalParamsForComparison.toString();

  // If the filters have changed, reset pagination to avoid being on a non-existent page.
  if (initialFiltersString !== finalFiltersString) {
    finalParams.delete("page");
    finalParams.delete("before");
    finalParams.delete("after");
  }

  const queryString = finalParams.toString();
  const url = queryString ? `${searchPath}?${queryString}` : searchPath;

  return redirect({ href: url, locale });
};
