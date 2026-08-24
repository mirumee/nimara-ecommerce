import { type SearchParams } from "../types";

export const PASS_THROUGH_PARAMS = ["sortBy", "limit", "q"] as const;

export type PassThroughParam = (typeof PASS_THROUGH_PARAMS)[number];

const GROUP_PREFIX = "group";

const PAGINATION_PARAMS = ["page", "after", "before"] as const;

/**
 * Params that address the result set instead of narrowing it, so neither the
 * product search nor the facet lookup receives them as filters.
 */
const NON_FILTER_PARAMS: string[] = [
  ...PASS_THROUGH_PARAMS,
  ...PAGINATION_PARAMS,
];

export const getFiltersFromSearchParams = (
  searchParams: SearchParams | Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key, value]) => value !== undefined && !NON_FILTER_PARAMS.includes(key),
    ),
  ) as Record<string, string>;

export function processFormData(formData: FormData) {
  const result = {
    toAdd: {} as Record<string, string>,
    toDelete: new Set<string>(),
    passThrough: {} as Record<string, string>,
    shouldClear: formData.has("clear"),
  };

  formData.forEach((value, key) => {
    if (key === "clear") {
      return;
    }

    if (PASS_THROUGH_PARAMS.includes(key as PassThroughParam)) {
      if (typeof value === "string" && value !== "") {
        result.passThrough[key as PassThroughParam] = value;
      }

      return;
    }

    /**
     * Swatch and text choices submit one input per choice, named
     * `group<slug>-<value>`, and collapse into a single dot-joined filter.
     */
    if (key.startsWith(GROUP_PREFIX)) {
      const [k, v] = key.replace(GROUP_PREFIX, "").split("-");
      const existing = result.toAdd[k] || "";

      result.toAdd[k] = existing ? `${existing}.${v}` : v;

      return;
    }

    const allValues = formData
      .getAll(key)
      .filter((v): v is string => typeof v === "string" && v !== "");

    if (allValues.length > 0) {
      result.toAdd[key] = allValues.join(",");
    } else {
      /**
       * A cleared control still submits its name with an empty value, which is
       * what distinguishes "remove this filter" from "leave it untouched".
       */
      result.toDelete.add(key);
    }
  });

  return result;
}
