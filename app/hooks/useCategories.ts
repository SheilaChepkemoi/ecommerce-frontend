"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCategories, type GetCategoriesParams } from "@/app/lib/api/categories";

/** enabled = false: don't call the API yet (e.g. a form that is still closed). */
export function useCategories(params: GetCategoriesParams, enabled = true) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: ({ signal }) => getCategories(params, signal),
    placeholderData: keepPreviousData,
    enabled,
    // The table shows this error itself, so no toast.
    meta: { errorDisplay: "inline" },
  });
}
