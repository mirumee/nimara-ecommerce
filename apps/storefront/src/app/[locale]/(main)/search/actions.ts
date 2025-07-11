"use server";

import { getLocale } from "next-intl/server";

import { DEFAULT_SORT_BY } from "@/config";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";

/**
 * List of parameters that should be passed through without modification.
 * These are typically used for sorting or search queries.
 */
const PASS_THROUGH_PARAMS = ["sortBy", "limit", "q"] as const;
const GROUP_PREFIX = "group";

/**
 * Processes FormData into a structured object in a single pass.
 * This helps separate form parsing from the main business logic.
 */
function processFormData(formData: FormData) {
  const result = {
    toAdd: {} as Record<string, string>,
    toDelete: new Set<string>(),
    passThrough: {} as Record<string, string>,
    shouldClear: formData.has("clear"),
  };

  formData.forEach((value, key) => {
    // Skip the 'clear' flag itself
    if (key === "clear") {
      return;
    }

    // Handle special pass-through params like 'sortBy'
    if (PASS_THROUGH_PARAMS.includes(key)) {
      if (typeof value === "string" && value !== "") {
        result.passThrough[key] = value;
      }

      return;
    }

    // Handle special 'group' keys (e.g., 'groupcolor-red')
    if (key.startsWith(GROUP_PREFIX)) {
      const [k, v] = key.replace(GROUP_PREFIX, "").split("-");
      const existing = result.toAdd[k] || "";

      result.toAdd[k] = existing ? `${existing}.${v}` : v;

      return;
    }

    // Handle standard multi-value keys
    const allValues = formData
      .getAll(key)
      .filter((v): v is string => typeof v === "string" && v !== "");

    if (allValues.length > 0) {
      // If there are non-empty values, add them to be set in the URL
      result.toAdd[key] = allValues.join(",");
    } else {
      // If the value is empty (e.g., unchecked checkbox), mark the key for deletion
      result.toDelete.add(key);
    }
  });

  return result;
}

/**
 * Handles the form submission for filters, updating the search parameters accordingly.
 */
export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  formData: FormData,
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
      if (!PASS_THROUGH_PARAMS.includes(key)) {
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

    if (param === "sortBy" && value === DEFAULT_SORT_BY) {
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

  return redirect({
    href: paths.search.asPath({
      query: Object.fromEntries(finalParams),
    }),
    locale,
  });
};
