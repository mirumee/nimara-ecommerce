"use server";

import { handleFiltersFormSubmit as handleFiltersFormSubmitCore } from "@nimara/features/search/shared/actions/handle-filters-form-submit";
import { redirect } from "@nimara/i18n/routing";

import { DEFAULT_SORT_BY } from "@/config";
import { paths } from "@/foundation/routing/paths";

/**
 * Server action wrapper for handling filter form submissions.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const handleFiltersFormSubmit = async (
  searchParams: Record<string, string>,
  formData: FormData,
) => {
  return handleFiltersFormSubmitCore(
    searchParams,
    DEFAULT_SORT_BY,
    formData,
    paths.search.asPath(),
    redirect,
  );
};
