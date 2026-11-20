"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getBrands, type GetBrandsParams } from "@/app/lib/api/brands";

export function useBrands(params: GetBrandsParams) {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: ({ signal }) => getBrands(params, signal),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
    // The table shows this error itself, so no toast.
    meta: { errorDisplay: "inline" },
  });
}
