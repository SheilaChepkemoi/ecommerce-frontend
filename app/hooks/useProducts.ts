"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getProducts } from "@/app/lib/api/products";
import type { GetProductsParams } from "@/app/types/products";

export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) => getProducts(params, signal),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
    // The table shows this error itself, so no toast.
    meta: { errorDisplay: "inline" },
  });
}
